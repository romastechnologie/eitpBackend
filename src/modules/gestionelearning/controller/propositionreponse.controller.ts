
import { Question } from "../entity/Question";
import { PropositionReponse } from "../entity/PropositionReponse";
import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Brackets, Not } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";


export const createPropositionReponse = async (req: Request, res: Response) => {
    const { contenu, estLaBonneReponse, questionId } = req.body;

    if (!contenu) {
        return generateServerErrorCode(res, 400, null, "Le contenu de la proposition est obligatoire et doit être une chaîne");
    }
    if (estLaBonneReponse === undefined) {
        return generateServerErrorCode(res, 400, null, "estLaBonneReponse doit être un booléen");
    }
    if (!questionId) {
        return generateServerErrorCode(res, 400, null, "L'identifiant de la question est obligatoire");
    }

    try {
        const proposition = await myDataSource.transaction(async transactionalEntityManager => {
            const question = await transactionalEntityManager.getRepository(Question).findOneBy({ id: questionId });
            if (!question) {
                throw new Error("La question spécifiée n'existe pas");
            }

            const proposition = transactionalEntityManager.getRepository(PropositionReponse).create({
                contenu,
                estLaBonneReponse,
                question: { id: questionId },
            });

            const errors = await validate(proposition);
            if (errors.length > 0) {
                const message = validateMessage(errors);
                throw new Error(message);
            }

            return await transactionalEntityManager.getRepository(PropositionReponse).save(proposition);
        });

        const message = `La proposition ${proposition.contenu} a bien été créée.`;
        return success(res, 201, proposition, message);
    } catch (error) {
        const message = error.message || "La proposition n'a pas pu être ajoutée. Réessayez dans quelques instants.";
        return generateServerErrorCode(res, 500, error, message);
    }
};

export const getAllPropositionReponses = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex } = paginationAndRechercheInit(req, PropositionReponse);
    let query = myDataSource.getRepository(PropositionReponse)
        .createQueryBuilder("proposition")
        .leftJoinAndSelect("proposition.question", "question")
        .leftJoinAndSelect("proposition.reponses", "reponses")
        .where("proposition.deletedAt IS NULL");
   if (searchTerm && searchTerm.trim() !== "") {
        query.andWhere(
            `(proposition.contenu LIKE :keyword
            OR CAST(proposition.estLaBonneReponse AS CHAR) LIKE :keyword
            OR question.contenu LIKE :keyword
            OR reponses.contenu LIKE :keyword)`,
            { keyword: `%${searchTerm}%` }
        );
    }

    query.orderBy(`proposition.id`, 'ASC')
        .skip(startIndex)
        .take(limit)
        .getManyAndCount()
        .then(([data, totalElements]) => {
            const message = 'La liste des propositions a bien été récupérée.';
            const totalPages = Math.ceil(totalElements / limit);
            return success(res, 200, { data, totalPages, totalElements, limit }, message);
        })
        .catch(error => {
            const message = `La liste des propositions n'a pas pu être récupérée. Réessayez dans quelques instants.`;
            return generateServerErrorCode(res, 500, error, message);
        });
};

export const updatePropositionReponse = async (req: Request, res: Response) => {
    const proposition = await myDataSource.getRepository(PropositionReponse).findOneBy({ id: parseInt(req.params.id) });
    if (!proposition) {
        return generateServerErrorCode(res, 400, "L'id n'existe pas", "Cette proposition n'existe pas");
    }

    const { contenu, estLaBonneReponse, questionId } = req.body;

    if (contenu !== undefined && (!contenu || typeof contenu !== 'string')) {
        return generateServerErrorCode(res, 400, null, "Le contenu doit être une chaîne non vide");
    }
    if (estLaBonneReponse !== undefined && typeof estLaBonneReponse !== 'boolean') {
        return generateServerErrorCode(res, 400, null, "estLaBonneReponse doit être un booléen");
    }
    if (questionId !== undefined && !Number.isInteger(questionId)) {
        return generateServerErrorCode(res, 400, null, "L'identifiant de la question doit être un entier");
    }

    myDataSource.getRepository(PropositionReponse).merge(proposition, {
        contenu: contenu ?? proposition.contenu,
        estLaBonneReponse: estLaBonneReponse ?? proposition.estLaBonneReponse,
        question: questionId ? { id: questionId } : proposition.question,
    });

    const errors = await validate(proposition);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res, 400, errors, message);
    }

    await myDataSource.getRepository(PropositionReponse).save(proposition)
        .then(proposition => {
            const message = `La proposition ${proposition.contenu} a bien été modifiée.`;
            return success(res, 200, proposition, message);
        })
        .catch(error => {
            const message = `La proposition n'a pas pu être modifiée. Réessayez dans quelques instants.`;
            return generateServerErrorCode(res, 500, error, message);
        });
};

export const deletePropositionReponse = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('PropositionReponse', parseInt(req.params.id));
    await myDataSource.getRepository(PropositionReponse).findOneBy({ id: parseInt(req.params.id) }).then(proposition => {
        if (!proposition) {
            const message = `La proposition demandée n'existe pas. Réessayez avec un autre identifiant.`;
            return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
        }
        if (resultat) {
            const message = `Cette proposition est liée à d'autres enregistrements. Vous ne pouvez pas la supprimer.`;
            return generateServerErrorCode(res, 400, "Cette proposition est liée à d'autres enregistrements. Vous ne pouvez pas la supprimer.", message);
        } else {
            myDataSource.getRepository(PropositionReponse).softRemove(proposition)
                .then(_ => {
                    const message = `La proposition ${proposition.contenu} a bien été supprimée.`;
                    return success(res, 200, proposition, message);
                });
        }
    }).catch(error => {
        const message = `La proposition n'a pas pu être supprimée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    });
};

export const getReponsesByProposition = async (req: Request, res: Response) => {
    await myDataSource.getRepository(PropositionReponse)
        .createQueryBuilder("proposition")
        .leftJoinAndSelect("proposition.reponses", "reponses")
        .leftJoinAndSelect("proposition.question", "question")
        .where("proposition.id = :id", { id: parseInt(req.params.id) })
        .andWhere("proposition.deletedAt IS NULL")
        .getOne()
        .then(proposition => {
            if (!proposition) {
                const message = `La proposition demandée n'existe pas. Réessayez avec un autre identifiant.`;
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
            }
            const message = `Les réponses à la proposition ont été récupérées avec succès.`;
            return success(res, 200, proposition.reponses, message);
        })
        .catch(error => {
            const message = `Les réponses n'ont pas pu être récupérées. Réessayez dans quelques instants.`;
            return generateServerErrorCode(res, 500, error, message);
        });
};

export const getPropositionsByQuestion = async (req:Request , res: Response)  => {
    await myDataSource.getRepository(PropositionReponse).find({
        where:{
            question :{
                id: parseInt(req.params.id)
            }
        },
        relations:{
            question :true
        }
    })
    .then(propositions => {
        if(!propositions || propositions.length === 0){
            const message = `Aucune proposition trouvée pour cette question.`;
            return generateServerErrorCode(res,400,'la question nexiste',message);
        }
        const message = ` Les propositions ont bien été trouvées.`;
        return success (res,200,propositions,message)
    }).catch(error =>{
        const message = ` La question n'a pas pu être récupéré`;
        return generateServerErrorCode(res,500,error,message)
    });
};
