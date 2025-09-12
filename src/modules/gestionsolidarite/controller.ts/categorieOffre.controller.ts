import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { CategorieOffre } from "../entity/CategorieOffre";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createCategorieOffre = async (req: Request, res: Response) => {
    const categorieOffre = myDataSource.getRepository(CategorieOffre).create(req.body);
    const errors = await validate(categorieOffre)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(CategorieOffre).save(categorieOffre)
    .then((categorieOffre_ : CategorieOffre | CategorieOffre[]) => {
        const libelle = !isArray(categorieOffre_) ? categorieOffre_.libelle : '';
        const message = `La catégorie d\'offre ${libelle} a bien été créée.`
        return success(res,201, categorieOffre,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette catégorie d\'offre existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette catégorie d\'offre existe déjà.')
        }
        const message = `La catégorie d\'offre n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllCategorieOffres= async (req: Request, res: Response) => {
    await myDataSource.getRepository(CategorieOffre).find({
        
    })
    .then((retour) => {
        const message = 'La liste des catégories d\'offres a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des catégories d\'offres n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllCategorieOffre = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, CategorieOffre);
    let reque = await myDataSource.getRepository(CategorieOffre)
    .createQueryBuilder('categorieOffre')
    .where("categorieOffre.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des catégories d\'offres a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des catégories d\'offres n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getCategorieOffre = async (req: Request, res: Response) => {
    await myDataSource.getRepository(CategorieOffre).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //categorieOffre:true,
    },
    })
    .then(categorieOffre => {
        if(categorieOffre === null) {
          const message = `La catégorie d\'offre demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La catégorie d\'offre a bien été trouvée.`
        return success(res,200, categorieOffre,message);
    })
    .catch(error => {
        const message = `La catégorie d\'offre n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateCategorieOffre = async (req: Request, res: Response) => {
    const categorieOffre = await myDataSource.getRepository(CategorieOffre).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //categorieOffre:true,
        },
    }
    )
    if (!categorieOffre) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(CategorieOffre).merge(categorieOffre,req.body);
    const errors = await validate(categorieOffre);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(CategorieOffre).save(categorieOffre).then(categorieOffre => {
        const message = `La catégorie d\'offre ${categorieOffre.id} a bien été modifiée.`
        return success(res,200, categorieOffre,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette catégorie d\'offre de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette catégorie d\'offre de média existe déjà')
        }
        const message = `La catégorie d\'offre n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteCategorieOffre = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('CategorieOffre', parseInt(req.params.id));
    await myDataSource.getRepository(CategorieOffre)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(categorieOffre => {        
        if(categorieOffre === null) {
          const message = `La catégorie d\'offre demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette catégorie d\'offre de média est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette catégorie d\'offre de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(CategorieOffre).softRemove(categorieOffre)
            .then(_ => {
                const message = `La catégorie d\'offre avec l'identifiant n°${categorieOffre.id} a bien été supprimé.`;
                return success(res,200, categorieOffre,message);
            })
        }
    }).catch(error => {
        const message = `La catégorie d\'offre n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
