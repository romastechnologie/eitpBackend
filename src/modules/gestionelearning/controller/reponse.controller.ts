
import { Reponse } from "../entity/Reponse";
import { Question } from "../entity/Question";
import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate, ValidatorOptions } from "class-validator"; // Import ValidatorOptions
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { In } from "typeorm";
import { PropositionReponse } from "../entity/PropositionReponse";

export const createReponse = async (req: Request, res: Response) => {
    const { sondageId, questionId, propositionIds } = req.body;

    console.log("Données reçues:", req.body);

    // Validation des champs obligatoires
    if (!sondageId) {
        return generateServerErrorCode(res, 400, null, "L'identifiant du sondage est obligatoire");
    }
    if (!questionId) {
        return generateServerErrorCode(res, 400, null, "L'identifiant de la question est obligatoire");
    }
    if (!propositionIds || !Array.isArray(propositionIds) || propositionIds.length === 0) {
        return generateServerErrorCode(res, 400, null, "Au moins un identifiant de proposition est obligatoire");
    }

    try {
        const reponses = await myDataSource.transaction(async (transactionalEntityManager) => {
            // Vérifier que le sondage existe
            const sondage = await transactionalEntityManager.getRepository(Sondage).findOneBy({
                id: parseInt(sondageId),
                deletedAt: null,
            });
            if (!sondage) {
                throw new Error("Le sondage spécifié n'existe pas ou a été supprimé");
            }

            // Vérifier que la question existe et appartient au sondage
            const question = await transactionalEntityManager.getRepository(Question).findOneBy({
                id: parseInt(questionId),
                // sondage: { id: parseInt(sondageId) }, // Décommentez pour filtrer uniquement les questions liées au sondage
                deletedAt: null,
            });
            console.log("Question trouvée:", question);
            if (!question) {
                throw new Error("La question spécifiée n'existe pas ou n'est pas associée au sondage");
            }

            // Utiliser l'opérateur In pour rechercher les propositions
            const propositionEntities = await transactionalEntityManager.getRepository(PropositionReponse).find({
                where: {
                    id: In(propositionIds.map(id => parseInt(id))),
                    question: { id: parseInt(questionId) },
                    deletedAt: null,
                },
            });

            console.log("Propositions trouvées:", propositionEntities);
            console.log("Nombre de propositions trouvées:", propositionEntities.length);
            console.log("Nombre de propositions demandées:", propositionIds.length);

            // Vérifier que toutes les propositions ont été trouvées
            if (propositionEntities.length !== propositionIds.length) {
                const foundIds = propositionEntities.map(p => p.id.toString());
                const missingIds = propositionIds.filter(id => !foundIds.includes(id.toString()));
                console.log("IDs manquants:", missingIds);
                throw new Error(`Une ou plusieurs propositions spécifiées n'existent pas ou ne sont pas associées à la question. IDs manquants: ${missingIds.join(', ')}`);
            }

            // Créer une réponse pour chaque proposition avec initialisation complète
            const reponses = [];
            for (let i = 0; i < propositionIds.length; i++) {
                const propId = parseInt(propositionIds[i]);
                const proposition = propositionEntities.find(p => p.id === propId);

                if (!proposition) {
                    throw new Error(`Proposition avec ID ${propId} introuvable`);
                }

                const reponseEntity = transactionalEntityManager.getRepository(Reponse).create({
                    proposition: proposition,
                    
                    // question: question, // Décommentez si la relation question est requise dans Reponse
                });
                reponses.push(reponseEntity);
            }

            // Validation avec options pour ignorer les champs non définis
            const validatorOptions: ValidatorOptions = {
                skipMissingProperties: true, // Ignore les champs non définis
                forbidUnknownValues: false, // Autorise les valeurs inconnues
            };
            const errors = await validate(reponses, validatorOptions);
            if (errors.length > 0) {
                const message = validateMessage(errors);
                throw new Error(message);
            }

            return await transactionalEntityManager.getRepository(Reponse).save(reponses);
        });

        const message = `Les réponses ont été créées avec succès pour le sondage ${sondageId}.`;
        return success(res, 201, reponses, message);
    } catch (error) {
        console.error("Erreur lors de la création de la réponse:", error);
        const message = error.message || "Les réponses n'ont pas pu être ajoutées. Réessayez dans quelques instants.";
        return generateServerErrorCode(res, 500, error, message);
    }
};

