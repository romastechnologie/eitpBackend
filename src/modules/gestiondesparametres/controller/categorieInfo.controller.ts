import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
//import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";

import { CategorieInfo } from "../entity/CategorieInfo";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";


export const createCategorieInfo = async (req: Request, res: Response) => {
    const categorieInfo = myDataSource.getRepository(CategorieInfo).create(req.body);
    const errors = await validate(categorieInfo)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(CategorieInfo).save(categorieInfo)
    .then(categorieInfo=> {
        const message = `La catégorie ${req.body.libelle} a bien été créée.`
        return success(res,201, categorieInfo,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette catégorie existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette catégorie existe déjà');
        }
        const message = `La catégorie n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message);
    })
}

// export const getAllCategorieInfo = async (req: Request, res: Response) => {

//     await myDataSource.getRepository(CategorieInfo).find({
//         order: {
//             id: "DESC",
//         },
//     })
//     .then(categories => {
//        const message = "Récuperation de la catégorie effectuée avec succès";
//         return success(res,200,categories, message);
//     }).catch(error => {
//         const message = `La liste des catégorie d'abonné n'a pas pu être récupérée. Réessayez dans quelques instants.`;
//         //res.status(500).json({ message, data: error })
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getAllCategorieInfo = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, CategorieInfo);
    let reque = await myDataSource.getRepository(CategorieInfo)
    .createQueryBuilder('categorie_info')
    .where("categorie_info.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    // reque.orderBy({ "categorie.id": "DESC" });
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des catégories a bien été récupéré.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des catégories n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getCategorieInfo = async (req: Request, res: Response) => {
    await myDataSource.getRepository(CategorieInfo).findOneBy({id: parseInt(req.params.id)})
    .then(categorieInfo => {
        if(categorieInfo === null) {
          const message = `La catégorie demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La catégorie a bien été trouvée.`
        return success(res,200, categorieInfo,message);
    })
    .catch(error => {
        const message = `La catégorie n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const updateCategorieInfo = async (req: Request, res: Response) => {
    const categorieInfo = await myDataSource.getRepository(CategorieInfo).findOneBy({id: parseInt(req.params.id),})
    if (!categorieInfo) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette catégorie existe déjà')
    }
    myDataSource.getRepository(CategorieInfo).merge(categorieInfo,req.body);
    const errors = await validate(categorieInfo)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(CategorieInfo).save(categorieInfo).then(categorieInfo => {
        const message = `La catégorie ${req.body.libelle} a bien été modifiée.`
        return success(res,200, categorieInfo,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette catégorie existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette catégorie existe déjà')
        }
        const message = `La catégorie n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}
  
export const deleteCategorieInfo = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('CategorieInfo', parseInt(req.params.id));
    await myDataSource.getRepository(CategorieInfo).findOneBy({id: parseInt(req.params.id)}).then(categorieInfo => {        
        if(categorieInfo === null) {
          const message = `La catégorie demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }
        if(resultat){
            const message = `Cette categorie d'abonné est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette categorie d'abonné est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(CategorieInfo).softRemove(categorieInfo)
            .then(categorieInfo => {
                const message = `La catégorie  a bien été supprimée.`;
                return success(res,200, categorieInfo,message);
            })
        }
    }).catch(error => {
        const message = `La catégorie n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
