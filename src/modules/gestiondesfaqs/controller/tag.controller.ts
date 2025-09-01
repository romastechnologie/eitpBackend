import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Faq } from "../entity/Faq";
import { Tag } from "../entity/Tag";
import { FaqTag } from "../entity/FaqTag";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createTag = async (req: Request, res: Response) => {
    const tag = myDataSource.getRepository(Tag).create(req.body);
    const errors = await validate(tag)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Tag).save(tag)
    .then(tag => {
        const message = `Le tag ${req.body.nom} a bien été créé.`
        return success(res,201, tag,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce tag existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce tag existe déjà.')
        }
        const message = `Le tag n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

// export const getAllTag = async (req: Request, res: Response) => {
//     await myDataSource.getRepository(Tag).find({
//         relations:{
//             faqtags:true,
//         }
//     })
//     .then((retour) => {
//         const message = 'La liste des tags a bien été récupérée.';
//         return success(res,200,{data:retour}, message);
//     }).catch(error => {
//         const message = `La liste des tags n'a pas pu être récupérée. Réessayez dans quelques instants.`
//         //res.status(500).json({ message, data: error })
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getAllTag = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Tag);
    let reque = await myDataSource.getRepository(Tag)
    .createQueryBuilder('tag')
    .leftJoinAndSelect('tag.faqtags', 'faqtags')
    .where("tag.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des tags a bien été récupéré.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des tags n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllFaqTag = async (req: Request, res: Response) => {
    await myDataSource.getRepository(FaqTag).find({
        relations:{
                faq:{
                    faqtags:true,
            },
                tag:true,
        }
    })
    .then((retour) => {
        const message = 'La liste des tags a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des tags n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getTag = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Tag).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            faqtags: true,
    },
    })
    .then(tag => {
        if(tag === null) {
          const message = `Le tag demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le tag a bien été trouvée.`
        return success(res,200, tag,message);
    })
    .catch(error => {
        const message = `La faq n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const updateTag = async (req: Request, res: Response) => {
    const tag = await myDataSource.getRepository(Tag).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        // relations: {
        //     faqtags: true,
        // },
    }
    )
    if (!tag) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Ce tag existe déjà')
    }
    myDataSource.getRepository(Tag).merge(tag,req.body);
    const errors = await validate(tag);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Tag).save(tag).then(Tag => {
        const message = `Le tag ${tag.id} a bien été modifié.`
        return success(res,200, Tag,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce tag existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce tag existe déjà')
        }
        const message = `Le tag n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteTag = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('FaqTag', parseInt(req.params.id));
    await myDataSource.getRepository(Tag)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        },
        // relations:{
        //     faqtags: true,
        // }
        })
    .then(tag => {        
        if(tag === null) {
          const message = `Le tag demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Ce tag est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce tag est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Tag).softRemove(tag)
            .then(_ => {
                const message = `Le tag avec l'identifiant n°${tag.id} a bien été supprimé.`;
                return success(res,200, tag,message);
            })
        }
    }).catch(error => {
        const message = `La faq n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
