import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { Brackets } from "typeorm";
import { EmploiDuTemps } from "../entity/EmploiDuTemps";
import { Cours } from "../entity/Cours";
import { Classe } from "../entity/Classe";
import { Professeur } from "../../gestionelearning/entity/Professeur";
import { FiliereNiveauMatiere } from "../../gestionelearning/entity/FiliereNiveauMatiere";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Filiere } from "../../gestionelearning/entity/Filiere";
import { Niveau } from "../../gestionelearning/entity/Niveau";
import { TypeEmploiDuTemps } from "../entity/TypeEmploiDuTemps";

export const createEmploiDuTemps = async (req: Request, res: Response) => {
    const { dateDebut, dateFin, typeEmploi, filiereId, niveauId, cours: coursData } = req.body;

    const queryRunner = myDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // Récupération des entités
        const filiere = await queryRunner.manager.getRepository(Filiere).findOneBy({ id: filiereId });
        const niveau = await queryRunner.manager.getRepository(Niveau).findOneBy({ id: niveauId });

        if (!filiere || !niveau) {
            return generateServerErrorCode(res, 400, null, "Filière ou niveau invalide.");
        }

        let emploiDuTemps = queryRunner.manager.create(EmploiDuTemps, {
            dateDebut,
            dateFin,
            typeEmploi,
            filiere,
            niveau,
        });

        // Validation de l'emploi du temps
        const errors = await validate(emploiDuTemps);
        if (errors.length > 0) {
            const message = errors.map(e => Object.values(e.constraints || {}).join(", ")).join("; ");
            return generateServerErrorCode(res, 400, errors, message);
        }

        emploiDuTemps = await queryRunner.manager.save(emploiDuTemps);

        if (coursData && coursData.length > 0) {
            const newCoursForClasse: any[] = []; // Pour vérifier les conflits internes

            for (const coursInfo of coursData) {
                const filiereNiveauMatiere = await queryRunner.manager.getRepository(FiliereNiveauMatiere)
                    .findOneBy({ id: coursInfo.filiereNiveauMatiereId });
                const professeur = await queryRunner.manager.getRepository(Professeur)
                    .findOneBy({ id: coursInfo.professeurId });
                const classe = await queryRunner.manager.getRepository(Classe)
                    .findOneBy({ id: coursInfo.classeId });

                if (!filiereNiveauMatiere || !professeur || !classe) {
                    await queryRunner.rollbackTransaction();
                    return generateServerErrorCode(res, 400, null, 'Classe, professeur ou filière invalide.');
                }

                // Vérifier conflit interne au batch
                const internalConflict = newCoursForClasse.find(c =>
                    c.classeId === classe.id &&
                    c.jour === coursInfo.jour &&
                    !c.estEnLigne &&
                    (c.heureDebut < coursInfo.heureFin && c.heureFin > coursInfo.heureDebut)
                );

                if (internalConflict) {
                    await queryRunner.rollbackTransaction();
                    return generateServerErrorCode(
                        res,
                        400,
                        null,
                        `Conflit interne détecté pour la classe ${classe.libelle} le ${coursInfo.jour} de ${coursInfo.heureDebut} à ${coursInfo.heureFin}.`
                    );
                }

                // Vérifier conflit dans la DB
                const conflict = await queryRunner.manager.getRepository(Cours)
                    .createQueryBuilder('cours')
                    .leftJoin('cours.classe', 'classe')
                    .leftJoin('cours.emploiDuTemps', 'emploiDuTemps')
                    .where('classe.id = :classeId', { classeId: classe.id })
                    .andWhere('cours.jour = :jour', { jour: coursInfo.jour })
                    .andWhere('cours.estEnLigne = false')
                    .andWhere('emploiDuTemps.deletedAt IS NULL')
                    .andWhere('(cours.heureDebut < :heureFin AND cours.heureFin > :heureDebut)', {
                        heureDebut: coursInfo.heureDebut,
                        heureFin: coursInfo.heureFin
                    })
                    .getOne();

                if (conflict) {
                    await queryRunner.rollbackTransaction();
                    return generateServerErrorCode(
                        res,
                        400,
                        null,
                        `La classe ${classe.libelle} est déjà occupée le ${coursInfo.jour} de ${coursInfo.heureDebut} à ${coursInfo.heureFin}.`
                    );
                }

                // Créer le cours
                const cours = queryRunner.manager.create(Cours, {
                    heureDebut: coursInfo.heureDebut,
                    heureFin: coursInfo.heureFin,
                    jour: coursInfo.jour,
                    estEnLigne: coursInfo.estEnLigne === true || coursInfo.estEnLigne === "on" || coursInfo.estEnLigne === 1,
                    emploiDuTemps,
                    filiereNiveauMatiere,
                    professeur,
                    classe
                });

                const coursErrors = await validate(cours);
                if (coursErrors.length > 0) {
                    const message = coursErrors.map(e => Object.values(e.constraints || {}).join(", ")).join("; ");
                    await queryRunner.rollbackTransaction();
                    return generateServerErrorCode(res, 400, coursErrors, message);
                }

                await queryRunner.manager.save(cours);
                newCoursForClasse.push(coursInfo); // Ajouter au batch
            }
        }

        await queryRunner.commitTransaction();
        return success(res, 201, emploiDuTemps, `L'emploi du temps a bien été créé avec ses cours.`);

    } catch (error: any) {
        await queryRunner.rollbackTransaction();
        console.error('Erreur détaillée lors de la création de l\'emploi du temps:', error);

        if (error.code === "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, "Cette entrée existe déjà.");
        }

        return generateServerErrorCode(res, 500, error, "L'emploi du temps n'a pas pu être ajouté.");
    } finally {
        await queryRunner.release();
    }
};

