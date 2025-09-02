import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Classe } from "../entity/Classe";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createClasse = async (req: Request, res: Response) => {
    const classe = myDataSource.getRepository(Classe).create(req.body);
    const errors = await validate(classe)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Classe).save(classe)
    .then((classe_ : Classe | Classe[]) => {
        const libelle = !isArray(classe_) ? classe_.libelle : '';
        const message = `La classe ${libelle} a bien été créée.`
        return success(res,201, classe,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette classe existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette classe existe déjà.')
        }
        const message = `La classe n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllClasses= async (req: Request, res: Response) => {
    await myDataSource.getRepository(Classe).find({
        
    })
    .then((retour) => {
        const message = 'La liste des classes a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des classes n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllClasse = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Classe);
    let reque = await myDataSource.getRepository(Classe)
    .createQueryBuilder('classe')
    .where("classe.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des classes a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des classes n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getClasse = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Classe).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //classe:true,
    },
    })
    .then(classe => {
        if(classe === null) {
          const message = `La classe demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La classe a bien été trouvée.`
        return success(res,200, classe,message);
    })
    .catch(error => {
        const message = `La classe n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateClasse = async (req: Request, res: Response) => {
    const classe = await myDataSource.getRepository(Classe).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //classe:true,
        },
    }
    )
    if (!classe) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette classe existe déjà')
    }
    myDataSource.getRepository(Classe).merge(classe,req.body);
    const errors = await validate(classe);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Classe).save(classe).then(classe => {
        const message = `La classe ${classe.id} a bien été modifiée.`
        return success(res,200, classe,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette classe de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette classe de média existe déjà')
        }
        const message = `La classe n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteClasse = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Classe', parseInt(req.params.id));
    await myDataSource.getRepository(Classe)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(classe => {        
        if(classe === null) {
          const message = `La classe demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette classe de média est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette classe de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Classe).softRemove(classe)
            .then(_ => {
                const message = `La classe avec l'identifiant n°${classe.id} a bien été supprimé.`;
                return success(res,200, classe,message);
            })
        }
    }).catch(error => {
        const message = `La classe n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
