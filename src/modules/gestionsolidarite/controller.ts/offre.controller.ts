import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Offre } from "../entity/Offre";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createOffre = async (req: Request, res: Response) => {
    const offre = myDataSource.getRepository(Offre).create(req.body);
    const errors = await validate(offre)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Offre).save(offre)
    .then((offre_ : Offre | Offre[]) => {
        const titre = !isArray(offre_) ? offre_.titre : '';
        const message = `L\'offre ${titre} a bien été créée.`
        return success(res,201, offre,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette offre existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette offre existe déjà.')
        }
        const message = `L\'offre n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllOffres= async (req: Request, res: Response) => {
    await myDataSource.getRepository(Offre).find({
        
    })
    .then((retour) => {
        const message = 'La liste des offres a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des offres n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllOffre = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Offre);
    let reque = await myDataSource.getRepository(Offre)
    .createQueryBuilder('offre')
    .leftJoinAndSelect('offre.categorieOffre','categorieOffre')
    .leftJoinAndSelect('offre.commune','commune')
    .leftJoinAndSelect('offre.activite','activite')
    .where("offre.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des offres a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des offres n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getOffre = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Offre).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //offre:true,
    },
    })
    .then(offre => {
        if(offre === null) {
          const message = `L\'offre demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `L\'offre a bien été trouvée.`
        return success(res,200, offre,message);
    })
    .catch(error => {
        const message = `L\'offre n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateOffre = async (req: Request, res: Response) => {
    const offre = await myDataSource.getRepository(Offre).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //offre:true,
        },
    }
    )
    if (!offre) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Offre).merge(offre,req.body);
    const errors = await validate(offre);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Offre).save(offre).then(offre => {
        const message = `L\'offre ${offre.id} a bien été modifiée.`
        return success(res,200, offre,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette offre de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette offre de média existe déjà')
        }
        const message = `L\'offre n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteOffre = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Offre', parseInt(req.params.id));
    await myDataSource.getRepository(Offre)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(offre => {        
        if(offre === null) {
          const message = `L\'offre demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette offre de média est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette offre de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Offre).softRemove(offre)
            .then(_ => {
                const message = `L\'offre avec l'identifiant n°${offre.id} a bien été supprimé.`;
                return success(res,200, offre,message);
            })
        }
    }).catch(error => {
        const message = `L\'offre n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