export const getAllReponses = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Reponse);

    let query = await myDataSource.getRepository(Reponse)
        .createQueryBuilder("reponse")
        .leftJoinAndSelect("reponse.proposition", "proposition")
        .where("reponse.deletedAt IS NULL");
    
    if (searchTerm && searchTerm.trim() !== "") {
        query.andWhere(
            `(proposition.contenu LIKE :keyword)`,
            { keyword: `%${searchTerm}%` }
        );
    }
    query.orderBy(`reponse.id`, 'ASC')
        .skip(startIndex)
        .take(limit)
        .getManyAndCount()
        .then(([data, totalElements]) => {
            const message = 'La liste des réponses a bien été récupérée.';
            const totalPages = Math.ceil(totalElements / limit);
            return success(res, 200, { data, totalPages, totalElements, limit }, message);
        }).catch(error => {
            const message = `La liste des réponses n'a pas pu être récupérée. Réessayez dans quelques instants.`;
            return generateServerErrorCode(res, 500, error, message);
        });
};

export const getReponse = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Reponse)
        .createQueryBuilder("reponse")
        .leftJoinAndSelect("reponse.proposition", "proposition")
        .where("reponse.id = :id", { id: parseInt(req.params.id) })
        .andWhere("reponse.deletedAt IS NULL")
        .getOne()
        .then(reponse => {
            if (!reponse) {
                const message = `La réponse demandée n'existe pas. Réessayez avec un autre identifiant.`;
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
            }
            const message = `La réponse a bien été trouvée.`;
            return success(res, 200, reponse, message);
        })
        .catch(error => {
            const message = `La réponse n'a pas pu être récupérée. Réessayez dans quelques instants.`;
            return generateServerErrorCode(res, 500, error, message);
        });
};

export const updateReponse = async (req: Request, res: Response) => {
    const reponse = await myDataSource.getRepository(Reponse).findOneBy({ id: parseInt(req.params.id) });
    if (!reponse) {
        return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Cette réponse existe déjà');
    }
    myDataSource.getRepository(Reponse).merge(reponse, req.body);
    const errors = await validate(reponse);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res, 400, errors, message);
    }
    await myDataSource.getRepository(Reponse).save(reponse).then(reponse => {
        const message = `La réponse a bien été modifiée.`;
        return success(res, 200, reponse, message);
    }).catch(error => {
        if (error instanceof ValidationError) {
            return generateServerErrorCode(res, 400, error, 'Cette réponse existe déjà');
        }
        if (error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, 'Cette réponse existe déjà');
        }
        const message = `La réponse n'a pas pu être ajoutée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    });
};

export const deleteReponse = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Reponse', parseInt(req.params.id));
    await myDataSource.getRepository(Reponse).findOneBy({ id: parseInt(req.params.id) }).then(reponse => {
        if (!reponse) {
            const message = `La réponse demandée n'existe pas. Réessayez avec un autre identifiant.`;
            return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
        }
        if (resultat) {
            const message = `Cette réponse est liée à d'autres enregistrements. Vous ne pouvez pas la supprimer.`;
            return generateServerErrorCode(res, 400, "Cette réponse est liée à d'autres enregistrements. Vous ne pouvez pas la supprimer.", message);
        } else {
            myDataSource.getRepository(Reponse).softRemove(reponse)
                .then(_ => {
                    const message = `La réponse a bien été supprimée.`;
                    return success(res, 200, reponse, message);
                });
        }
    }).catch(error => {
        const message = `La réponse n'a pas pu être supprimée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    });
};

export const getReponsesByProposition = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Reponse)
        .createQueryBuilder("reponse")
        .leftJoinAndSelect("reponse.proposition", "proposition")
        .where("reponse.proposition.id = :id", { id: parseInt(req.params.id) })
        .andWhere("reponse.deletedAt IS NULL")
        .getMany()
        .then(reponses => {
            if (!reponses || reponses.length === 0) {
                const message = `Aucune réponse ne correspond à cette proposition.`;
                return generateServerErrorCode(res, 400, "Aucune réponse ne correspond à cette proposition", message);
            }
            const message = `Les réponses à la proposition ont été récupérées avec succès.`;
            return success(res, 200, reponses, message);
        })
        .catch(error => {
            const message = `Les réponses n'ont pas pu être récupérées. Réessayez dans quelques instants.`;
            return generateServerErrorCode(res, 500, error, message);
        });
};

