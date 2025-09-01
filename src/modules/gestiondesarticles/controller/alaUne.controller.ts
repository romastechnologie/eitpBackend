import { myDataSource } from "../../../configs/data-source";
import {
  generateServerErrorCode,
  success,
  validateMessage,
} from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { AlaUne } from "../entity/AlaUne";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Apropos } from "../../gestiondesparametres/entity/Apropos";

export const createAlaUne = async (req: Request, res: Response) => {
  if (req["files"]) {
    for (let i in req["files"]) {
      req.body[i] = req["files"][i][0].originalname;
    }
  }
  const article = myDataSource.getRepository(AlaUne).create(req.body);
  const errors = await validate(article);
  if (errors.length > 0) {
    const message = validateMessage(errors);
    return generateServerErrorCode(res, 400, errors, message);
  }
  await myDataSource
    .getRepository(AlaUne)
    .save(article)
    .then((article) => {
      const message = `L'article ${req.body.titre} a bien été créé.`;
      return success(res, 201, article, message);
    })
    .catch((error) => {
      if (error instanceof ValidationError) {
        return generateServerErrorCode(
          res,
          400,
          error,
          "Cet article existe déjà"
        );
      }
      if (error.code == "ER_DUP_ENTRY") {
        return generateServerErrorCode(
          res,
          400,
          error,
          "Cet article existe déjà"
        );
      }
      const message = `L'article n'a pas pu être ajouté. Réessayez dans quelques instants.`;
      return generateServerErrorCode(res, 500, error, message);
    });
};

// export const getAllAlaUne = async (req: Request, res: Response) => {
//     const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, AlaUne);
//     await myDataSource.getRepository(AlaUne).find({
//         relations:{
//             medias:true,
//             user:true,
//         }
//     })
//     .then((retour) => {
//         const message = 'La liste des articles a bien été récupérée.';
//         return success(res,200,{data:retour}, message);
//     }).catch(error => {
//         const message = `La liste des articles n'a pas pu être récupérée. Réessayez dans quelques instants.`
//         //res.status(500).json({ message, data: error })
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getAllAlaUne = async (req: Request, res: Response) => {
  const { page, limit, searchTerm, startIndex, searchQueries } =
    paginationAndRechercheInit(req, AlaUne);
  let reque = await myDataSource
    .getRepository(AlaUne)
    .createQueryBuilder("ala_une")
    .where("ala_une.deletedAt IS NULL");
  if (searchQueries.length > 0) {
    reque.andWhere(
      new Brackets((qb) => {
        qb.where(searchQueries.join(" OR "), { keyword: `%${searchTerm}%` });
      })
    );
  }
  reque
    .skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
      const message = "La liste des articles a bien été récupéré.";
      const totalPages = Math.ceil(totalElements / limit);
      return success(
        res,
        200,
        { data, totalPages, totalElements, limit },
        message
      );
    })
    .catch((error) => {
      const message = `La liste des articles n'a pas pu être récupéré. Réessayez dans quelques instants.`;
      return generateServerErrorCode(res, 500, error, message);
    });
};

export const getAlaUne = async (req: Request, res: Response) => {
  await myDataSource
    .getRepository(AlaUne)
    .findOne({
      where: {
        id: parseInt(req.params.id),
      },
    })
    .then((article) => {
      if (article === null) {
        const message = `L'article demandé n'existe pas. Réessayez avec un autre identifiant.`;
        return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
      }
      const message = `L'article a bien été trouvé.`;
      return success(res, 200, article, message);
    })
    .catch((error) => {
      const message = `L'article n'a pas pu être récupéré. Réessayez dans quelques instants.`;
      return generateServerErrorCode(res, 500, error, message);
    });
};

// export const updateAlaUne = async (req: Request, res: Response) => {
//     const article = await myDataSource.getRepository(AlaUne).findOne(
//        {
//         where: {
//             id: parseInt(req.params.id),
//         },
//         // relations: {
//         //     medias:true,
//         //     articles:true,
//         //     user:true,
//         // },
//     }
//     )
//     if (!article) {
//         return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
//     }
//     myDataSource.getRepository(AlaUne).merge(article,req.body);
//     const errors = await validate(article);
//     if (errors.length > 0) {
//         const message = validateMessage(errors);
//         return generateServerErrorCode(res,400,errors,message)
//     }
//     await myDataSource.getRepository(AlaUne).save(article).then(AlaUne => {
//         const message = `L'article ${article.id} a bien été modifié.`
//         return success(res,200, AlaUne,message);
//     }).catch(error => {
//         if(error instanceof ValidationError) {
//             return generateServerErrorCode(res,400,error,'Cet article existe déjà')
//         }
//         if(error.code == "ER_DUP_ENTRY") {
//             return generateServerErrorCode(res,400,error,'Cet article existe déjà')
//         }
//         const message = `L'article n'a pas pu être ajouté. Réessayez dans quelques instants.`
//         return generateServerErrorCode(res,500,error,message)
//         // res.status(500).json({ message, data: error })
//     })
// }

