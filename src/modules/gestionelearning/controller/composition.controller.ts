import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Composition } from "../entity/Composition";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { FiliereNiveauMatiere } from "../entity/FiliereNiveauMatiere";
import { DataSource } from "typeorm";
import { Question } from "../entity/Question";
import { CompositionQuestion } from "../entity/CompositionQuestion";
import { Reponse } from "../entity/Reponse";

export const createComposition = async (req: Request, res: Response) => {
    const { titre, dateComposition, professeur, annee, type, filiereNiveauMatiere, compoQuestions } = req.body;

    const queryRunner = myDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        let composition = queryRunner.manager.create(Composition, {
            titre,
            dateComposition,
            professeur,
            annee,
            type,
            filiereNiveauMatiere
        });

        const errors = await validate(composition);
        if (errors.length > 0) {
            const message = errors.map(e => Object.values(e.constraints || {}).join(", ")).join("; ");
            return generateServerErrorCode(res, 400, errors, message);
        }

        composition = await queryRunner.manager.save(composition);

        // Parcourir les questions et leurs réponses
        for (const cq of compoQuestions) {
            if (!cq.question?.id) continue;

            const question = await queryRunner.manager.findOne(Question, { where: { id: cq.question.id } });
            if (!question) continue;

            const compositionQuestion = queryRunner.manager.create(CompositionQuestion, {
                composition,
                question,
                estActif: true
            });

            await queryRunner.manager.save(compositionQuestion);

            // Ici on enregistre les réponses liées à cette question
            if (cq.reponses && cq.reponses.length > 0) {
                for (const rep of cq.reponses) {
                    const reponse = queryRunner.manager.create(Reponse, {
                        contenu: rep.contenu,
                        question: question,
                        composition: composition,
                        user: rep.userId ? { id: rep.userId } : undefined  // optionnel
                    });

                    await queryRunner.manager.save(reponse);
                }
            }
        }

        await queryRunner.commitTransaction();
        return success(res, 201, composition, `La composition "${composition.titre}" a bien été créée avec ses questions et réponses.`);

    } catch (error: any) {
        await queryRunner.rollbackTransaction();
        if (error.code === "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, "Cette entrée existe déjà.");
        }
        return generateServerErrorCode(res, 500, error, "La composition n'a pas pu être ajoutée.");
    } finally {
        await queryRunner.release();
    }
};


