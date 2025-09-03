import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Composition } from "../entity/Composition";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createComposition = async (req: Request, res: Response) => {
    const composition = myDataSource.getRepository(Composition).create(req.body);
    const errors = await validate(composition)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Composition).save(composition)
    .then((composition_ : Composition | Composition[]) => {
        const titre = !isArray(composition_) ? composition_.titre : '';
        const message = `La composition ${titre} a bien été créé.`
        return success(res,201, composition_,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce type existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce type existe déjà.')
        }
        const message = `Le type n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}


export const getAllComposition = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Composition);
    let reque = await myDataSource.getRepository(Composition)
    .createQueryBuilder('composition')
    .where("composition.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des compositions a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des compositions n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getComposition = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Composition).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            professeur:true,
    },
    })
    .then(composition => {
        if(composition === null) {
          const message = `La composition demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le type de méda a bien été trouvé.`
        return success(res,200, composition,message);
    })
    .catch(error => {
        const message = `La composition n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateComposition = async (req: Request, res: Response) => {
    const composition = await myDataSource.getRepository(Composition).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            professeur:true,
        },
    }
    )
    if (!composition) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette composition existe déjà')
    }
    myDataSource.getRepository(Composition).merge(composition,req.body);
    const errors = await validate(composition);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Composition).save(composition).then(composition => {
        const message = `La composition ${composition.id} a bien été modifié.`
        return success(res,200, composition,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette composition existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette composition existe déjà')
        }
        const message = `La composition n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteComposition = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Composition', parseInt(req.params.id));
    await myDataSource.getRepository(Composition)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(composition => {        
        if(composition === null) {
          const message = `La composition demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette composition est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette composition est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Composition).softRemove(composition)
            .then(_ => {
                const message = `La composition avec l'identifiant n°${composition.id} a bien été supprimé.`;
                return success(res,200, composition,message);
            })
        }
    }).catch(error => {
        const message = `La composition n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
