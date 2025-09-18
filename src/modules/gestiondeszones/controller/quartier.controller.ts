import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Quartier } from "../entity/Quartier";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";



export const createQuartier = async (req: Request, res: Response) => {
    const quartier = myDataSource.getRepository(Quartier).create(req.body);
    const errors = await validate(quartier)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Quartier).save(quartier)
    .then(quartier => {
        const message = `Le quartier ${req.body.id} a bien été créé.`
        return success(res,201, quartier,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce quartier existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce quartier existe déjà.')
        }
        const message = `Le quartier n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getQuartiers = async (req: Request, res: Response) => {
        const key = req.params.key;
        let resq = await myDataSource.getRepository(Quartier)
        .createQueryBuilder('quartier')
        .leftJoinAndSelect('quartier.arrondissement', 'arrondissement')
        .leftJoinAndSelect('arrondissement.commune', 'commune')
        .leftJoinAndSelect('commune.departement', 'departement')
        if (key) {
            resq = resq.where("quartier.libelle LIKE :key", { key: `%${key}%` });
        }
        resq.andWhere("quartier.deletedAt IS NULL")
        .getMany()
        .then((data) => {
        const message = 'La liste des quartiers a bien été récupérée.';
        return success(res, 200, { data }, message);
    
    }).catch (error => {
        const message = `La liste des clients n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    });
    }

export const getAllQuartier = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Quartier).find({
        relations:{
            
            arrondissement:true
        }
    })
    .then((retour) => {
        const message = 'La liste des quartiers a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des quartiers n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllQuartiers = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Quartier);
    let reque = await myDataSource.getRepository(Quartier)
        .createQueryBuilder("quartier")
        .leftJoinAndSelect('quartier.arrondissement','arrondissement')
        //.leftJoinAndSelect('arrondissement.commune','commune')
        .leftJoinAndSelect('quartier.userCreation','user')
        // .where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        .where("quartier.deletedAt IS NULL")
        if (searchQueries.length > 0) {
            reque.andWhere(new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
            }));
        }
        reque.orderBy(`quartier.id`, 'ASC')
        .skip(startIndex)
        .take(limit)
        .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des quartiers a bien été récupérée.'
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des quartiers n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

 export const getQuartier = async (req: Request, res: Response) => {
        const key = req.params.id;
        await myDataSource.getRepository(Quartier)
        .createQueryBuilder('quartier')
        .leftJoinAndSelect('quartier.arrondissement', 'arrondissement')
        .leftJoinAndSelect('arrondissement.commune', 'commune')
        .leftJoinAndSelect('commune.departement', 'departement')
        .where("quartier.id = :id", { id: parseInt(key) })
        .andWhere("quartier.deletedAt IS NULL")
        .getOne()
        .then((data) => {
        const message = 'La liste des quartiers a bien été récupérée.';
        return success(res, 200, { data }, message);
    }).catch (error => {
        const message = `La liste des clients n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    });
    }

/*export const getQuartier = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Quartier).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            
            arrondissement:true

    },
    })
    .then(quartier => {
        if(quartier === null) {
          const message = `Le quartier demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le quartier a bien été trouvée.`
        return success(res,200, quartier,message);
    })
    .catch(error => {
        const message = `Le quartier n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};
*/
export const getQuartierByArrondissement = async (req: Request, res: Response) => {
    await(myDataSource.getRepository(Quartier)
    .createQueryBuilder("q")
    .where("q.arrondissementId = :id", { id: req.params.id })
    .getMany()
        )
    .then(quartier => {
        if(quartier === null) {
          const message = `Aucun élément ne correspond à votre recherche.`
          return generateServerErrorCode(res,400,"Aucun élément ne correspond à votre recherche",message)
        }
        const message = `La récupération a bien été exécuté.`
        return success(res,200,quartier,message);
    })
    .catch(error => {
        const message = `Les quartiers n'ont pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const updateQuartier = async (req: Request, res: Response) => {
    const quartier = await myDataSource.getRepository(Quartier).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            
            arrondissement:true

     },
    }
    )
    if (!quartier) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Ce quartier  existe déjà')
    }
    myDataSource.getRepository(Quartier).merge(quartier,req.body);
    const errors = await validate(quartier);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Quartier).save(quartier).then(quartier => {
        const message = `Le quartier ${quartier.id} a bien été modifié.`
        return success(res,200,quartier,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce quartier existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce quartier existe déjà')
        }
        const message = `Le quartier n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteQuartier = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Quartier', parseInt(req.params.id));
    await myDataSource.getRepository(Quartier)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        },
        relations:{
            
            arrondissement:true
        }
    })
    .then(quartier => {        
        if(quartier === null) {
          const message = `Le quartier demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }
        if(resultat){
            const message = `Ce quartier est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce quartier est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Quartier).softRemove(quartier)
            .then(_ => {
                const message = `Le quartier avec l'identifiant n°${quartier.id} a bien été supprimé.`;
                return success(res,200, quartier,message);
            })
        }
    }).catch(error => {
        const message = `Le quartier n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
