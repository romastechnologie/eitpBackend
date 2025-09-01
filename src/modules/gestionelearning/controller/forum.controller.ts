import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Forum } from "../entity/Forum";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createForum = async (req: Request, res: Response) => {
    const forum = myDataSource.getRepository(Forum).create(req.body);
    const errors = await validate(forum)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Forum).save(forum)
    .then((forum_ : Forum | Forum[]) => {
        const titre = !isArray(forum_) ? forum_.titre : '';
        const message = `L'étudiant ${titre} a bien été créé.`
        return success(res,201, forum,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce forum existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce forum existe déjà.')
        }
        const message = `Le forum n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}


export const getAllForum = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Forum);
    let reque = await myDataSource.getRepository(Forum)
    .createQueryBuilder('forum')
    .where("forum.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des forums a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des forums n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getForum = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Forum).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //forum:true,
    },
    })
    .then(forum => {
        if(forum === null) {
          const message = `L'étudiant demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le forum de méda a bien été trouvé.`
        return success(res,200, forum,message);
    })
    .catch(error => {
        const message = `L'étudiant n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateForum = async (req: Request, res: Response) => {
    const forum = await myDataSource.getRepository(Forum).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //forum:true,
        },
    }
    )
    if (!forum) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Forum).merge(forum,req.body);
    const errors = await validate(forum);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Forum).save(forum).then(forum => {
        const message = `L'étudiant ${forum.id} a bien été modifié.`
        return success(res,200, forum,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce forum de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce forum de média existe déjà')
        }
        const message = `L'étudiant n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteForum = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Forum', parseInt(req.params.id));
    await myDataSource.getRepository(Forum)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(forum => {        
        if(forum === null) {
          const message = `L'étudiant demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Ce forum de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce forum de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Forum).softRemove(forum)
            .then(_ => {
                const message = `L'étudiant avec l'identifiant n°${forum.id} a bien été supprimé.`;
                return success(res,200, forum,message);
            })
        }
    }).catch(error => {
        const message = `L'étudiant n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
