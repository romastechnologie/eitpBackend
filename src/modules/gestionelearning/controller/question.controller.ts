import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Question } from "../entity/Question";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createQuestion = async (req: Request, res: Response) => {
    const question = myDataSource.getRepository(Question).create(req.body);
    const errors = await validate(question)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Question).save(question)
    .then((question_ : Question | Question[]) => {
        const contenu = !isArray(question_) ? question_.contenu : '';
        const message = `La question ${contenu} a bien été créé.`
        return success(res,201, question,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette question existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette question existe déjà.')
        }
        const message = `Le question n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}


export const getAllQuestion = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Question);
    let reque = await myDataSource.getRepository(Question)
    .createQueryBuilder('question')
    .where("question.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des questions a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des questions n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getQuestion = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Question).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //question:true,
    },
    })
    .then(question => {
        if(question === null) {
          const message = `La question demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La question demandée a bien été trouvée.`
        return success(res,200, question,message);
    })
    .catch(error => {
        const message = `La question n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateQuestion = async (req: Request, res: Response) => {
    const question = await myDataSource.getRepository(Question).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //question:true,
        },
    }
    )
    if (!question) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette question existe déjà')
    }
    myDataSource.getRepository(Question).merge(question,req.body);
    const errors = await validate(question);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Question).save(question).then(question => {
        const message = `La question ${question.id} a bien été modifiée.`
        return success(res,200, question,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette question existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette question existe déjà')
        }
        const message = `La question n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteQuestion = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Question', parseInt(req.params.id));
    await myDataSource.getRepository(Question)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(question => {        
        if(question === null) {
          const message = `La question demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette question est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette question est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Question).softRemove(question)
            .then(_ => {
                const message = `La question avec l'identifiant n°${question.id} a bien été supprimé.`;
                return success(res,200, question,message);
            })
        }
    }).catch(error => {
        const message = `La question n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
