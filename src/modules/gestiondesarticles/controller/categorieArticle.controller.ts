import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
//import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Brackets, IsNull, Not } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { CategorieArticle } from "../entity/CategorieArticle";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";


export const createCategorieArticle = async (req: Request, res: Response) => {
    if(req["files"]){
        for(let i in req["files"]){
            req.body[i] = req["files"][i][0].originalname;
         }  
    }
    const categorieArticle = myDataSource.getRepository(CategorieArticle).create(req.body);
    console.log('Categorie article', categorieArticle)
    const errors = await validate(categorieArticle)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(CategorieArticle).save(categorieArticle)
    .then(categorieArticle=> {
        const message = `La catégorie ${req.body.nom} a bien été créée.`
        return success(res,201, categorieArticle,message);
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

// export const getAllCategorieArticle = async (req: Request, res: Response) => {

//     await myDataSource.getRepository(CategorieArticle).find({
//         order: {
//             id: "DESC",
//         },
//         relations:{
//             categorieArticle:true
//         }
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

export const getAllCategorieArticle = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, CategorieArticle);

    let reque = await myDataSource.getRepository(CategorieArticle)
        .createQueryBuilder('categorie_article')
        .where("categorie_article.deletedAt IS NULL");

    if (searchTerm) {
        reque.andWhere(new Brackets(qb => {
            qb.where(
                'categorie_article.id LIKE :keyword OR ' +
                'categorie_article.nom LIKE :keyword OR ' +
                'categorie_article.description LIKE :keyword', 
                { keyword: `%${searchTerm}%` }
            );
        }));
    }

    
    if(parseInt(req.query.limit as string) > 0){
        //console.log(limit,"limitlimitlimitlimitlimitlimit");
        reque.skip(startIndex);
        reque.take(limit);
    }
    reque.getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des catégories d\'articles a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res, 200, { data, totalPages, totalElements, limit }, message);
    }).catch(error => {
        const message = `La liste des catégories d'articles n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    });
};

export const getAllCategorieArticleChild = async (req: Request, res: Response) => {

    await myDataSource.getRepository(CategorieArticle).find({
        where: {
            categorieArticle: Not(IsNull()),
        },
        order: {
            id: "DESC",
        },
        relations:{
            categorieArticle:true
        }
    })
    .then(categories => {
       const message = "Récuperation de la catégorie effectuée avec succès";
        return success(res,200,categories, message);
    }).catch(error => {
        const message = `La liste des catégorie d'abonné n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};


export const getCategorieArticle = async (req: Request, res: Response) => {
    await myDataSource.getRepository(CategorieArticle).findOne(
      { where: {
            id: parseInt(req.params.id)
        },
        relations:{
            categorieArticle:true,
            sousCategorieArticles:true
        }
    })
    .then(categorieArticle => {
        if(categorieArticle === null) {
          const message = `La catégorie demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La catégorie a bien été trouvée.`
        return success(res,200, categorieArticle,message);
    })
    .catch(error => {
        const message = `La catégorie n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

// export const updateCategorieArticle = async (req: Request, res: Response) => {
//     console.log("")
//     const categorieArticle = await myDataSource.getRepository(CategorieArticle).findOneBy({id: parseInt(req.params.id),})
//     if (!categorieArticle) {
//         return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette catégorie existe déjà')
//     }
//     myDataSource.getRepository(CategorieArticle).merge(categorieArticle,req.body);
//     const errors = await validate(categorieArticle)
//     if (errors.length > 0) {
//         const message = validateMessage(errors);
//         return generateServerErrorCode(res,400,errors,message)
//     }
//     await myDataSource.getRepository(CategorieArticle).save(categorieArticle).then(CategorieArticle => {
//         const message = `La catégorie ${req.body.nom} a bien été modifiée.`
//         return success(res,200, categorieArticle,message);
//     }).catch(error => {
//         if(error instanceof ValidationError) {
//             return generateServerErrorCode(res,400,error,'Cette catégorie existe déjà')
//         }
//         if(error.code == "ER_DUP_ENTRY") {
//             return generateServerErrorCode(res,400,error,'Cette catégorie existe déjà')
//         }
//         const message = `La catégorie n'a pas pu être ajoutée. Réessayez dans quelques instants.`
//         return generateServerErrorCode(res,500,error,message)
//         // res.status(500).json({ message, data: error }) 
//     })
// }

export const updateCategorieArticle = async (req: Request, res: Response) => {
    try {
        const categorie = await myDataSource.getRepository(CategorieArticle).findOne({
            where: {
                id: parseInt(req.params.id),
            },
        });

        if(!categorie) {
            return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Cette categorie existe déjà');
        }

        if(req["files"]){
            for(let i in req["files"]){
                console.log("IIIIIIII",req["files"][i]);
                req.body[i] = req["files"][i][0].originalname;
            }
        }
        myDataSource.getRepository(CategorieArticle).merge(categorie, req.body);

        const errors = await validate(categorie);
        if (errors.length > 0) {
            const message = validateMessage(errors);
            return generateServerErrorCode(res, 400, errors, message);
        }

        await myDataSource.getRepository(CategorieArticle).update(categorie.id, categorie);

        const successMessage = `La catégorie ${categorie.id} a bien été modifié.`;
        return success(res, 200, categorie, successMessage);
    } catch (error) {
        return generateServerErrorCode(res, 500, error, `La catégorie n'a pas pu être modifié. Réessayez dans quelques instants.`);
    }
    
}
  
export const deleteCategorieArticle = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('CategorieArticle', parseInt(req.params.id));
    await myDataSource.getRepository(CategorieArticle).findOneBy({id: parseInt(req.params.id)}).then(categorieArticle => {        
        if(categorieArticle === null) {
          const message = `La catégorie demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }
        if(resultat){
            const message = `Cette categorie d'abonné est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette categorie d'abonné est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(CategorieArticle).softRemove(categorieArticle)
            .then(_ => {
                const message = `La catégorie ${categorieArticle.nom}  a bien été supprimée.`;
                return success(res,200, categorieArticle,message);
            })
        }
    }).catch(error => {
        const message = `La catégorie n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
