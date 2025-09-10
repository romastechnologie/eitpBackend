import { Request, Response } from "express";
import { User } from '../entity/user.entity';
import bcryptjs = require('bcryptjs');
import { myDataSource } from '../../../configs/data-source';
import { generateServerErrorCode, success, validateMessage } from '../../../configs/response';
import { ValidationError, validate } from 'class-validator';
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";

//  Créer un utilisateur
export const createUser = async (req: Request, res: Response) => {
    const userRepository = myDataSource.getRepository(User);
    const { telephone,  nom, prenom } = req.body;

    try {
        req.body.telephone = telephone?.replace(/\s/g, '');
        let user: any = userRepository.create(req.body);
        const errors = await validate(user);

        if (errors.length > 0) {
            const message = validateMessage(errors);
            return generateServerErrorCode(res, 400, errors, message);
        }

        user = await userRepository.save(user);

       

        const message = `L'utilisateur ${nom} a bien été créé.`;
        return success(res, 201, user, message);

    } catch (error) {
        if (error instanceof ValidationError) {
            return generateServerErrorCode(res, 400, error, 'Cet utilisateur existe déjà.');
        }
        if (error.code === "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, 'Cet utilisateur existe déjà.');
        }
        const message = `L'utilisateur n'a pas pu être ajouté. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};

//  Liste paginée des utilisateurs
export const getAllUsers = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, User);

    try {
        const userRepository = myDataSource.getRepository(User);

        let reque = userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect("user.role", "Role")
            .where("user.deletedAt IS NULL");

        if (searchQueries.length > 0) {
            reque.andWhere(new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
            }));
        }

        const [data, totalElements] = await reque.skip(startIndex)
            .take(limit)
            .getManyAndCount();

        const message = 'La liste des utilisateurs a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res, 200, { data, totalPages, totalElements, limit }, message);
    } catch (error) {
        const message = `Erreur lors de la récupération des utilisateurs. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};

//  Récupérer un utilisateur par ID (userCreation dans le body)
export const getUser = async (req: Request, res: Response) => {
  await myDataSource.getRepository(User).findOne({
    where: { id: parseInt(req.body.userCreation) },
    relations: { role: true }
  }).then(user => {
      if(user === null) {
        const message = `L'utilisateur demandé n'existe pas. Réessayez avec un autre identifiant.`
        return generateServerErrorCode(res,400,"L'id n'existe pas",message)
      }
      const { password, ...data } = user;
      const message = "L'utilisateur a bien été trouvé."
      return success(res,200, data,message);
    })
    .catch(error => {
      const message = `L'utilisateur n'a pas pu être récupéré. Réessayez dans quelques instants.`
      return generateServerErrorCode(res,500,error,message)
  })
};

//  Mise à jour utilisateur
export const updateUser = async (req: Request, res: Response) => {
  const { nom, prenom, telephone, email, sexe } = req.body;
  let user = await myDataSource.getRepository(User).findOne({
    where:{ id: parseInt(req.body.userCreation) },
  })
  if (!user) {
      return generateServerErrorCode(res,400,"L'id n'existe pas",'Utilisateur introuvable')
  }
  user = myDataSource.getRepository(User).merge(user,{ nom,prenom, telephone, email, sexe });
  const errors = await validate(user)
  if (errors.length > 0) {
      const message = validateMessage(errors);
      return generateServerErrorCode(res,400,errors,message)
  }
  await myDataSource.getRepository(User).save(user)
  .then(user => {
      const message = `L'utilisateur ${req.body.nom} a bien été modifié.`
      return success(res,200, user,message);
  })
  .catch(error => {
      if(error instanceof ValidationError || error.code == "ER_DUP_ENTRY") {
          return generateServerErrorCode(res,400,error,'Cet utilisateur existe déjà')
      }
      const message = `L'utilisateur n'a pas pu être ajouté. Réessayez dans quelques instants.`
      return generateServerErrorCode(res,500,error,message)
  })
};

//  Récupérer utilisateur par ID (param)
export const getUsers = async (req: Request, res: Response) => {
  await myDataSource.getRepository(User).findOne({
    where: { id: parseInt(req.params.id) },
    relations: { role: true }
  }).then(user => {
      if(user === null) {
        const message = `L'utilisateur demandé n'existe pas.`
        return generateServerErrorCode(res,400,"L'id n'existe pas",message)
      }
      const message = "L'utilisateur a bien été trouvé."
      return success(res,200, user,message);
    })
    .catch(error => {
      const message = `L'utilisateur n'a pas pu être récupéré.`
      return generateServerErrorCode(res,500,error,message)
  })
};

//  Mettre à jour mot de passe
export const updatePassword = async (req: Request, res: Response) => {
    const { password,newPassword }  =  req.body;
    if (!password || !newPassword) {
        return generateServerErrorCode(res,400,'Invalid Credentials',"Tous les champs obligatoires ne sont pas remplis");
    }
    if (password == newPassword) {
        return generateServerErrorCode(res,400,'Invalid Credentials',"Le nouveau mot de passe doit être différent de l'ancien mot de passe");
    }
    const utilisateur = await myDataSource.getRepository(User)
    .createQueryBuilder("u")
    .where("id = :identifiant", { identifiant: req.body.userCreation })
    .getOne();

    if (!await bcryptjs.compare(password, utilisateur.password)) {
        return generateServerErrorCode(res,400,'Invalid Credentials',"Ancien mot de passe incorrect");
    }

    const userdat = myDataSource.getRepository(User).merge(utilisateur,{password:await bcryptjs.hash(newPassword, 12)});
    await myDataSource.getRepository(User).save(userdat)
    .then(user => {
        const message = `Le mot de passe a bien été modifié.`
        return success(res,200, user,message);
    })
    .catch(error => {
        if(error instanceof ValidationError || error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cet utilisateur existe déjà')
        }
        const message = `Erreur lors de la modification du mot de passe.`
        return generateServerErrorCode(res,500,error,message)
    });
};

export const ChangerPasswordAdmin = async (req: Request, res: Response) => {
  await myDataSource.getRepository(User)
    .createQueryBuilder("u")
    .update({ password: await bcryptjs.hash(req.body.newPassword, 12) })
    .where("id = :identifiant", { identifiant: req.params.id })
    .execute()
    .then(user => {
      const message = `La modification du mot de passe s'est bien passée.`
      return success(res, 200, user, message);
    })
    .catch(error => {
      if (error instanceof ValidationError) {
        return generateServerErrorCode(res, 400, error, 'Cet utilisateur existe déjà')
      }
      if (error.code == "ER_DUP_ENTRY") {
        return generateServerErrorCode(res, 400, error, 'Cet utilisateur existe déjà')
      }
      const message = `L'utilisateur n'a pas pu être ajouté. Réessayez dans quelques instants.`
      return generateServerErrorCode(res, 500, error, message)
    });
};

//  Suppression utilisateur
export const deleteUser = async (req: Request, res: Response) => {
  const resultat = await checkRelationsOneToMany('User', parseInt(req.params.id));
  await myDataSource.getRepository(User).findOneBy({id: parseInt(req.params.id)}).then(user => {        
      if(user === null) {
        const message = `L'utilisateur demandé n'existe pas.`
        return generateServerErrorCode(res,400,"L'id n'existe pas",message);
      }
      if(resultat){
        const message = `Cet utilisateur est lié à d'autres enregistrements. Suppression impossible.`
        return generateServerErrorCode(res,400,message,message);
      }else{
        myDataSource.getRepository(User).softRemove(user)
        .then(_ => {
            const message = `L'utilisateur avec l'identifiant n°${user.id} a bien été supprimé.`;
            return success(res,200, user,message);
        })
      }
  })
  .catch(error => {
      const message = `Erreur lors de la suppression.`
      return generateServerErrorCode(res,500,error,message)
  })
};

//  Activer / désactiver utilisateur
export const switchUser = async (req: Request, res: Response) => {
    try {
        const utilisateurId = parseInt(req.params.id);
        const utilisateurToUpdate = await myDataSource.getRepository(User).findOneBy({ id: utilisateurId });

        if (!utilisateurToUpdate) {
            return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Utilisateur introuvable');
        }

        utilisateurToUpdate.statut = !utilisateurToUpdate.statut;
        await myDataSource.getRepository(User).save(utilisateurToUpdate);

        const statusMessage = utilisateurToUpdate.statut ? 'activé' : 'désactivé';
        const successMessage = `L'utilisateur a bien été ${statusMessage}.`;
        return success(res, 200, utilisateurToUpdate, successMessage);
    } catch (error) {
        return generateServerErrorCode(res, 500, error, `Erreur lors de la mise à jour.`);
    }
};

