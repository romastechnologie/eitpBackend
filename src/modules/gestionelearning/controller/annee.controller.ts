import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { AnneeAcademique } from "../entity/AnneAcademique";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createAnneeAcademique = async (req: Request, res: Response) => {
    const annee = myDataSource.getRepository(AnneeAcademique).create(req.body);
    const errors = await validate(annee)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(AnneeAcademique).save(annee)
    .then(annee => {
        const message = `L'annee ${req.body.libelle} a bien été créée.`
        return success(res,201,annee,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette annee existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette annee existe déjà.')
        }
        const message = `La annee n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}



export const getAllAnneeAcademique = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, AnneeAcademique);
    let reque = await myDataSource.getRepository(AnneeAcademique)
    .createQueryBuilder('annee')
    .where("annee.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des années a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des années n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllAnneeAcademiques = async (req: Request, res: Response) => {
  const { searchTerm, searchQueries } = paginationAndRechercheInit(req, AnneeAcademique);

  try {
    let reque = myDataSource.getRepository(AnneeAcademique)
      .createQueryBuilder('annee')
      .where("annee.deletedAt IS NULL");

    if (searchQueries.length > 0) {
      reque.andWhere(new Brackets(qb => {
        qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` });
      }));
    }

    const data = await reque.getMany();

    const message = 'La liste des années a bien été récupérée.';
    return success(res, 200, { data }, message);
  } catch (error) {
    const message = `La liste des années n'a pas pu être récupérée. Réessayez dans quelques instants.`;
    return generateServerErrorCode(res, 500, error, message);
  }
};


export const getAnneeAcademique = async (req: Request, res: Response) => {
    await myDataSource.getRepository(AnneeAcademique).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //professeur:true,
    },
    })
    .then(annee => {
        if(annee === null) {
          const message = `L'année demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le type de méda a bien été trouvé.`
        return success(res,200, annee,message);
    })
    .catch(error => {
        const message = `L'année n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateAnneeAcademique = async (req: Request, res: Response) => {
    const annee = await myDataSource.getRepository(AnneeAcademique).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //professeur:true,
        },
    }
    )
    if (!annee) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette annee existe déjà')
    }
    myDataSource.getRepository(AnneeAcademique).merge(annee,req.body);
    const errors = await validate(annee);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(AnneeAcademique).save(annee).then(annee => {
        const message = `L'année ${annee.id} a bien été modifié.`
        return success(res,200, annee,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette annee existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette annee existe déjà')
        }
        const message = `L'année n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteAnneeAcademique = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('AnneeAcademique', parseInt(req.params.id));
    await myDataSource.getRepository(AnneeAcademique)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(annee => {        
        if(annee === null) {
          const message = `L'année demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette annee est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette annee est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(AnneeAcademique).softRemove(annee)
            .then(_ => {
                const message = `L'année avec l'identifiant n°${annee.id} a bien été supprimé.`;
                return success(res,200, annee,message);
            })
        }
    }).catch(error => {
        const message = `L'année n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
