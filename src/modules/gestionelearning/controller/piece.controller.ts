import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Piece } from "../entity/Piece";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createPiece = async (req: Request, res: Response) => {
    const piece = myDataSource.getRepository(Piece).create(req.body);
    const errors = await validate(piece)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Piece).save(piece)
    .then((piece_ : Piece | Piece[]) => {
        const urlImage = !isArray(piece_) ? piece_.urlImage : '';
        const message = `La pièce ${urlImage} a bien été créée.`
        return success(res,201, piece,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette pièce existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette pièce existe déjà.')
        }
        const message = `La pièce n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllPiece= async (req: Request, res: Response) => {
    await myDataSource.getRepository(Piece).find({
        
    })
    .then((retour) => {
        const message = 'La liste des pièces a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des pièces n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllPieces = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Piece);
    let reque = await myDataSource.getRepository(Piece)
    .createQueryBuilder('piece')
    .where("piece.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des pièces a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des pièces n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getPiece = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Piece).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //piece:true,
    },
    })
    .then(piece => {
        if(piece === null) {
          const message = `La pièce demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La pièce a bien été trouvée.`
        return success(res,200, piece,message);
    })
    .catch(error => {
        const message = `La pièce n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updatePiece = async (req: Request, res: Response) => {
    const piece = await myDataSource.getRepository(Piece).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //piece:true,
        },
    }
    )
    if (!piece) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette pièce existe déjà')
    }
    myDataSource.getRepository(Piece).merge(piece,req.body);
    const errors = await validate(piece);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Piece).save(piece).then(piece => {
        const message = `La pièce ${piece.id} a bien été modifiée.`
        return success(res,200, piece,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette pièce existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette pièce existe déjà')
        }
        const message = `La pièce n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deletePiece = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Piece', parseInt(req.params.id));
    await myDataSource.getRepository(Piece)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(piece => {        
        if(piece === null) {
          const message = `La pièce demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette pièce est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette pièce est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Piece).softRemove(piece)
            .then(_ => {
                const message = `La pièce avec l'identifiant n°${piece.id} a bien été supprimé.`;
                return success(res,200, piece,message);
            })
        }
    }).catch(error => {
        const message = `La pièce n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
