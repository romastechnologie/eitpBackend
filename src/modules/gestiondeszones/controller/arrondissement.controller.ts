import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Arrondissement } from "../entity/Arrondissement";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";



export const createArrondissement = async (req: Request, res: Response) => {
    const arrondissement = myDataSource.getRepository(Arrondissement).create(req.body);
    const errors = await validate(arrondissement)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Arrondissement).save(arrondissement)
    .then(arrondissement => {
        const message = `L'arrondissement ${req.body.id} a bien été créé.`
        return success(res,201, arrondissement,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cet arrondissement existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cet arrondissement existe déjà.')
        }
        const message = `L'arrondissement n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllArrondissement = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Arrondissement).find({
        relations:{
            quartiers:true,
            commune:true   
        }
    })
    .then((retour) => {
        const message = 'La liste des arrondissements a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des arrondissements n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllArrondissements = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Arrondissement);
    let reque = await myDataSource.getRepository(Arrondissement)
        .createQueryBuilder("arrondissement")
        .leftJoinAndSelect('arrondissement.quartiers','quartier')
        .leftJoinAndSelect('arrondissement.commune','commune')
        .leftJoinAndSelect('arrondissement.userCreation','user')

        // .where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        .where("arrondissement.deletedAt IS NULL")
        if (searchQueries.length > 0) {
            reque.andWhere(new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
            }));
        }
        reque.orderBy(`arrondissement.id`, 'ASC')
        .skip(startIndex)
        .take(limit)
        .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des arrondissements a bien été récupérée.'
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des arrondissements n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};


export const getArrondissement = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Arrondissement).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            quartiers:true,
            commune:true  

    },
    })
    .then(arrondissement => {
        if(arrondissement === null) {
          const message = `L'arrondissement demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `L'arrondissement a bien été trouvée.`
        return success(res,200, arrondissement,message);
    })
    .catch(error => {
        const message = `L'arrondissement n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getArrondissementByCommune = async (req: Request, res: Response) => {
    await(myDataSource.getRepository(Arrondissement)
    .createQueryBuilder("a")
    .where("a.communeId = :id", { id: req.params.id })
    .getMany()
        )
    .then(arrondissement => {
        if(arrondissement === null) {
          const message = `Aucun élément ne correspond à votre recherche.`
          return generateServerErrorCode(res,400,"Aucun élément ne correspond à votre recherche",message)
        }
        const message = `La récupération a bien été exécuté.`
        return success(res,200,arrondissement,message);
    })
    .catch(error => {
        const message = `Les arrondissements n'ont pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateArrondissement = async (req: Request, res: Response) => {
    const arrondissement = await myDataSource.getRepository(Arrondissement).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            quartiers:true,
            commune:true

     },
    }
    )
    if (!arrondissement) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet arrondissement  existe déjà')
    }
    myDataSource.getRepository(Arrondissement).merge(arrondissement,req.body);
    const errors = await validate(arrondissement);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Arrondissement).save(arrondissement).then(arrondissement => {
        const message = `L'arrondissement ${arrondissement.id} a bien été modifié.`
        return success(res,200,arrondissement,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cet arrondissement existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cet arrondissement existe déjà')
        }
        const message = `L'arrondissement n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteArrondissement = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Arrondissement', parseInt(req.params.id));
    await myDataSource.getRepository(Arrondissement)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        },
        relations:{
            quartiers:true,
            commune:true
   }
        })
    .then(arrondissement => {        
        if(arrondissement === null) {
          const message = `L'arrondissement demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cet arrondissement est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cet arrondissement est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Arrondissement).softRemove(arrondissement)
            .then(_ => {
                const message = `L'arrondissement avec l'identifiant n°${arrondissement.id} a bien été supprimée.`;
                return success(res,200, arrondissement,message);
            })
        }
    }).catch(error => {
        const message = `L'arrondissement n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
