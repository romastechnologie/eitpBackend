import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Matiere } from "../entity/Matiere";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createMatiere = async (req: Request, res: Response) => {
    const matiere = myDataSource.getRepository(Matiere).create(req.body);
    const errors = await validate(matiere)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Matiere).save(matiere)
    .then((matiere_ : Matiere | Matiere[]) => {
        const libelle = !isArray(matiere_) ? matiere_.libelle : '';
        const message = `La matière ${libelle} a bien été créée.`
        return success(res,201, matiere,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette matière existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette matière existe déjà.')
        }
        const message = `La  matière n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}


export const getAllMatiere = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Matiere);
    let reque = await myDataSource.getRepository(Matiere)
    .createQueryBuilder('matiere')
    .where("matiere.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des matieres a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des matieres n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllMatieres= async (req: Request, res: Response) => {
    await myDataSource.getRepository(Matiere).find({
        relations:{
            
        }
    })
    .then((retour) => {
        const message = 'La liste des matières a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des matières n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getMatiere = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Matiere).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //matiere:true,
    },
    })
    .then(matiere => {
        if(matiere === null) {
          const message = `La matière demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La  matière de méda a bien été trouvé.`
        return success(res,200, matiere,message);
    })
    .catch(error => {
        const message = `La matière n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateMatiere = async (req: Request, res: Response) => {
    const matiere = await myDataSource.getRepository(Matiere).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //matiere:true,
        },
    }
    )
    if (!matiere) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Matiere).merge(matiere,req.body);
    const errors = await validate(matiere);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Matiere).save(matiere).then(matiere => {
        const message = `La matière ${matiere.id} a bien été modifié.`
        return success(res,200, matiere,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette matière de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette matière de média existe déjà')
        }
        const message = `La matière n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteMatiere = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Matiere', parseInt(req.params.id));
    await myDataSource.getRepository(Matiere)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(matiere => {        
        if(matiere === null) {
          const message = `La matière demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette matière de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette matière de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Matiere).softRemove(matiere)
            .then(_ => {
                const message = `La matière avec l'identifiant n°${matiere.id} a bien été supprimé.`;
                return success(res,200, matiere,message);
            })
        }
    }).catch(error => {
        const message = `La matière n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
