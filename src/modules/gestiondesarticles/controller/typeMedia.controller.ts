import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { TypeMedia } from "../entity/TypeMedia";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createTypeMedia = async (req: Request, res: Response) => {
    const typeMedia = myDataSource.getRepository(TypeMedia).create(req.body);
    const errors = await validate(typeMedia)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(TypeMedia).save(typeMedia)
    .then((typeMedia_ : TypeMedia | TypeMedia[]) => {
        const nom = !isArray(typeMedia_) ? typeMedia_.nom : '';
        const message = `Le type de média ${nom} a bien été créé.`
        return success(res,201, typeMedia,message);
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


export const getAllTypeMedia = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, TypeMedia);
    let reque = await myDataSource.getRepository(TypeMedia)
    .createQueryBuilder('type_media')
    .where("type_media.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des types de média a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des types de média n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getTypeMedia = async (req: Request, res: Response) => {
    await myDataSource.getRepository(TypeMedia).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            medias:true,
    },
    })
    .then(typeMedia => {
        if(typeMedia === null) {
          const message = `Le type de média demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le type de méda a bien été trouvé.`
        return success(res,200, typeMedia,message);
    })
    .catch(error => {
        const message = `Le type de média n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateTypeMedia = async (req: Request, res: Response) => {
    const typeMedia = await myDataSource.getRepository(TypeMedia).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            medias:true,
        },
    }
    )
    if (!typeMedia) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(TypeMedia).merge(typeMedia,req.body);
    const errors = await validate(typeMedia);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(TypeMedia).save(typeMedia).then(typeMedia => {
        const message = `Le type de média ${typeMedia.id} a bien été modifié.`
        return success(res,200, typeMedia,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce type de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce type de média existe déjà')
        }
        const message = `Le type de média n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteTypeMedia = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('TypeMedia', parseInt(req.params.id));
    await myDataSource.getRepository(TypeMedia)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(typeMedia => {        
        if(typeMedia === null) {
          const message = `Le type de média demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Ce type de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce type de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(TypeMedia).softRemove(typeMedia)
            .then(_ => {
                const message = `Le type de média avec l'identifiant n°${typeMedia.id} a bien été supprimé.`;
                return success(res,200, typeMedia,message);
            })
        }
    }).catch(error => {
        const message = `Le type de média n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
