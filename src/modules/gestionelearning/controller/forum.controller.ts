import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Forum } from "../entity/Forum";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { UserForum } from "../entity/UserForum";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";

// export const createForum = async (req: Request, res: Response) => {
//     const forum = myDataSource.getRepository(Forum).create(req.body);
//     const errors = await validate(forum)
//     if (errors.length > 0) {
//         const message = validateMessage(errors);
//         return generateServerErrorCode(res,400,errors,message)
//     }
//     await myDataSource.getRepository(Forum).save(forum)
//     .then((forum_ : Forum | Forum[]) => {
//         const nom = !isArray(forum_) ? forum_.nom : '';
//         const message = `Le forum ${nom} a bien été créé.`
//         return success(res,201, forum,message);
//     })
//     .catch(error => {
//         if(error instanceof ValidationError) {
//             return generateServerErrorCode(res,400,error,'Ce forum existe déjà.')
//         }
//         if(error.code == "ER_DUP_ENTRY") {
//             return generateServerErrorCode(res,400,error,'Ce forum existe déjà.')
//         }
//         const message = `Le forum n'a pas pu être ajouté. Réessayez dans quelques instants.`
//         return generateServerErrorCode(res,500,error,message)
//     })
// }


export const createForum = async (req: Request, res: Response) => {
  console.log("Corps reçu :", req.body);

  const forumData = {
    nom: req.body.nom,
    description: req.body.description,
    link: req.body.link,
  };

  if (!Array.isArray(req.body.users) || req.body.users.length === 0) {
    return generateServerErrorCode(res, 400, null, "Le forum doit avoir au moins un utilisateur associé.");
  }

  try {
    const result = await myDataSource.manager.transaction(async (manager) => {
      // Création du forum
      const forum = manager.create(Forum, forumData);

      const forumErrors = await validate(forum);
      if (forumErrors.length > 0) {
        throw new Error(validateMessage(forumErrors));
      }

      const savedForum = await manager.save(Forum, forum);
      console.log("Forum enregistré :", savedForum);

      // Création des associations UserForum
      const userForums: UserForum[] = [];
      for (const userId of req.body.users) {
        const user = await manager.findOne(User, { where: { id: userId } });
        if (!user) {
          throw new Error(`Utilisateur avec ID ${userId} introuvable`);
        }

        const userForum = manager.create(UserForum, {
          estActif: true,
          forum: savedForum,
          user: user,
        });

        const userForumErrors = await validate(userForum);
        if (userForumErrors.length > 0) {
          throw new Error(validateMessage(userForumErrors));
        }

        userForums.push(userForum);
      }

      await manager.save(UserForum, userForums);
      console.log("UserForum enregistrés :", userForums.length);

      return { forum: savedForum, nbUsers: userForums.length };
    });

    const message = `Le forum ${result.forum.nom} a bien été créé avec ${result.nbUsers} utilisateur(s) associé(s).`;
    return success(res, 201, result.forum, message);

  } catch (error: any) {
    console.log("Erreur transaction création forum :", error);

    if (error.code === "ER_DUP_ENTRY") {
      return generateServerErrorCode(res, 400, error, "Un forum avec ce nom existe déjà.");
    }

    return generateServerErrorCode(
      res,
      500,
      error,
      error.message || "Le forum n'a pas pu être créé. Réessayez plus tard."
    );
  }
};







export const getAllForum = async (req: Request, res: Response) => {
  const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Forum);

  try {
    let reque = myDataSource.getRepository(Forum)
      .createQueryBuilder("forum")
      .leftJoinAndSelect("forum.userForums", "userForum")   
      .leftJoinAndSelect("userForum.user", "user")         
      .where("forum.deletedAt IS NULL");
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
    const message = "La liste des forums a bien été récupérée.";

    return success(res, 200, { data, totalPages, totalElements, limit }, message);
  } catch (error) {
    const message = "La liste des forums n'a pas pu être récupérée. Réessayez dans quelques instants.";
    return generateServerErrorCode(res, 500, error, message);
  }
};


export const getAllForums= async (req: Request, res: Response) => {
    await myDataSource.getRepository(Forum).find({
        relations:{
            
        }
    })
    .then((retour) => {
        const message = 'La liste des forums a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des forums n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getForum = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Forum).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //forum:true,
    },
    })
    .then(forum => {
        if(forum === null) {
          const message = `Le forum demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le forum de méda a bien été trouvé.`
        return success(res,200, forum,message);
    })
    .catch(error => {
        const message = `Le forum n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateForum = async (req: Request, res: Response) => {
    const forum = await myDataSource.getRepository(Forum).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //forum:true,
        },
    }
    )
    if (!forum) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Forum).merge(forum,req.body);
    const errors = await validate(forum);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Forum).save(forum).then(forum => {
        const message = `Le forum ${forum.id} a bien été modifié.`
        return success(res,200, forum,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce forum de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce forum de média existe déjà')
        }
        const message = `Le forum n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteForum = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Forum', parseInt(req.params.id));
    await myDataSource.getRepository(Forum)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(forum => {        
        if(forum === null) {
          const message = `Le forum demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Ce forum de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce forum de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Forum).softRemove(forum)
            .then(_ => {
                const message = `Le forum avec l'identifiant n°${forum.id} a bien été supprimé.`;
                return success(res,200, forum,message);
            })
        }
    }).catch(error => {
        const message = `Le forum n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
