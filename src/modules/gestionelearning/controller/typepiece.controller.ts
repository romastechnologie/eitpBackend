import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { TypePiece } from "../entity/TypePiece";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createTypePiece = async (req: Request, res: Response) => {
    const typePiece = myDataSource.getRepository(TypePiece).create(req.body);
    const errors = await validate(typePiece)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(TypePiece).save(typePiece)
    .then(typePiece => {
        const message = `Le type de pièce ${req.body.libelle} a bien été créée.`
        return success(res,201,typePiece,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette typePiece existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette typePiece existe déjà.')
        }
        const message = `Le type de pièce n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}



export const getAllTypePiece = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, TypePiece);
    let reque = await myDataSource.getRepository(TypePiece)
    .createQueryBuilder('typePiece')
    .where("typePiece.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des types de pièces a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des types de pièces n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllTypePieces = async (req: Request, res: Response) => {
  const { searchTerm, searchQueries } = paginationAndRechercheInit(req, TypePiece);

  try {
    let reque = myDataSource.getRepository(TypePiece)
      .createQueryBuilder('typePiece')
      .where("typePiece.deletedAt IS NULL");

    if (searchQueries.length > 0) {
      reque.andWhere(new Brackets(qb => {
        qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` });
      }));
    }

    const data = await reque.getMany();

    const message = 'La liste des types de pièces a bien été récupérée.';
    return success(res, 200, { data }, message);
  } catch (error) {
    const message = `La liste des types de pièces n'a pas pu être récupérée. Réessayez dans quelques instants.`;
    return generateServerErrorCode(res, 500, error, message);
  }
};


export const getTypePiece = async (req: Request, res: Response) => {
    await myDataSource.getRepository(TypePiece).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //professeur:true,
    },
    })
    .then(typePiece => {
        if(typePiece === null) {
          const message = `Le type demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le type de méda a bien été trouvé.`
        return success(res,200, typePiece,message);
    })
    .catch(error => {
        const message = `Le type n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateTypePiece = async (req: Request, res: Response) => {
    const typePiece = await myDataSource.getRepository(TypePiece).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //professeur:true,
        },
    }
    )
    if (!typePiece) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette typePiece existe déjà')
    }
    myDataSource.getRepository(TypePiece).merge(typePiece,req.body);
    const errors = await validate(typePiece);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(TypePiece).save(typePiece).then(typePiece => {
        const message = `Le type ${typePiece.id} a bien été modifié.`
        return success(res,200, typePiece,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette typePiece existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette typePiece existe déjà')
        }
        const message = `Le type n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteTypePiece = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('TypePiece', parseInt(req.params.id));
    await myDataSource.getRepository(TypePiece)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(typePiece => {        
        if(typePiece === null) {
          const message = `Le type demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette typePiece est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette typePiece est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(TypePiece).softRemove(typePiece)
            .then(_ => {
                const message = `Le type avec l'identifiant n°${typePiece.id} a bien été supprimé.`;
                return success(res,200, typePiece,message);
            })
        }
    }).catch(error => {
        const message = `Le type n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