export const updateAlaUne = async (req: Request, res: Response) => {
  try {
    const article = await myDataSource.getRepository(AlaUne).findOne({
      where: {
        id: parseInt(req.params.id),
      },
    });

    if (!article) {
      return generateServerErrorCode(
        res,
        400,
        "L'id n'existe pas",
        "Cet article existe déjà"
      );
    }

    if (req["files"]) {
      for (let i in req["files"]) {
        console.log("IIIIIIII", req["files"][i]);
        req.body[i] = req["files"][i][0].originalname;
      }
    }
    myDataSource.getRepository(AlaUne).merge(article, req.body);

    const errors = await validate(article);
    if (errors.length > 0) {
      const message = validateMessage(errors);
      return generateServerErrorCode(res, 400, errors, message);
    }

    await myDataSource.getRepository(AlaUne).update(article.id, article);

    const successMessage = `L'article ${article.id} a bien été modifié.`;
    return success(res, 200, article, successMessage);
  } catch (error) {
    return generateServerErrorCode(
      res,
      500,
      error,
      `L'article n'a pas pu être modifié. Réessayez dans quelques instants.`
    );
  }
};

export const deleteAlaUne = async (req: Request, res: Response) => {
  //const resultat = await checkRelationsOneToMany('AlaUne', parseInt(req.params.id));
  await myDataSource
    .getRepository(AlaUne)
    .findOne({
      where: {
        id: parseInt(req.params.id),
      },
    })
    .then((article) => {
      if (article === null) {
        const message = `L'article demandé n'existe pas. Réessayez avec un autre identifiant.`;
        return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
      }

      // if(resultat){
      //     const message = `Cet article est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
      //     return generateServerErrorCode(res,400,"Cet article est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
      // }else{
      myDataSource
        .getRepository(AlaUne)
        .softRemove(article)
        .then((_) => {
          const message = `L'article avec l'identifiant n°${article.id} a bien été supprimé.`;
          return success(res, 200, article, message);
        });
      // }
    })
    .catch((error) => {
      const message = `L'article n'a pas pu être supprimé. Réessayez dans quelques instants.`;
      return generateServerErrorCode(res, 500, error, message);
    });
};

export const getNbVisiteurs = async (req: Request, res: Response) => {
  try {
    const apropos = await myDataSource.getRepository(Apropos).findOne({
      where: { statut: true },
    });
    if (apropos) {
      console.log("apropos", apropos.nbVisite);
      const message = `Le nombre de visiteur a bien été récupéré.`;
      return success(res, 200, { data: apropos.nbVisite }, message);
    }
  } catch (error) {
    return generateServerErrorCode(
      res,
      500,
      error,
      "Le nombre de visiteur n'a pas pu être récupéré. Réessayez dans quelques instants."
    );
  }
};

export const countVisiteur = async (req: Request, res: Response) => {
  try {
    console.log("VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
    console.log("visiteur", req.session);
    console.log("VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
    var data = req.session;
    if (!req.session.visited) {
      req.session.visited = true;
      req.session.save((err) => {
        if (err) {
          console.error("Erreur lors de la sauvegarde de la session:", err);
        }
      });
      console.log("visiteur", req.session);
      data = req.session;
      //visitCount++;
      const apropos = await myDataSource.getRepository(Apropos).findOne({
        where: { statut: true },
      });
      if (apropos) {
        console.log("apropos", apropos.nbVisite);
        apropos.nbVisite = apropos.nbVisite + 1;
        await myDataSource.getRepository(Apropos).save(apropos);
      }
    }
    const message = `Le nombre de visiteur a bien été récupéré.`;
    return success(res, 200, { data }, message);
  } catch (error) {
    return generateServerErrorCode(
      res,
      500,
      error,
      "Le nombre de visiteur n'a pas pu être récupéré. Réessayez dans quelques instants."
    );
  }
};
