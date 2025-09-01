import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Niveau } from "../entity/Niveau";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createNiveau = async (req: Request, res: Response) => {
    const niveau = myDataSource.getRepository(Niveau).create(req.body);
    const errors = await validate(niveau)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Niveau).save(niveau)
    .then((niveau_ : Niveau | Niveau[]) => {
        const libelle = !isArray(niveau_) ? niveau_.libelle : '';
        const message = `Le niveau ${libelle} a bien été créée.`
        return success(res,201, niveau,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette réponse existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette réponse existe déjà.')
        }
        const message = `Le niveau n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}


export const getAllNiveau = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Niveau);
    let reque = await myDataSource.getRepository(Niveau)
    .createQueryBuilder('niveau')
    .where("niveau.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des niveaux a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des niveaux n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getNiveau = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Niveau).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //niveau:true,
    },
    })
    .then(niveau => {
        if(niveau === null) {
          const message = `Le niveau demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le niveau a bien été trouvée.`
        return success(res,200, niveau,message);
    })
    .catch(error => {
        const message = `Le niveau n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateNiveau = async (req: Request, res: Response) => {
    const niveau = await myDataSource.getRepository(Niveau).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //niveau:true,
        },
    }
    )
    if (!niveau) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Niveau).merge(niveau,req.body);
    const errors = await validate(niveau);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Niveau).save(niveau).then(niveau => {
        const message = `Le niveau ${niveau.id} a bien été modifiée.`
        return success(res,200, niveau,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette réponse de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette réponse de média existe déjà')
        }
        const message = `Le niveau n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteNiveau = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Niveau', parseInt(req.params.id));
    await myDataSource.getRepository(Niveau)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(niveau => {        
        if(niveau === null) {
          const message = `Le niveau demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette réponse de média est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette réponse de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Niveau).softRemove(niveau)
            .then(_ => {
                const message = `Le niveau avec l'identifiant n°${niveau.id} a bien été supprimé.`;
                return success(res,200, niveau,message);
            })
        }
    }).catch(error => {
        const message = `Le niveau n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
