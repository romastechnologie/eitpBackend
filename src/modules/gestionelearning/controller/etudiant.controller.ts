import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Etudiant } from "../entity/Etudiant";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createEtudiant = async (req: Request, res: Response) => {
    const etudiant = myDataSource.getRepository(Etudiant).create(req.body);
    const errors = await validate(etudiant)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Etudiant).save(etudiant)
    .then((etudiant_ : Etudiant | Etudiant[]) => {
        const prenom = !isArray(etudiant_) ? etudiant_.prenom : '';
        const message = `L'étudiant ${prenom} a bien été créé.`
        return success(res,201, etudiant,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce type existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce type existe déjà.')
        }
        const message = `Le type n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}


export const getAllEtudiant = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Etudiant);
    let reque = await myDataSource.getRepository(Etudiant)
    .createQueryBuilder('etudiant')
    .where("etudiant.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des étudiants a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des étudiants n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getEtudiant = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Etudiant).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //professeur:true,
    },
    })
    .then(etudiant => {
        if(etudiant === null) {
          const message = `L'étudiant demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `L'étudiant a bien été trouvé.`
        return success(res,200, etudiant,message);
    })
    .catch(error => {
        const message = `L'étudiant n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateEtudiant = async (req: Request, res: Response) => {
    const etudiant = await myDataSource.getRepository(Etudiant).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //professeur:true,
        },
    }
    )
    if (!etudiant) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Etudiant).merge(etudiant,req.body);
    const errors = await validate(etudiant);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Etudiant).save(etudiant).then(etudiant => {
        const message = `L'étudiant ${etudiant.id} a bien été modifié.`
        return success(res,200, etudiant,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce type de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce type de média existe déjà')
        }
        const message = `L'étudiant n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteEtudiant = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Etudiant', parseInt(req.params.id));
    await myDataSource.getRepository(Etudiant)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(etudiant => {        
        if(etudiant === null) {
          const message = `L'étudiant demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Ce type de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce type de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Etudiant).softRemove(etudiant)
            .then(_ => {
                const message = `L'étudiant avec l'identifiant n°${etudiant.id} a bien été supprimé.`;
                return success(res,200, etudiant,message);
            })
        }
    }).catch(error => {
        const message = `L'étudiant n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
