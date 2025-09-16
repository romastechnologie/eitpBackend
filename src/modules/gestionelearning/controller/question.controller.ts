import { Question } from "../entity/Question";
import { PropositionReponse } from "../entity/PropositionReponse";
import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";

// Créer une question
export const createQuestion = async (req: Request, res: Response) => {
    const { contenu, type, propositions, reponse } = req.body;

    if (!contenu || !type) {
        return generateServerErrorCode(res, 400, null, "Le contenu et le type de la question sont obligatoires");
    }

    // if (type === 'QCM' && (!propositions || !Array.isArray(propositions))) {
    //     return generateServerErrorCode(res, 400, "ValidationError", "Les propositions sont obligatoires et doivent être un tableau pour les questions QCM.");
    // }

    try {
        const question = await myDataSource.transaction(async transactionalEntityManager => {
            const question = transactionalEntityManager.getRepository(Question).create({
                contenu,
                type,
                reponse: reponse ?? null,
                // userCreation: req.user, // Assurez-vous que req.user est défini
            });

            const errors = await validate(question);
            if (errors.length > 0) {
                const message = validateMessage(errors);
                throw new Error(message);
            }

            const savedQuestion = await transactionalEntityManager.getRepository(Question).save(question);

            if (type === 'QCM' && Array.isArray(propositions) && propositions.length > 0) {
                for (const propositionData of propositions) {
                    if (!propositionData.contenu) {
                        throw new Error("Chaque proposition doit avoir un contenu.");
                    }

                    const proposition = new PropositionReponse();
                    proposition.contenu = propositionData.contenu;
                    proposition.estLaBonneReponse = propositionData.estLaBonneReponse || false;
                    proposition.question = savedQuestion;

                    await transactionalEntityManager.save(PropositionReponse, proposition);
                }
            }

            return savedQuestion;
        });

        const message = `La question ${req.body.contenu} a bien été créée.`;
        return success(res, 201, question, message);
    } catch (error: any) {
        const message = error.message || "La question n'a pas pu être ajoutée. Réessayez dans quelques instants.";
        return generateServerErrorCode(res, 500, error, message);
    }
};


//  Récupérer toutes les questions
export const getAllQuestions = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Question);

    let query = await myDataSource.getRepository(Question)
        .createQueryBuilder("question")
        .leftJoinAndSelect("question.propositions", "propositions")
        .where("question.deletedAt IS NULL");

    if (searchQueries.length > 0) {
        query.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` });
        }));
    }

    query.orderBy(`question.id`, 'ASC')
        .skip(startIndex)
        .take(limit)
        .getManyAndCount()
        .then(([data, totalElements]) => {
            const message = 'La liste des questions a bien été récupérée.';
            const totalPages = Math.ceil(totalElements / limit);
            return success(res, 200, { data, totalPages, totalElements, limit }, message);
        }).catch(error => {
            const message = `La liste des questions n'a pas pu être récupérée. Réessayez dans quelques instants.`;
            return generateServerErrorCode(res, 500, error, message);
        });
};

// PropositionReponse Récupérer une question par son id
export const getQuestion = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Question)
        .createQueryBuilder("question")
        .leftJoinAndSelect("question.propositions", "propositions")
        .where("question.id = :id", { id: parseInt(req.params.id) })
        .andWhere("question.deletedAt IS NULL")
        .getOne()
        .then(question => {
            if (!question) {
                const message = `La question demandée n'existe pas. Réessayez avec un autre identifiant.`;
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
            }
            const message = `La question a bien été trouvée.`;
            return success(res, 200, question, message);
        })
        .catch(error => {
            const message = `La question n'a pas pu être récupérée. Réessayez dans quelques instants.`;
            return generateServerErrorCode(res, 500, error, message);
        });
};

// PropositionReponse Mettre à jour une question
export const updateQuestion = async (req: Request, res: Response) => {
    const question = await myDataSource.getRepository(Question).findOneBy({ id: parseInt(req.params.id) });
    if (!question) {
        return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Cette question n\'existe pas');
    }
    myDataSource.getRepository(Question).merge(question, req.body);
    const errors = await validate(question);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res, 400, errors, message);
    }
    await myDataSource.getRepository(Question).save(question).then(question => {
        const message = `La question ${req.body.contenu} a bien été modifiée.`;
        return success(res, 200, question, message);
    }).catch(error => {
        if (error instanceof ValidationError) {
            return generateServerErrorCode(res, 400, error, 'Erreur de validation');
        }
        if ((error as any).code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, 'Cette question existe déjà');
        }
        const message = `La question n'a pas pu être ajoutée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    });
};

// PropositionReponse Supprimer une question
export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const questionRepository = myDataSource.getRepository(Question);
        const question = await questionRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["compoQuestions", "propositions", "reponses", "filiereNiveauMatieres"],
        });

        if (!question) {
            const message = `La question demandée n'existe pas. Réessayez avec un autre identifiant.`;
            return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
        }

        // Soft delete des relations
        await myDataSource.getRepository("CompositionQuestion")
            .createQueryBuilder()
            .softDelete()
            .where("question_id = :id", { id: parseInt(req.params.id) })
            .execute();

        await myDataSource.getRepository("PropositionReponse")
            .createQueryBuilder()
            .softDelete()
            .where("question_id = :id", { id: parseInt(req.params.id) })
            .execute();

        await myDataSource.getRepository("Reponse")
            .createQueryBuilder()
            .softDelete()
            .where("question_id = :id", { id: parseInt(req.params.id) })
            .execute();

        await myDataSource.getRepository("FiliereNiveauMatiere")
            .createQueryBuilder()
            .softDelete()
            .where("question_id = :id", { id: parseInt(req.params.id) })
            .execute();

        // Soft delete de la question
        await questionRepository.softRemove(question);

        const message = `La question ${question.contenu} a bien été supprimée.`;
        return success(res, 200, question, message);
    } catch (error) {
        const message = `La question n'a pas pu être supprimée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};

// PropositionReponse Récupérer uniquement les propositions d'une question
export const getQuestionPropositions = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Question)
        .createQueryBuilder("question")
        .leftJoinAndSelect("question.propositions", "propositions")
        .where("question.id = :id", { id: parseInt(req.params.id) })
        .andWhere("question.deletedAt IS NULL")
        .getOne()
        .then(question => {
            if (!question) {
                const message = `La question demandée n'existe pas. Réessayez avec un autre identifiant.`;
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
            }
            const message = `Les propositions de la question ont été récupérées avec succès.`;
            return success(res, 200, question.propositions, message);
        })
        .catch(error => {
            const message = `Les propositions de la question n'ont pas pu être récupérées. Réessayez dans quelques instants.`;
            return generateServerErrorCode(res, 500, error, message);
        });
};
