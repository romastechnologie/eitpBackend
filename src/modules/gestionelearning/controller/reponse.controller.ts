import { Reponse } from "../entity/Reponse";
import { Question } from "../entity/Question";
import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate, ValidatorOptions } from "class-validator";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { In } from "typeorm";
import { PropositionReponse } from "../entity/PropositionReponse";

// PropositionReponse Créer une réponse
export const createReponse = async (req: Request, res: Response) => {
    const { questionId, propositionIds } = req.body;

    console.log("Données reçues:", req.body);

    // Validation des champs obligatoires
    if (!questionId) {
        return generateServerErrorCode(res, 400, null, "L'identifiant de la question est obligatoire");
    }
    if (!propositionIds || !Array.isArray(propositionIds) || propositionIds.length === 0) {
        return generateServerErrorCode(res, 400, null, "Au moins un identifiant de proposition est obligatoire");
    }

    try {
        const reponses = await myDataSource.transaction(async (transactionalEntityManager) => {
            // Vérifier que la question existe
            const question = await transactionalEntityManager.getRepository(Question).findOneBy({
                id: parseInt(questionId),
                deletedAt: null,
            });
            if (!question) {
                throw new Error("La question spécifiée n'existe pas.");
            }

            // Récupérer les propositions associées à la question
            const propositionEntities = await transactionalEntityManager.getRepository(PropositionReponse).find({
                where: {
                    id: In(propositionIds.map(id => parseInt(id))),
                    question: { id: parseInt(questionId) },
                    deletedAt: null,
                },
            });

            if (propositionEntities.length !== propositionIds.length) {
                const foundIds = propositionEntities.map(p => p.id.toString());
                const missingIds = propositionIds.filter(id => !foundIds.includes(id.toString()));
                throw new Error(`Certaines propositions sont introuvables ou non liées à la question. IDs manquants: ${missingIds.join(', ')}`);
            }

            // Créer une réponse pour chaque proposition
            const reponses = [];
            for (const propId of propositionIds) {
                const proposition = propositionEntities.find(p => p.id === parseInt(propId));
                if (!proposition) {
                    throw new Error(`Proposition avec ID ${propId} introuvable`);
                }

                const reponseEntity = transactionalEntityManager.getRepository(Reponse).create({
                    proposition,
                    question, // relation optionnelle si définie dans l’entité
                });

                reponses.push(reponseEntity);
            }

            // Validation
            const validatorOptions: ValidatorOptions = {
                skipMissingProperties: true,
                forbidUnknownValues: false,
            };
            const errors = await validate(reponses, validatorOptions);
            if (errors.length > 0) {
                const message = validateMessage(errors);
                throw new Error(message);
            }

            return await transactionalEntityManager.getRepository(Reponse).save(reponses);
        });

        const message = `Les réponses ont été créées avec succès pour la question ${questionId}.`;
        return success(res, 201, reponses, message);
    } catch (error: any) {
        console.error("Erreur lors de la création de la réponse:", error);
        const message = error.message || "Les réponses n'ont pas pu être ajoutées. Réessayez dans quelques instants.";
        return generateServerErrorCode(res, 500, error, message);
    }
};

// PropositionReponse Récupérer toutes les réponses
export const getAllReponses = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex } = paginationAndRechercheInit(req, Reponse);

    let query = myDataSource.getRepository(Reponse)
        .createQueryBuilder("reponse")
        .leftJoinAndSelect("reponse.proposition", "proposition")
        .where("reponse.deletedAt IS NULL");

    if (searchTerm && searchTerm.trim() !== "") {
        query.andWhere(`(proposition.contenu LIKE :keyword)`, { keyword: `%${searchTerm}%` });
    }

    query.orderBy(`reponse.id`, 'ASC')
        .skip(startIndex)
        .take(limit)
        .getManyAndCount()
        .then(([data, totalElements]) => {
            const totalPages = Math.ceil(totalElements / limit);
            const message = 'La liste des réponses a bien été récupérée.';
            return success(res, 200, { data, totalPages, totalElements, limit }, message);
        })
        .catch(error => {
            const message = `La liste des réponses n'a pas pu être récupérée.`;
            return generateServerErrorCode(res, 500, error, message);
        });
};

// PropositionReponse Récupérer une réponse
export const getReponse = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Reponse)
        .createQueryBuilder("reponse")
        .leftJoinAndSelect("reponse.proposition", "proposition")
        .where("reponse.id = :id", { id: parseInt(req.params.id) })
        .andWhere("reponse.deletedAt IS NULL")
        .getOne()
        .then(reponse => {
            if (!reponse) {
                return generateServerErrorCode(res, 400, "L'id n'existe pas", "La réponse demandée n'existe pas.");
            }
            return success(res, 200, reponse, "La réponse a bien été trouvée.");
        })
        .catch(error => {
            return generateServerErrorCode(res, 500, error, "Erreur lors de la récupération de la réponse.");
        });
};