export const getAllComposition = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Composition);

    try {
        let reque = await myDataSource.getRepository(Composition)
  .createQueryBuilder('composition')
  .leftJoinAndSelect('composition.professeur', 'professeur')
  .leftJoinAndSelect('composition.annee', 'annee')
  .leftJoinAndSelect('composition.filiereNiveauMatiere', 'filiereNiveauMatiere')
  .leftJoinAndSelect('filiereNiveauMatiere.filiere', 'filiere')
  .leftJoinAndSelect('filiereNiveauMatiere.niveau', 'niveau')
  .leftJoinAndSelect('filiereNiveauMatiere.matiere', 'matiere')
   .leftJoinAndSelect('composition.compoQuestions', 'compoQuestions')
  .leftJoinAndSelect('compoQuestions.question', 'question')
  .where("composition.deletedAt IS NULL");


        if (searchQueries.length > 0) {
            reque.andWhere(new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
            }));
        }

        const [data, totalElements] = await reque
            .skip(startIndex)
            .take(limit)
            .getManyAndCount();

        const message = 'La liste des compositions a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res, 200, { data, totalPages, totalElements, limit }, message);

    } catch (error) {
        const message = `La liste des compositions n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};


export const getComposition = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Composition).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            professeur: true,
            annee: true,
            filiereNiveauMatiere: {
                filiere: true,
                niveau: true,
                matiere: true
            },
            compoQuestions: {
                question: {
                    reponses: true 
                }
            }
        },
    })
    .then(composition => {
        if (composition === null) {
            const message = `La composition demandée n'existe pas. Réessayez avec un autre identifiant.`;
            return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
        }
        const message = `Composition récupérée avec succès.`;
        return success(res, 200, composition, message);
    })
    .catch(error => {
        const message = `La composition n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    });
};



export const updateComposition = async (req: Request, res: Response) => {
    try {
        const compositionRepo = myDataSource.getRepository(Composition);
        const compoQuestionRepo = myDataSource.getRepository(CompositionQuestion);

        // 🔹 Récupération de la composition avec toutes les relations nécessaires
        const composition = await compositionRepo.findOne({
            where: { id: parseInt(req.params.id) },
            relations: {
                professeur: true,
                annee: true,
                filiereNiveauMatiere: { filiere: true, niveau: true, matiere: true },
                compoQuestions: { question: true }
            }
        });

        if (!composition) {
            return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Cette composition existe déjà');
        }

        // 🔹 Mise à jour des champs de la composition
        compositionRepo.merge(composition, req.body);

        // 🔹 Gestion des questions
        const newQuestions = req.body.questionsAdded || [];

        // Supprimer les questions non incluses dans newQuestions
        if (composition.compoQuestions) {
            composition.compoQuestions = composition.compoQuestions.filter(cq =>
                newQuestions.some((q: any) => q.id === cq.question.id)
            );
        } else {
            composition.compoQuestions = [];
        }

        // Ajouter les nouvelles questions
        for (const q of newQuestions) {
            if (!composition.compoQuestions.find(cq => cq.question.id === q.id)) {
                composition.compoQuestions.push(
                    compoQuestionRepo.create({
                        composition,
                        question: { id: q.id } as any
                    })
                );
            }
        }

        // 🔹 Validation
        const errors = await validate(composition);
        if (errors.length > 0) {
            const message = validateMessage(errors);
            return generateServerErrorCode(res, 400, errors, message);
        }

        // 🔹 Sauvegarde
        const savedComposition = await compositionRepo.save(composition);

        // 🔹 Recharger la composition avec toutes les relations pour l'affichage
        const compositionWithQuestions = await compositionRepo.findOne({
            where: { id: savedComposition.id },
            relations: {
                professeur: true,
                annee: true,
                filiereNiveauMatiere: { filiere: true, niveau: true, matiere: true },
                compoQuestions: { question: true }
            }
        });

        const message = `La composition ${savedComposition.id} a bien été modifiée.`;
        return success(res, 200, compositionWithQuestions, message);

    } catch (error: any) {
        if (error instanceof ValidationError) {
            return generateServerErrorCode(res, 400, error, 'Cette composition existe déjà');
        }
        if (error.code === "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, 'Cette composition existe déjà');
        }
        const message = `La composition n'a pas pu être modifiée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};


export const deleteComposition = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Composition', parseInt(req.params.id));
    await myDataSource.getRepository(Composition)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(composition => {        
        if(composition === null) {
          const message = `La composition demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette composition est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette composition est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Composition).softRemove(composition)
            .then(_ => {
                const message = `La composition avec l'identifiant n°${composition.id} a bien été supprimé.`;
                return success(res,200, composition,message);
            })
        }
    }).catch(error => {
        const message = `La composition n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

// export const getAllFiliereNiveauMatieres = async (req: Request, res: Response) => {
//     const { filiere, niveau } = req.query;

//     if (!filiere || !niveau) {
//         return generateServerErrorCode(res, 400, null, "Les paramètres filiere et niveau sont requis.");
//     }

//     const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, FiliereNiveauMatiere);

//     try {
//         let query = myDataSource.getRepository(FiliereNiveauMatiere)
//             .createQueryBuilder('filiereNiveauMatiere')
//             .leftJoinAndSelect('filiereNiveauMatiere.filiere', 'filiere')
//             .leftJoinAndSelect('filiereNiveauMatiere.niveau', 'niveau')
//             .leftJoinAndSelect('filiereNiveauMatiere.matiere', 'matiere')
//             .where('filiereNiveauMatiere.deletedAt IS NULL')
//             .andWhere('filiereNiveauMatiere.statut = :statut', { statut: 1 })
//             .andWhere('filiere.deletedAt IS NULL')
//             .andWhere('niveau.deletedAt IS NULL')
//             .andWhere('matiere.deletedAt IS NULL')
//             .andWhere('filiere.id = :filiereId', { filiereId: parseInt(filiere as string) })
//             .andWhere('niveau.id = :niveauId', { niveauId: parseInt(niveau as string) });

//         if (searchQueries.length > 0) {
//             query = query.andWhere(new Brackets(qb => {
//                 qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` });
//             }));
//         }

//         const [data, totalElements] = await query
//             .skip(startIndex)
//             .take(limit)
//             .getManyAndCount();

//         if (data.length === 0) {
//             return success(res, 200, { data: [], totalPages: 0, totalElements: 0, limit }, "Aucune matière trouvée pour cette combinaison filière-niveau.");
//         }

//         const message = 'Liste des combinaisons filière-niveau-matière récupérée avec succès.';
//         const totalPages = Math.ceil(totalElements / limit);
//         return success(res, 200, { data, totalPages, totalElements, limit }, message);

//     } catch (error) {
//         console.error('Erreur lors de la récupération des combinaisons:', error);
//         const message = 'Impossible de récupérer les combinaisons filière-niveau-matière.';
//         return generateServerErrorCode(res, 500, error, message);
//     }
// };
