import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { TypeEmploiDuTemps } from "../entity/TypeEmploiDuTemps";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createTypeEmploiDuTemps = async (req: Request, res: Response) => {
    const typeEmploiDuTemps = myDataSource.getRepository(TypeEmploiDuTemps).create(req.body);
    const errors = await validate(typeEmploiDuTemps)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(TypeEmploiDuTemps).save(typeEmploiDuTemps)
    .then((typeEmploiDuTemps_ : TypeEmploiDuTemps | TypeEmploiDuTemps[]) => {
        const libelle = !isArray(typeEmploiDuTemps_) ? typeEmploiDuTemps_.libelle : '';
        const message = `Le type d'emplois du temps ${libelle} a bien été créée.`
        return success(res,201, typeEmploiDuTemps,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce type d\'emplois du temps existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce type d\'emplois du temps existe déjà.')
        }
        const message = `Le type d'emplois du temps n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllTypeEmploiDuTemps= async (req: Request, res: Response) => {
    await myDataSource.getRepository(TypeEmploiDuTemps).find({
        
    })
    .then((retour) => {
        const message = 'La liste des types a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des types d'emplois n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};





export const getAllTypeEmploiDuTemp = async (req: Request, res: Response) => {
  const { page, limit, searchTerm, startIndex } = paginationAndRechercheInit(req, TypeEmploiDuTemps);

  try {
    let reque = myDataSource.getRepository(TypeEmploiDuTemps)
      .createQueryBuilder("typeEmploiDuTemps")
      .where("typeEmploiDuTemps.deletedAt IS NULL");

    // Recherche
    if (searchTerm && searchTerm.trim() !== "") {
      reque.andWhere(
        new Brackets(qb => {
          qb.where("LOWER(typeEmploiDuTemps.code) LIKE LOWER(:keyword)", { keyword: `%${searchTerm}%` })
            .orWhere("LOWER(typeEmploiDuTemps.libelle) LIKE LOWER(:keyword)", { keyword: `%${searchTerm}%` });
        })
      );
    }

    // Pagination + exécution
    const [data, totalElements] = await reque
      .skip(startIndex)
      .take(limit)
      .orderBy("typeEmploiDuTemps.createdAt", "DESC")
      .getManyAndCount();

    const message = "La liste des types d'emplois du temps a bien été récupérée.";
    const totalPages = Math.ceil(totalElements / limit);

    return success(res, 200, { data, totalPages, totalElements, limit, page }, message);

  } catch (error) {
    const message = "La liste des types d'emplois du temps n'a pas pu être récupérée. Réessayez dans quelques instants.";
    return generateServerErrorCode(res, 500, error, message);
  }
};

export const getAllTypeEmploiDuTemp2 = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, TypeEmploiDuTemps);
    let reque = await myDataSource.getRepository(TypeEmploiDuTemps)
    .createQueryBuilder('typeEmploiDuTemps')
    .where("typeEmploiDuTemps.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des types d\'emplois du temps a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des types d\'emplois du temps n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getTypeEmploiDuTemps = async (req: Request, res: Response) => {
    await myDataSource.getRepository(TypeEmploiDuTemps).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //typeEmploiDuTemps:true,
    },
    })
    .then(typeEmploiDuTemps => {
        if(typeEmploiDuTemps === null) {
          const message = `Le type d'emplois du temps demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le type d'emplois du temps a bien été trouvée.`
        return success(res,200, typeEmploiDuTemps,message);
    })
    .catch(error => {
        const message = `Le type d'emplois du temps n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateTypeEmploiDuTemps = async (req: Request, res: Response) => {
    const typeEmploiDuTemps = await myDataSource.getRepository(TypeEmploiDuTemps).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //typeEmploiDuTemps:true,
        },
    }
    )
    if (!typeEmploiDuTemps) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(TypeEmploiDuTemps).merge(typeEmploiDuTemps,req.body);
    const errors = await validate(typeEmploiDuTemps);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(TypeEmploiDuTemps).save(typeEmploiDuTemps).then(typeEmploiDuTemps => {
        const message = `Le type d'emplois du temps ${typeEmploiDuTemps.id} a bien été modifiée.`
        return success(res,200, typeEmploiDuTemps,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce type d\'emplois du temps existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce type d\'emplois du temps existe déjà')
        }
        const message = `Le type d'emplois du temps n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteTypeEmploiDuTemps = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('TypeEmploiDuTemps', parseInt(req.params.id));
    await myDataSource.getRepository(TypeEmploiDuTemps)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(typeEmploiDuTemps => {        
        if(typeEmploiDuTemps === null) {
          const message = `Le type d'emplois du temps demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Ce type d\'emplois du temps  est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce type d\'emplois du temps  est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(TypeEmploiDuTemps).softRemove(typeEmploiDuTemps)
            .then(_ => {
                const message = `Le type d'emplois du temps avec l'identifiant n°${typeEmploiDuTemps.id} a bien été supprimé.`;
                return success(res,200, typeEmploiDuTemps,message);
            })
        }
    }).catch(error => {
        const message = `Le type d'emplois du temps n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
