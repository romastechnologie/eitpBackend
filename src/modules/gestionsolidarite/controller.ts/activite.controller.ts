import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Activite } from "../entity/Activite";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createActivite = async (req: Request, res: Response) => {
    const activite = myDataSource.getRepository(Activite).create(req.body);
    const errors = await validate(activite)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Activite).save(activite)
    .then((activite_ : Activite | Activite[]) => {
        const libelle = !isArray(activite_) ? activite_.libelle : '';
        const message = `L'activité ${libelle} a bien été créée.`
        return success(res,201, activite,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette activité existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette activité existe déjà.')
        }
        const message = `L'activité n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllActivite= async (req: Request, res: Response) => {
    await myDataSource.getRepository(Activite).find({
        
    })
    .then((retour) => {
        const message = 'La liste des activités a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des activités n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllActivites = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Activite);
    let reque = await myDataSource.getRepository(Activite)
    .createQueryBuilder('activite')
    .where("activite.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des activités a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des activités n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getActivite = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Activite).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //activite:true,
    },
    })
    .then(activite => {
        if(activite === null) {
          const message = `L'activité demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `L'activité a bien été trouvée.`
        return success(res,200, activite,message);
    })
    .catch(error => {
        const message = `L'activité n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateActivite = async (req: Request, res: Response) => {
    const activite = await myDataSource.getRepository(Activite).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //activite:true,
        },
    }
    )
    if (!activite) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette activité existe déjà')
    }
    myDataSource.getRepository(Activite).merge(activite,req.body);
    const errors = await validate(activite);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Activite).save(activite).then(activite => {
        const message = `L'activité ${activite.id} a bien été modifiée.`
        return success(res,200, activite,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette activité existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette activité existe déjà')
        }
        const message = `L'activité n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteActivite = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Activite', parseInt(req.params.id));
    await myDataSource.getRepository(Activite)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(activite => {        
        if(activite === null) {
          const message = `L'activité demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette activité est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette activité est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Activite).softRemove(activite)
            .then(_ => {
                const message = `L'activité avec l'identifiant n°${activite.id} a bien été supprimé.`;
                return success(res,200, activite,message);
            })
        }
    }).catch(error => {
        const message = `L'activité n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
