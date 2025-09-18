import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Departement } from "../entity/Departement";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";



export const createDepartement = async (req: Request, res: Response) => {
    const departement = myDataSource.getRepository(Departement).create(req.body);
    const errors = await validate(departement)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Departement).save(departement)
    .then(departement => {
        const message = `Le département ${req.body.id} a bien été créé.`
        return success(res,201, departement,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce département existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce département existe déjà.')
        }
        const message = `Le département n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllDepartement = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Departement).find({
        relations:{
            communes:true
        }
    })
    .then((retour) => {
        const message = 'La liste des departements a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des departements n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllDepartements = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Departement);
    let reque = await myDataSource.getRepository(Departement)
        .createQueryBuilder("departement")
        //.leftJoinAndSelect('arrondissement.quartiers','quartier')
        .leftJoinAndSelect('departement.communes','commune')
        .leftJoinAndSelect('departement.userCreation','user')

        // .where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        .where("departement.deletedAt IS NULL")
        if (searchQueries.length > 0) {
            reque.andWhere(new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
            }));
        }
        reque.orderBy(`departement.id`, 'ASC')
        .skip(startIndex)
        .take(limit)
        .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des départements a bien été récupérée.'
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des départements n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};


export const getDepartement = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Departement).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            communes:true
    },
    })
    .then(departement => {
        if(departement === null) {
          const message = `Le département demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le département a bien été trouvée.`
        return success(res,200, departement,message);
    })
    .catch(error => {
        const message = `Le département n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateDepartement = async (req: Request, res: Response) => {
    const departement = await myDataSource.getRepository(Departement).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            communes:true
     },
    }
    )
    if (!departement) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Ce département  existe déjà')
    }
    myDataSource.getRepository(Departement).merge(departement,req.body);
    const errors = await validate(departement);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Departement).save(departement).then(departement => {
        const message = `Le département ${departement.id} a bien été modifié.`
        return success(res,200,departement,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce département existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce département existe déjà')
        }
        const message = `Le département n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteDepartement = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Departement', parseInt(req.params.id));
    await myDataSource.getRepository(Departement)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        },
        relations:{
            communes:true
   }
        })
    .then(departement => {        
        if(departement === null) {
          const message = `Le département demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Ce département est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce département est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Departement).softRemove(departement)
            .then(_ => {
                const message = `Le département avec l'identifiant n°${departement.id} a bien été supprimée.`;
                return success(res,200, departement,message);
            })
        }
    }).catch(error => {
        const message = `Le département n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