// PropositionReponse Mettre à jour une réponse
export const updateReponse = async (req: Request, res: Response) => {
    const reponse = await myDataSource.getRepository(Reponse).findOneBy({ id: parseInt(req.params.id) });
    if (!reponse) {
        return generateServerErrorCode(res, 400, "L'id n'existe pas", "Cette réponse n'existe pas.");
    }

    myDataSource.getRepository(Reponse).merge(reponse, req.body);
    const errors = await validate(reponse);
    if (errors.length > 0) {
        return generateServerErrorCode(res, 400, errors, validateMessage(errors));
    }

    await myDataSource.getRepository(Reponse).save(reponse)
        .then(reponse => success(res, 200, reponse, "La réponse a bien été modifiée."))
        .catch(error => {
            if (error instanceof ValidationError) {
                return generateServerErrorCode(res, 400, error, "Erreur de validation");
            }
            if ((error as any).code === "ER_DUP_ENTRY") {
                return generateServerErrorCode(res, 400, error, "Cette réponse existe déjà");
            }
            return generateServerErrorCode(res, 500, error, "Erreur lors de la modification de la réponse.");
        });
};

// PropositionReponse Supprimer une réponse
export const deleteReponse = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany("Reponse", parseInt(req.params.id));

    await myDataSource.getRepository(Reponse).findOneBy({ id: parseInt(req.params.id) })
        .then(reponse => {
            if (!reponse) {
                return generateServerErrorCode(res, 400, "L'id n'existe pas", "La réponse demandée n'existe pas.");
            }
            if (resultat) {
                return generateServerErrorCode(res, 400, "Contrainte", "Cette réponse est liée à d'autres enregistrements.");
            }
            return myDataSource.getRepository(Reponse).softRemove(reponse)
                .then(_ => success(res, 200, reponse, "La réponse a bien été supprimée."));
        })
        .catch(error => generateServerErrorCode(res, 500, error, "Erreur lors de la suppression de la réponse."));
};

// PropositionReponse Récupérer les réponses d'une proposition
export const getReponsesByProposition = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Reponse)
        .createQueryBuilder("reponse")
        .leftJoinAndSelect("reponse.proposition", "proposition")
        .where("reponse.proposition.id = :id", { id: parseInt(req.params.id) })
        .andWhere("reponse.deletedAt IS NULL")
        .getMany()
        .then(reponses => {
            if (!reponses || reponses.length === 0) {
                return generateServerErrorCode(res, 400, "Not Found", "Aucune réponse ne correspond à cette proposition.");
            }
            return success(res, 200, reponses, "Les réponses ont été récupérées avec succès.");
        })
        .catch(error => generateServerErrorCode(res, 500, error, "Erreur lors de la récupération des réponses."));
};

// PropositionReponse Résultats d'une question (votes)
export const getResultsByQuestion = async (req: Request, res: Response) => {
    const questionId = parseInt(req.params.questionId);

    if (isNaN(questionId) || questionId <= 0) {
        return generateServerErrorCode(res, 400, "Invalid Question ID", "L'identifiant de la question doit être un nombre valide.");
    }

    try {
        const results = await myDataSource
            .getRepository(PropositionReponse)
            .createQueryBuilder("proposition")
            .leftJoinAndSelect("proposition.reponses", "reponse")
            .leftJoin("proposition.question", "question")
            .where("question.id = :questionId", { questionId })
            .andWhere("question.deletedAt IS NULL")
            .andWhere("proposition.deletedAt IS NULL")
            .andWhere("reponse.deletedAt IS NULL")
            .select([
                "proposition.id AS propositionId",
                "proposition.contenu AS label",
                "COUNT(reponse.id) AS count"
            ])
            .groupBy("proposition.id, proposition.contenu")
            .getRawMany();

        if (!results || results.length === 0) {
            return generateServerErrorCode(res, 404, "No Results", "Aucun résultat disponible pour cette question.");
        }

        const totalVotes = results.reduce((sum, result) => sum + (result.count || 0), 0);

        const formattedResults = results.map(result => ({
            propositionId: result.propositionId,
            label: result.label,
            count: result.count || 0,
            percentage: totalVotes > 0 ? ((result.count / totalVotes) * 100).toFixed(1) : 0,
        }));

        return success(res, 200, { success: true, data: formattedResults, totalVotes }, "Résultats récupérés avec succès.");
    } catch (error) {
        return generateServerErrorCode(res, 500, error, "Erreur lors de la récupération des résultats.");
    }
};
