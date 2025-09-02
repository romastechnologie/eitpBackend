import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Qualification } from "../entity/Qualification";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createQualification = async (req: Request, res: Response) => {
    const qualification = myDataSource.getRepository(Qualification).create(req.body);
    const errors = await validate(qualification)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Qualification).save(qualification)
    .then((qualification_ : Qualification | Qualification[]) => {
        const libelle = !isArray(qualification_) ? qualification_.libelle : '';
        const message = `La qualification ${libelle} a bien été créée.`
        return success(res,201, qualification,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce qualification existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce qualification existe déjà.')
        }
        const message = `La qualification n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllQualifications= async (req: Request, res: Response) => {
    await myDataSource.getRepository(Qualification).find({
        
    })
    .then((retour) => {
        const message = 'La liste des qualificationx a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des qualificationx n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllQualification = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Qualification);
    let reque = await myDataSource.getRepository(Qualification)
    .createQueryBuilder('qualification')
    .where("qualification.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des qualificationx a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des qualificationx n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getQualification = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Qualification).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //qualification:true,
    },
    })
    .then(qualification => {
        if(qualification === null) {
          const message = `La qualification demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La qualification a bien été trouvée.`
        return success(res,200, qualification,message);
    })
    .catch(error => {
        const message = `La qualification n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateQualification = async (req: Request, res: Response) => {
    const qualification = await myDataSource.getRepository(Qualification).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //qualification:true,
        },
    }
    )
    if (!qualification) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Qualification).merge(qualification,req.body);
    const errors = await validate(qualification);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Qualification).save(qualification).then(qualification => {
        const message = `La qualification ${qualification.id} a bien été modifiée.`
        return success(res,200, qualification,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette qualification existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette qualification existe déjà')
        }
        const message = `La qualification n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteQualification = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Qualification', parseInt(req.params.id));
    await myDataSource.getRepository(Qualification)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(qualification => {        
        if(qualification === null) {
          const message = `La qualification demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette qualification est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette qualification est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Qualification).softRemove(qualification)
            .then(_ => {
                const message = `La qualification avec l'identifiant n°${qualification.id} a bien été supprimé.`;
                return success(res,200, qualification,message);
            })
        }
    }).catch(error => {
        const message = `La qualification n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