export const checkClasseAvailability = async (req: Request, res: Response) => {
    try {
        const { classeId, jour, heureDebut, heureFin } = req.query;

         console.log('Paramètres reçus:', { classeId, jour, heureDebut, heureFin });
        
        if (!classeId || !jour || !heureDebut || !heureFin) {
            console.log('Paramètres manquants');
            return generateServerErrorCode(res, 400, null, "Paramètres manquants");
        }

         if (jour === 'undefined' || jour === undefined) {
            console.log('Jour undefined détecté');
            return generateServerErrorCode(res, 400, null, "Jour invalide");
        }

        // Vérification des paramètres
        const classeIdNum = parseInt(classeId as string);
        if (isNaN(classeIdNum)) {
            return generateServerErrorCode(res, 400, null, "ID de classe invalide");
        }

        // Vérifier s'il y a un cours existant dans cette classe pour ce créneau (seulement les cours physiques)
        console.log('Check disponibilité - classe:', classeIdNum, 'jour:', jour, 'heures:', heureDebut, '-', heureFin);
        
        const existingCours = await myDataSource.getRepository(Cours)
            .createQueryBuilder('cours')
            .leftJoin('cours.classe', 'classe')
            .leftJoin('cours.emploiDuTemps', 'emploiDuTemps')
            .where('classe.id = :classeId', { classeId: classeIdNum })
            .andWhere('cours.jour = :jour', { jour: jour as string })
            .andWhere('cours.estEnLigne = false')  // Ignorer les cours en ligne
            .andWhere('emploiDuTemps.deletedAt IS NULL')
            .andWhere(
                new Brackets(qb => {
                    qb.where(
                        '(cours.heureDebut < :heureFin AND cours.heureFin > :heureDebut)',
                        { heureDebut: heureDebut as string, heureFin: heureFin as string }
                    );
                })
            )
            .getOne();

        console.log('Cours existant trouvé:', existingCours ? 'OUI' : 'NON');

        const isAvailable = !existingCours;

        return success(res, 200, { 
            available: isAvailable,
            hasConflict: !isAvailable,
            conflictingCours: existingCours || null 
        }, isAvailable ? "Classe disponible" : "Classe occupée");

    } catch (error: any) {
        console.error('Erreur lors de la vérification de disponibilité:', error);
        console.error('Erreur dans checkClasseAvailability:', error);
        return generateServerErrorCode(res, 500, error, "Erreur lors de la vérification");
    }
};

