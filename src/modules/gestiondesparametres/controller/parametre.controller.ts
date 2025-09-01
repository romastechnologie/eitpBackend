import { myDataSource } from "../../../configs/data-source";
import { Request, Response } from "express";
import { Parametre } from "../entity/Parametre";
import { ValidationError, validate } from "class-validator";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { CategorieInfo } from "../entity/CategorieInfo";

export const createParametre = async (req: Request, res: Response) => {
    
    const parametre = myDataSource.getRepository(Parametre).create(req.body);
    const errors = await validate(parametre)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Parametre).save(parametre)
    .then(parametre => {
        const message = `Le paramètre ${req.body.libelle} a bien été crée.`;
        return success(res,201, parametre,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce parametre existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce parametre existe déjà')
        }
        const message = `Le parametre n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

// export const getAllParametres = async (req: Request, res: Response) => {
//     await myDataSource.getRepository(Parametre).find({
//         relations:{
//             categorieInfo:true
//         }
//     })
//     .then((retour) => {
//         const message = 'La liste des paramètres a bien été récupérée.';
//         return success(res,200,{data:retour}, message);
//     }).catch(error => {
//         const message = `La liste des paramètres n'a pas pu être récupérée. Réessayez dans quelques instants.`
//         //res.status(500).json({ message, data: error })
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getAllParametres = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Parametre);
    let reque = await myDataSource.getRepository(Parametre)
    .createQueryBuilder('parametre')
    .leftJoinAndSelect('parametre.categorieInfo', 'categorieInfo')
    .where("parametre.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des parametres a bien été récupéré.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des parametres n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getParametre = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Parametre).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            categorieInfo:true,
    },    
    })
    .then(parametre => {
        if(parametre === null) {
            const message = `Le parametre demandé n'existe pas. Réessayez avec un autre identifiant.`
            return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le parametre a bien été trouvé.`
        return success(res,200, parametre,message);
    })
    .catch(error => {
        const message = `Le parametre n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const updateParametre = async (req: Request, res: Response) => {
    const parametre = await myDataSource.getRepository(Parametre).findOneBy({id: parseInt(req.params.id),})
    if (!parametre) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Ce parametre existe déjà')
    }
    myDataSource.getRepository(Parametre).merge(parametre,req.body);
    const errors = await validate(parametre)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Parametre).save(parametre).then(parametre => {
        const message = `Le paramètre ${req.body.id} a bien été modifié.`
        return success(res,200, Parametre,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce parametre existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce parametre existe déjà')
        }
        const message = `Le parametre n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message) 
    })
}

export const deleteParametre = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Parametre', parseInt(req.params.id));
    await myDataSource.getRepository(Parametre).findOne({
        where: {
            id: parseInt(req.params.id)
        },
        relations:{
            categorieInfo:true,
        }
        }).then(parametre => {        
        if(parametre === null) {
            const message = `Le parametre demandé n'existe pas. Réessayez avec un autre identifiant.`
            return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }
        if(resultat){
            const message = `Ce parametre est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce parametre est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Parametre).softRemove(parametre)
            .then(_ => {
                const message = `Le parametre avec l'identifiant n°${parametre.id} a bien été supprimé.`;
                return success(res,200, parametre,message);
            })
        }
    }).catch(error => {
        const message = `Le parametre n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getParametreByCategory = async (req: Request, res: Response) => {
    try {
        const categorie = await myDataSource.getRepository(CategorieInfo).findOne({
            where: {
                id: parseInt(req.params.id),
            },
            relations: ['parametres'],
        });

        if (!categorie) {
            const message = `La catégorie demandée n'existe pas. Veuillez réessayer avec un autre identifiant.`;
            return generateServerErrorCode(res, 400, "Catégorie non trouvée", message);
        }

        const parametres = categorie.parametres;
        const message = `Les paramètres de la catégorie ont été récupérés avec succès.`;
        return success(res, 200, parametres, message);
    } catch (error) {
        const message = `Les paramètres n'ont pas pu être récupérés. Veuillez réessayer ultérieurement.`;
        return generateServerErrorCode(res, 500, error, message);
    }
}