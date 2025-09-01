import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
//import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { CategorieFaq } from "../entity/CategorieFaq";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";


export const createCategorieFaq = async (req: Request, res: Response) => {
    const categorieFaq = myDataSource.getRepository(CategorieFaq).create(req.body);
    const errors = await validate(categorieFaq)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(CategorieFaq).save(categorieFaq)
    .then(categorieFaq=> {
        const message = `La catégorie ${req.body.nom} a bien été créée.`
        return success(res,201, categorieFaq,message);
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

// export const getAllCategorieFaq = async (req: Request, res: Response) => {

//     await myDataSource.getRepository(CategorieFaq).find({
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

export const getAllCategorieFaq = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, CategorieFaq);
    let reque = await myDataSource.getRepository(CategorieFaq)
    .createQueryBuilder('categorie_faq')
    .where("categorie_faq.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    // reque.orderBy({ "categorieFaq.id": "DESC" });
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des categories a bien été récupéré.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des categories n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const getCategorieFaq = async (req: Request, res: Response) => {
    await myDataSource.getRepository(CategorieFaq).findOneBy({id: parseInt(req.params.id)})
    .then(categorieFaq => {
        if(categorieFaq === null) {
          const message = `La catégorie demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La catégorie a bien été trouvée.`
        return success(res,200, categorieFaq,message);
    })
    .catch(error => {
        const message = `La catégorie n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const updateCategorieFaq = async (req: Request, res: Response) => {
    const categorieFaq = await myDataSource.getRepository(CategorieFaq).findOneBy({id: parseInt(req.params.id),})
    if (!categorieFaq) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette catégorie existe déjà')
    }
    myDataSource.getRepository(CategorieFaq).merge(categorieFaq,req.body);
    const errors = await validate(categorieFaq)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(CategorieFaq).save(categorieFaq).then(categorieFaq => {
        const message = `La catégorie ${req.body.nom} a bien été modifiée.`
        return success(res,200, categorieFaq,message);
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
  
export const deleteCategorieFaq = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('CategorieFaq', parseInt(req.params.id));
    await myDataSource.getRepository(CategorieFaq).findOneBy({id: parseInt(req.params.id)}).then(categorieFaq => {        
        if(categorieFaq === null) {
          const message = `La catégorie demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }
        if(resultat){
            const message = `Cette categorie d'abonné est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette categorie d'abonné est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(CategorieFaq).softRemove(categorieFaq)
            .then(_ => {
                const message = `La catégorie ${categorieFaq.nom}  a bien été supprimée.`;
                return success(res,200, categorieFaq,message);
            })
        }
    }).catch(error => {
        const message = `La catégorie n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
