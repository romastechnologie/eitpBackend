import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Reponse } from "../entity/Reponse";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createReponse = async (req: Request, res: Response) => {
    const reponse = myDataSource.getRepository(Reponse).create(req.body);
    const errors = await validate(reponse)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Reponse).save(reponse)
    .then((reponse_ : Reponse | Reponse[]) => {
        const contenu = !isArray(reponse_) ? reponse_.contenu : '';
        const message = `La réponse ${contenu} a bien été créée.`
        return success(res,201, reponse,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette réponse existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette réponse existe déjà.')
        }
        const message = `La réponse n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}


export const getAllReponse = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Reponse);
    let reque = await myDataSource.getRepository(Reponse)
    .createQueryBuilder('reponse')
    .where("reponse.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des réponses a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des réponses n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getReponse = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Reponse).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //reponse:true,
    },
    })
    .then(reponse => {
        if(reponse === null) {
          const message = `La réponse demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La réponse a bien été trouvée.`
        return success(res,200, reponse,message);
    })
    .catch(error => {
        const message = `La réponse n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateReponse = async (req: Request, res: Response) => {
    const reponse = await myDataSource.getRepository(Reponse).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //reponse:true,
        },
    }
    )
    if (!reponse) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Reponse).merge(reponse,req.body);
    const errors = await validate(reponse);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Reponse).save(reponse).then(reponse => {
        const message = `La réponse ${reponse.id} a bien été modifiée.`
        return success(res,200, reponse,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette réponse de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette réponse de média existe déjà')
        }
        const message = `La réponse n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteReponse = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Reponse', parseInt(req.params.id));
    await myDataSource.getRepository(Reponse)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(reponse => {        
        if(reponse === null) {
          const message = `La réponse demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette réponse de média est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette réponse de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Reponse).softRemove(reponse)
            .then(_ => {
                const message = `La réponse avec l'identifiant n°${reponse.id} a bien été supprimé.`;
                return success(res,200, reponse,message);
            })
        }
    }).catch(error => {
        const message = `La réponse n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