// export const checkClasseAvailability = async (req: Request, res: Response) => {
//   try {
//     const { classeId, jour, heureDebut, heureFin } = req.query;
    
//     if (!classeId || !jour || !heureDebut || !heureFin) {
//       return generateServerErrorCode(res, 400, null, "Paramètres manquants");
//     }

//     // Vérifier s'il y a un cours existant dans cette classe pour ce créneau (seulement les cours physiques)
//     const existingCours = await myDataSource.getRepository(Cours)
//       .createQueryBuilder('cours')
//       .leftJoin('cours.classe', 'classe')
//       .leftJoin('cours.emploiDuTemps', 'emploiDuTemps')
//       .where('classe.id = :classeId', { classeId: parseInt(classeId as string) })
//       .andWhere('cours.jour = :jour', { jour: jour as string })
//       .andWhere('cours.estEnLigne = false')  // Ajout : ignorer les cours en ligne
//       .andWhere('emploiDuTemps.deletedAt IS NULL')
//       .andWhere(
//         new Brackets(qb => {
//           qb.where(
//             '(cours.heureDebut < :heureFin AND cours.heureFin > :heureDebut)',
//             { heureDebut: heureDebut as string, heureFin: heureFin as string }
//           );
//         })
//       )
//       .getOne();

//     const isAvailable = !existingCours;

//     return success(res, 200, { 
//       available: isAvailable,
//       hasConflict: !isAvailable,
//       conflictingCours: existingCours || null 
//     }, isAvailable ? "Classe disponible" : "Classe occupée");

//   } catch (error: any) {
//     console.error('Erreur lors de la vérification de disponibilité:', error);
//     return generateServerErrorCode(res, 500, error, "Erreur lors de la vérification");
//   }
// };

export const getAllEmploiDuTemps = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, EmploiDuTemps);

    try {
        let reque = myDataSource.getRepository(EmploiDuTemps)
            .createQueryBuilder('emploiDuTemps')
            .leftJoinAndSelect('emploiDuTemps.typeEmploi', 'typeEmploi')
            .leftJoinAndSelect('emploiDuTemps.cours', 'cours')
            // .leftJoinAndSelect('emploiDuTemps.cours', 'filiere')
            // .leftJoinAndSelect('emploiDuTemps.cours', 'niveau')
            .leftJoinAndSelect('cours.filiereNiveauMatiere', 'filiereNiveauMatiere')
            .leftJoinAndSelect('filiereNiveauMatiere.filiere', 'filiere')
            .leftJoinAndSelect('filiereNiveauMatiere.niveau', 'niveau')
            .leftJoinAndSelect('filiereNiveauMatiere.matiere', 'matiere')
            .leftJoinAndSelect('cours.professeur', 'professeur')
            .leftJoinAndSelect('cours.classe', 'classe')
            .where("emploiDuTemps.deletedAt IS NULL");

        if (searchQueries && Array.isArray(searchQueries) && searchQueries.length > 0 && searchTerm) {
            reque.andWhere(new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` });
            }));
        }

        reque.orderBy('emploiDuTemps.createdAt', 'ASC');

        const [data, totalElements] = await reque
            .skip(startIndex)
            .take(limit)
            .getManyAndCount();

        const message = 'La liste des emplois du temps a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        
        return success(res, 200, { data, totalPages, totalElements, limit }, message);

    } catch (error) {

        console.error('Erreur détaillée dans getAllEmploiDuTemps:', error);
        console.error('Stack trace:', error.stack);
        
        const message = `La liste des emplois du temps n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};

export const getEmploiDuTemps = async (req: Request, res: Response) => {
    await myDataSource.getRepository(EmploiDuTemps).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: [
            'cours',
            'cours.filiereNiveauMatiere',
            'cours.filiereNiveauMatiere.filiere',
            'cours.filiereNiveauMatiere.niveau',
            'cours.filiereNiveauMatiere.matiere',
            'cours.professeur',
            'cours.classe',
                'filiere',  
                'niveau',
                'typeEmploi'
        ],
    })
    .then(emploiDuTemps => {
        if (emploiDuTemps === null) {
            const message = `L'emploi du temps demandé n'existe pas.`;
            return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
        }
        const message = `Emploi du temps récupéré avec succès.`;
        return success(res, 200, emploiDuTemps, message);
    })
    .catch(error => {
        const message = `L'emploi du temps n'a pas pu être récupéré.`;
        return generateServerErrorCode(res, 500, error, message);
    });
};

