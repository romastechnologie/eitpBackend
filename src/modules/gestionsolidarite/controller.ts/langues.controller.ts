import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Langues } from "../entity/Langues";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createLangues = async (req: Request, res: Response) => {
    const langue = myDataSource.getRepository(Langues).create(req.body);
    const errors = await validate(langue)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Langues).save(langue)
    .then((langue_ : Langues | Langues[]) => {
        const libelle = !isArray(langue_) ? langue_.libelle : '';
        const message = `La langue ${libelle} a bien été créée.`
        return success(res,201, langue,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette langue existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette langue existe déjà.')
        }
        const message = `La langue n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllLangues= async (req: Request, res: Response) => {
    await myDataSource.getRepository(Langues).find({
        
    })
    .then((retour) => {
        const message = 'La liste des languex a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des languex n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllLangue = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Langues);
    let reque = await myDataSource.getRepository(Langues)
    .createQueryBuilder('langue')
    .where("langue.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des languex a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des languex n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getLangues = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Langues).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //langue:true,
    },
    })
    .then(langue => {
        if(langue === null) {
          const message = `La langue demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La langue a bien été trouvée.`
        return success(res,200, langue,message);
    })
    .catch(error => {
        const message = `La langue n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateLangues = async (req: Request, res: Response) => {
    const langue = await myDataSource.getRepository(Langues).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //langue:true,
        },
    }
    )
    if (!langue) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Langues).merge(langue,req.body);
    const errors = await validate(langue);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Langues).save(langue).then(langue => {
        const message = `La langue ${langue.id} a bien été modifiée.`
        return success(res,200, langue,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette langue de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette langue de média existe déjà')
        }
        const message = `La langue n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteLangues = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Langues', parseInt(req.params.id));
    await myDataSource.getRepository(Langues)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(langue => {        
        if(langue === null) {
          const message = `La langue demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette langue de média est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette langue de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Langues).softRemove(langue)
            .then(_ => {
                const message = `La langue avec l'identifiant n°${langue.id} a bien été supprimé.`;
                return success(res,200, langue,message);
            })
        }
    }).catch(error => {
        const message = `La langue n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
