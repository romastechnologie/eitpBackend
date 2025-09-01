import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";

import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Newsletters } from "../entity/Newsletters";


export const createNewsletters = async (req: Request, res: Response) => {
    const newsletters = myDataSource.getRepository(Newsletters).create(req.body);
    const errors = await validate(newsletters)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Newsletters).save(newsletters)
    .then(newsletters => {
        const message = `La newsletters ${req.body.email} a bien été créée.`
        return success(res,201, message,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce mail existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce mail existe déjà.')
        }
        const message = `La newsletters n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllNewsletters = async (req: Request, res: Response) => {
     await myDataSource.getRepository(Newsletters).find({
         relations:{
             
         }
     })
    .then((retour) => {
         const message = 'La liste des newsletters a bien été récupérée.';
        return success(res,200,{data:retour}, message);
     }).catch(error => {
         const message = `La liste des newsletters n'a pas pu être récupérée. Réessayez dans quelques instants.`
//         //res.status(500).json({ message, data: error })
       return generateServerErrorCode(res,500,error,message)
     })
 };


export const getNewsletters = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Newsletters).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
    },
    })
    .then(newsletters => {
        if(newsletters === null) {
          const message = `La newsletters demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La newsletters a bien été trouvée.`
        return success(res,200, newsletters,message);
    })
    .catch(error => {
        const message = `La newsletters n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getNewslettersByType = async (req: Request, res: Response) => {
    await(myDataSource.getRepository(Newsletters)
    .createQueryBuilder("newsletters")
    .where("newsletters.type = :id", { id: req.params.id })
    .getMany()
        )
    .then(newsletters => {
        if(newsletters === null) {
          const message = `Aucun élément ne correspond à votre recherche.`
          return generateServerErrorCode(res,400,"Aucun élément ne correspond à votre recherche",message)
        }
        const message = `La récupération a bien été exécutée.`
        return success(res,200,newsletters,message);
    })
    .catch(error => {
        const message = `Les newsletters n'ont pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const updateNewsletters = async (req: Request, res: Response) => {
    const newsletters = await myDataSource.getRepository(Newsletters).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            
        },
    }
    )
    if (!newsletters) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette newsletters existe déjà')
    }
    myDataSource.getRepository(Newsletters).merge(newsletters,req.body);
    const errors = await validate(newsletters);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Newsletters).save(newsletters).then(newsletters => {
        const message = `La newsletters ${newsletters.id} a bien été modifiée.`
        return success(res,200, newsletters,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette newsletters existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette newsletters existe déjà')
        }
        const message = `La newsletters n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteNewsletters = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Newsletters', parseInt(req.params.id));
    await myDataSource.getRepository(Newsletters)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        },
        relations:{
            
        }
        })
    .then(newsletters => {        
        if(newsletters === null) {
          const message = `La newsletters demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette newsletters est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette faq est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Newsletters).softRemove(newsletters)
            .then(_ => {
                const message = `La newsletters avec l'identifiant n°${newsletters.id} a bien été supprimée.`;
                return success(res,200, newsletters,message);
            })
        }
    }).catch(error => {
        const message = `La newsletters n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
