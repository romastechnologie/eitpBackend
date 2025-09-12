import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Inscription } from "../entity/Inscription";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";
import { Parent } from "../entity/Parent";
import { Etudiant } from "../entity/Etudiant";
import { ParentEtudiant } from "../entity/ParentEtudiant";



/*export const createInscription = async (req: Request, res: Response) => {
  console.log("Corps reçu :", req.body);

  const inscriptionData = {
    nom: req.body.nom,
    description: req.body.description,
    link: req.body.link,
  };

  if (!Array.isArray(req.body.users) || req.body.users.length === 0) {
    return generateServerErrorCode(res, 400, null, "Le inscription doit avoir au moins un utilisateur associé.");
  }

  try {
    const result = await myDataSource.manager.transaction(async (manager) => {
      // Création du inscription
      const inscription = manager.create(Inscription, inscriptionData);

      const inscriptionErrors = await validate(inscription);
      if (inscriptionErrors.length > 0) {
        throw new Error(validateMessage(inscriptionErrors));
      }

      const savedInscription = await manager.save(Inscription, inscription);
      console.log("Inscription enregistré :", savedInscription);

      // Création des associations Inscription
      const userInscriptions: Inscription[] = [];
      for (const userId of req.body.users) {
        const user = await manager.findOne(User, { where: { id: userId } });
        if (!user) {
          throw new Error(`Utilisateur avec ID ${userId} introuvable`);
        }

        const userInscription = manager.create(Inscription, {
          estActif: true,
          inscription: savedInscription,
          user: user,
        });

        const userInscriptionErrors = await validate(userInscription);
        if (userInscriptionErrors.length > 0) {
          throw new Error(validateMessage(userInscriptionErrors));
        }

        userInscriptions.push(userInscription);
      }

      await manager.save(Inscription, userInscriptions);
      console.log("Inscription enregistrés :", userInscriptions.length);

      return { inscription: savedInscription, nbUsers: userInscriptions.length };
    });

    const message = `Le inscription ${result.inscription.nom} a bien été créé avec ${result.nbUsers} utilisateur(s) associé(s).`;
    return success(res, 201, result.inscription, message);

  } catch (error: any) {
    console.log("Erreur transaction création inscription :", error);

    if (error.code === "ER_DUP_ENTRY") {
      return generateServerErrorCode(res, 400, error, "Un inscription avec ce nom existe déjà.");
    }

    return generateServerErrorCode(
      res,
      500,
      error,
      error.message || "Le inscription n'a pas pu être créé. Réessayez plus tard."
    );
  }
};*/



export const createEtudiantEtParent = async (
  etudiantData: Partial<Etudiant>,
  parentData: Partial<Parent>
) => {
  const queryRunner = myDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Création du parent
    const parent = queryRunner.manager.create(Parent, parentData);
    await queryRunner.manager.save(parent);

    // 2. Création de l’étudiant
    const etudiant = queryRunner.manager.create(Etudiant, etudiantData);
    await queryRunner.manager.save(etudiant);

    // 3. Création de la relation ParentEtudiant
    const parentEtudiant = queryRunner.manager.create(ParentEtudiant, {
      etudiant,
      parent,
    });
    await queryRunner.manager.save(parentEtudiant);

    // 4. Valider la transaction
    await queryRunner.commitTransaction();

    return { etudiant, parent, parentEtudiant };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};





export const getAllInscription = async (req: Request, res: Response) => {
  const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Inscription);

  try {
    let reque = myDataSource.getRepository(Inscription)
      .createQueryBuilder("inscription")
      .leftJoinAndSelect("inscription.userInscriptions", "userInscription")   
      .leftJoinAndSelect("userInscription.user", "user")         
      .where("inscription.deletedAt IS NULL");
    if (searchQueries.length > 0) {
      reque.andWhere(
        new Brackets(qb => {
          qb.where(searchQueries.join(" OR "), { keyword: `%${searchTerm}%` });
        })
      );
    }

    const [data, totalElements] = await reque
      .skip(startIndex)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalElements / limit);
    const message = "La liste des inscriptions a bien été récupérée.";

    return success(res, 200, { data, totalPages, totalElements, limit }, message);
  } catch (error) {
    const message = "La liste des inscriptions n'a pas pu être récupérée. Réessayez dans quelques instants.";
    return generateServerErrorCode(res, 500, error, message);
  }
};


export const getAllInscriptions= async (req: Request, res: Response) => {
    await myDataSource.getRepository(Inscription).find({
        relations:{
            
        }
    })
    .then((retour) => {
        const message = 'La liste des inscriptions a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des inscriptions n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getInscription = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Inscription).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //inscription:true,
    },
    })
    .then(inscription => {
        if(inscription === null) {
          const message = `Le inscription demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le inscription de méda a bien été trouvé.`
        return success(res,200, inscription,message);
    })
    .catch(error => {
        const message = `Le inscription n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateInscription = async (req: Request, res: Response) => {
    const inscription = await myDataSource.getRepository(Inscription).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //inscription:true,
        },
    }
    )
    if (!inscription) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Inscription).merge(inscription,req.body);
    const errors = await validate(inscription);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Inscription).save(inscription).then(inscription => {
        const message = `Le inscription ${inscription.id} a bien été modifié.`
        return success(res,200, inscription,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce inscription de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce inscription de média existe déjà')
        }
        const message = `Le inscription n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteInscription = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Inscription', parseInt(req.params.id));
    await myDataSource.getRepository(Inscription)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(inscription => {        
        if(inscription === null) {
          const message = `Le inscription demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Ce inscription de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce inscription de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Inscription).softRemove(inscription)
            .then(_ => {
                const message = `Le inscription avec l'identifiant n°${inscription.id} a bien été supprimé.`;
                return success(res,200, inscription,message);
            })
        }
    }).catch(error => {
        const message = `Le inscription n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
