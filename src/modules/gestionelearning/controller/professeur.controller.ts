import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Professeur } from "../entity/Professeur";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createProfesseur = async (req: Request, res: Response) => {
    const professeur = myDataSource.getRepository(Professeur).create(req.body);
    const errors = await validate(professeur)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Professeur).save(professeur)
    .then((professeur_ : Professeur | Professeur[]) => {
        const prenom = !isArray(professeur_) ? professeur_.prenom : '';
        const message = `L'étudiant ${prenom} a bien été créé.`
        return success(res,201, professeur,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce professeur existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce professeur existe déjà.')
        }
        const message = `Le professeur n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}


export const getAllProfesseur = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Professeur);
    let reque = await myDataSource.getRepository(Professeur)
    .createQueryBuilder('professeur')
    .where("professeur.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des professeurs a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des professeurs n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getProfesseur = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Professeur).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //professeur:true,
    },
    })
    .then(professeur => {
        if(professeur === null) {
          const message = `L'étudiant demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le professeur de méda a bien été trouvé.`
        return success(res,200, professeur,message);
    })
    .catch(error => {
        const message = `L'étudiant n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateProfesseur = async (req: Request, res: Response) => {
    const professeur = await myDataSource.getRepository(Professeur).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //professeur:true,
        },
    }
    )
    if (!professeur) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Professeur).merge(professeur,req.body);
    const errors = await validate(professeur);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Professeur).save(professeur).then(professeur => {
        const message = `L'étudiant ${professeur.id} a bien été modifié.`
        return success(res,200, professeur,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce professeur de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce professeur de média existe déjà')
        }
        const message = `L'étudiant n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteProfesseur = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Professeur', parseInt(req.params.id));
    await myDataSource.getRepository(Professeur)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(professeur => {        
        if(professeur === null) {
          const message = `L'étudiant demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Ce professeur de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce professeur de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Professeur).softRemove(professeur)
            .then(_ => {
                const message = `L'étudiant avec l'identifiant n°${professeur.id} a bien été supprimé.`;
                return success(res,200, professeur,message);
            })
        }
    }).catch(error => {
        const message = `L'étudiant n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
