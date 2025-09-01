import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Filiere } from "../entity/Filiere";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createFiliere = async (req: Request, res: Response) => {
    const filiere = myDataSource.getRepository(Filiere).create(req.body);
    const errors = await validate(filiere)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Filiere).save(filiere)
    .then((filiere_ : Filiere | Filiere[]) => {
        const libelle = !isArray(filiere_) ? filiere_.libelle : '';
        const message = `La filière ${libelle} a bien été créé.`
        return success(res,201, filiere,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette filière existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette filière existe déjà.')
        }
        const message = `La filière n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}


export const getAllFiliere = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Filiere);
    let reque = await myDataSource.getRepository(Filiere)
    .createQueryBuilder('filiere')
    .where("filiere.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des filieres a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des filieres n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getFiliere = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Filiere).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //professeur:true,
    },
    })
    .then(filiere => {
        if(filiere === null) {
          const message = `La filière demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La filière de méda a bien été trouvé.`
        return success(res,200, filiere,message);
    })
    .catch(error => {
        const message = `La filière n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateFiliere = async (req: Request, res: Response) => {
    const filiere = await myDataSource.getRepository(Filiere).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //professeur:true,
        },
    }
    )
    if (!filiere) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Filiere).merge(filiere,req.body);
    const errors = await validate(filiere);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Filiere).save(filiere).then(filiere => {
        const message = `La filière ${filiere.id} a bien été modifié.`
        return success(res,200, filiere,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette filière de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette filière de média existe déjà')
        }
        const message = `La filière n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteFiliere = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Filiere', parseInt(req.params.id));
    await myDataSource.getRepository(Filiere)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(filiere => {        
        if(filiere === null) {
          const message = `La filière demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette filière de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette filière de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Filiere).softRemove(filiere)
            .then(_ => {
                const message = `La filière avec l'identifiant n°${filiere.id} a bien été supprimé.`;
                return success(res,200, filiere,message);
            })
        }
    }).catch(error => {
        const message = `La filière n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