export const getResultsByQuestion = async (req: Request, res: Response) => {
    const questionId = parseInt(req.params.questionId);

    if (isNaN(questionId) || questionId <= 0) {
        const message = `L'identifiant de la question doit être un nombre valide.`;
        return generateServerErrorCode(res, 400, "Invalid Question ID", message);
    }

    try {
        // Récupérer les propositions associées à la question et compter les réponses
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
            const message = `Aucun résultat disponible pour cette question.`;
            return generateServerErrorCode(res, 404, "No Results", message);
        }

        // Calculer le total des votes
        const totalVotes = results.reduce((sum, result) => sum + (result.count || 0), 0);

        // Calculer les pourcentages
        const formattedResults = results.map(result => ({
            propositionId: result.propositionId,
            label: result.label,
            count: result.count || 0,
            percentage: totalVotes > 0 ? ((result.count / totalVotes) * 100).toFixed(1) : 0,
        }));

        const message = `Les résultats de la question ont été récupérés avec succès.`;
        return success(res, 200, { success: true, data: formattedResults, totalVotes }, message);
    } catch (error) {
        const message = `Les résultats de la question n'ont pas pu être récupérés. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};

// export const getSondageByCodeLien = async (req: Request, res: Response) => {
//   const codeLien = req.params.codeLien;

//   if (!codeLien) {
//     const message = `Le code de lien est obligatoire.`;
//     return generateServerErrorCode(res, 400, "Invalid CodeLien", message);
//   }

//   try {
//     const sondage = await myDataSource
//       .getRepository(Sondage)
//       .createQueryBuilder("sondage")
//       .leftJoinAndSelect("sondage.questions", "questions")
//       .leftJoinAndSelect("questions.propositions", "propositions")
//       .leftJoinAndSelect("propositions.reponses", "reponses")
//       .where("sondage.codeLien = :codeLien", { codeLien })
//       .andWhere("sondage.deletedAt IS NULL")
//       .getOne();

//     if (!sondage) {
//       const message = `Le sondage demandé n'existe pas pour ce code de lien.`;
//       return generateServerErrorCode(res, 404, "Sondage non trouvé", message);
//     }

//     const message = `Le sondage a bien été trouvé via le code de lien.`;
//     return success(res, 200, sondage, message);
//   } catch (error) {
//     const message = `Le sondage n'a pas pu être récupéré via le code de lien. Réessayez dans quelques instants.`;
//     return generateServerErrorCode(res, 500, error, message);
//   }
// };


// export const getQuestionsBySondage = async (req: Request, res: Response) => {
//   const sondageId = parseInt(req.params.id);

//   if (isNaN(sondageId) || sondageId <= 0) {
//     const message = `L'identifiant du sondage doit être un nombre valide.`;
//     return generateServerErrorCode(res, 400, "Invalid Sondage ID", message);
//   }

//   try {
//     const sondage = await myDataSource
//       .getRepository(Sondage)
//       .createQueryBuilder("sondage")
//       .leftJoinAndSelect("sondage.questions", "questions")
//       .leftJoinAndSelect("questions.propositions", "propositions")
//       .where("sondage.id = :id", { id: sondageId })
//       .andWhere("sondage.deletedAt IS NULL")
//       .getOne();

//     if (!sondage || !sondage.questions) {
//       const message = `Aucun sondage ou aucune question trouvée pour cet identifiant.`;
//       return generateServerErrorCode(res, 404, "Sondage non trouvé", message);
//     }

//     const message = `Les questions du sondage ont été récupérées avec succès.`;
//     return success(res, 200, { data: sondage.questions }, message);
//   } catch (error) {
//     const message = `Les questions du sondage n'ont pas pu être récupérées. Réessayez dans quelques instants.`;
//     return generateServerErrorCode(res, 500, error, message);
//   }
// };