export const updateEmploiDuTemps = async (req: Request, res: Response) => {
    try {
        const emploiDuTempsRepo = myDataSource.getRepository(EmploiDuTemps);
        const coursRepo = myDataSource.getRepository(Cours);

        const emploiDuTemps = await emploiDuTempsRepo.findOne({
            where: { id: parseInt(req.params.id) },
            relations: [
                'cours',
                'cours.filiereNiveauMatiere',
                'cours.filiereNiveauMatiere.filiere',
                'cours.filiereNiveauMatiere.niveau',
                'cours.filiereNiveauMatiere.matiere',
                'cours.professeur',
                'cours.classe',
                'filiere',  
                'niveau',
                'typeEmploi'
            ]
        });

        if (!emploiDuTemps) {
            return generateServerErrorCode(res, 400, "L'id n'existe pas", "Cet emploi du temps n'existe pas");
        }

        const { coursToCreate, coursToUpdate, coursToDelete, filiereId, niveauId, typeEmploi, ...rest } = req.body;

        console.log('=== BACKEND RECEIVED ===');
        console.log('filiereId:', filiereId);
        console.log('niveauId:', niveauId);
        console.log('typeEmploi:', typeEmploi);
        console.log('rest:', rest);
        console.log('Full body:', req.body);

        if (filiereId) {
            const filiere = await myDataSource.getRepository(Filiere).findOneBy({ id: filiereId });
            if (!filiere) return generateServerErrorCode(res, 400, null, "Filière invalide.");
            emploiDuTemps.filiere = filiere;
        }

        if (niveauId) {
            const niveau = await myDataSource.getRepository(Niveau).findOneBy({ id: niveauId });
            if (!niveau) return generateServerErrorCode(res, 400, null, "Niveau invalide.");
            emploiDuTemps.niveau = niveau;
        }

        if (req.body.typeEmploi) {
        // Si typeEmploi est un objet avec une propriété value
        const typeEmploiId = typeof req.body.typeEmploi === 'object' 
            ? req.body.typeEmploi.value || req.body.typeEmploi.id
            : req.body.typeEmploi;
            
        const typeEmploi = await myDataSource.getRepository(TypeEmploiDuTemps)
            .findOneBy({ id: typeEmploiId });
        if (!typeEmploi) return generateServerErrorCode(res, 400, null, "Type d'emploi invalide.");
        emploiDuTemps.typeEmploi = typeEmploi;
    }

        emploiDuTempsRepo.merge(emploiDuTemps, rest);

        if (Array.isArray(coursToCreate)) {
            for (const coursInfo of coursToCreate) {
                const filiereNiveauMatiere = await myDataSource.getRepository(FiliereNiveauMatiere)
                    .findOneBy({ id: coursInfo.filiereNiveauMatiereId });
                const professeur = await myDataSource.getRepository(Professeur)
                    .findOneBy({ id: coursInfo.professeurId });
                const classe = await myDataSource.getRepository(Classe)
                    .findOneBy({ id: coursInfo.classeId });

                if (!filiereNiveauMatiere || !professeur || !classe) {
                    return generateServerErrorCode(res, 400, null, "Classe, professeur ou filière invalide.");
                }

                const newCours = coursRepo.create({
                    ...coursInfo,
                    filiereNiveauMatiere,
                    professeur,
                    classe,
                    emploiDuTemps
                });
                await coursRepo.save(newCours);
            }
        }

        if (Array.isArray(coursToUpdate)) {
            for (const coursInfo of coursToUpdate) {
                const filiereNiveauMatiere = await myDataSource.getRepository(FiliereNiveauMatiere)
                    .findOneBy({ id: coursInfo.filiereNiveauMatiereId });
                const professeur = await myDataSource.getRepository(Professeur)
                    .findOneBy({ id: coursInfo.professeurId });
                const classe = await myDataSource.getRepository(Classe)
                    .findOneBy({ id: coursInfo.classeId });

                if (!filiereNiveauMatiere || !professeur || !classe) {
                    return generateServerErrorCode(res, 400, null, "Classe, professeur ou filière invalide.");
                }

                await coursRepo.update(
                    { id: coursInfo.id },
                    {
                        heureDebut: coursInfo.heureDebut,
                        heureFin: coursInfo.heureFin,
                        jour: coursInfo.jour,
                        estEnLigne: coursInfo.estEnLigne ?? false,
                        filiereNiveauMatiere,
                        professeur,
                        classe
                    }
                );
            }
        }

        if (Array.isArray(coursToDelete)) {
            for (const coursId of coursToDelete) {
                await coursRepo.delete({ id: coursId });
            }
        }

        const errors = await validate(emploiDuTemps);
        if (errors.length > 0) {
            const message = validateMessage(errors);
            return generateServerErrorCode(res, 400, errors, message);
        }

        const savedEmploiDuTemps = await emploiDuTempsRepo.save(emploiDuTemps);

        const emploiDuTempsWithCours = await emploiDuTempsRepo.findOne({
            where: { id: savedEmploiDuTemps.id },
            relations: [
                'cours',
                'cours.filiereNiveauMatiere',
                'cours.filiereNiveauMatiere.filiere',
                'cours.filiereNiveauMatiere.niveau',
                'cours.filiereNiveauMatiere.matiere',
                'cours.professeur',
                'cours.classe',
                 'filiere',  
                'niveau',
                'typeEmploi'
            ]
        });

        return success(
            res,
            200,
            emploiDuTempsWithCours,
            `L'emploi du temps ${savedEmploiDuTemps.id} a bien été modifié.`
        );

    } catch (error: any) {
        if (error instanceof ValidationError) {
            return generateServerErrorCode(res, 400, error, "Erreur de validation");
        }
        if (error.code === "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, "Cet emploi du temps existe déjà");
        }
        return generateServerErrorCode(
            res,
            500,
            error,
            "L'emploi du temps n'a pas pu être modifié. Réessayez dans quelques instants."
        );
    }
};

export const deleteEmploiDuTemps = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return generateServerErrorCode(res, 400, "Identifiant invalide", "L'id doit être un nombre.");
        }

        const emploiDuTemps = await myDataSource.getRepository(EmploiDuTemps).findOne({ where: { id } });

        if (!emploiDuTemps) {
            return generateServerErrorCode(res, 400, "L'id n'existe pas", `L'emploi du temps demandé n'existe pas.`);
        }

        await myDataSource.getRepository(EmploiDuTemps).softRemove(emploiDuTemps);

        return success(res, 200, emploiDuTemps, `L'emploi du temps avec l'identifiant n°${emploiDuTemps.id} a bien été supprimé.`);

    } catch (error) {
        return generateServerErrorCode(res, 500, error, "L'emploi du temps n'a pas pu être supprimé.");
    }
};
