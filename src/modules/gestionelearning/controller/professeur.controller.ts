import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets, IsNull } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Professeur } from "../entity/Professeur";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { ProfesseurMatiere } from "../entity/ProfesseurMatiere";
import { Matiere } from "../entity/Matiere";
import { Piece } from "../entity/Piece";
import { Quartier } from "../../gestiondeszones/entity/Quartier";


/* export const createProfesseur = async (req: Request, res: Response) => {
  console.log("Corps reçu :", req.body);

  const professeurData = {
    nom: req.body.nom,
    prenom: req.body.prenom,
    npi: req.body.npi,
    email: req.body.email,
    dateNaissance: req.body.dateNaissance,
    telProfesseur1: req.body.telProfesseur1,
    telProfesseur2: req.body.telProfesseur2,
  };

  if (!Array.isArray(req.body.matieres) || req.body.matieres.length === 0) {
    return generateServerErrorCode(res, 400, null, "Le professeur doit avoir au moins une matière associée.");
  }

  try {
    const result = await myDataSource.manager.transaction(async (manager) => {
      // Création du professeur
      const professeur = manager.create(Professeur, professeurData);

      const professeurErrors = await validate(professeur);
      if (professeurErrors.length > 0) {
        throw new Error(validateMessage(professeurErrors));
      }

      const savedProfesseur = await manager.save(Professeur, professeur);
      console.log("Professeur enregistré :", savedProfesseur);

      // Création des associations ProfesseurMatiere
      const professeurMatieres: ProfesseurMatiere[] = [];
      for (const matiereId of req.body.matieres) {
        const matiere = await manager.findOne(Matiere, { where: { id: matiereId } });
        if (!matiere) {
          throw new Error(`Matière avec ID ${matiereId} introuvable`);
        }

        const professeurMatiere = manager.create(ProfesseurMatiere, {
          professeur: savedProfesseur,
          matiere: matiere,
        });

        const pmErrors = await validate(professeurMatiere);
        if (pmErrors.length > 0) {
          throw new Error(validateMessage(pmErrors));
        }

        professeurMatieres.push(professeurMatiere);
      }

      await manager.save(ProfesseurMatiere, professeurMatieres);
      console.log("ProfesseurMatiere enregistrés :", professeurMatieres.length);

      return { professeur: savedProfesseur, nbMatieres: professeurMatieres.length };
    });

    const message = `Le professeur ${result.professeur.nom} ${result.professeur.prenom} a bien été créé avec ${result.nbMatieres} matière(s) associée(s).`;
    return success(res, 201, result.professeur, message);

  } catch (error: any) {
    console.log("Erreur transaction création professeur :", error);

    if (error.code === "ER_DUP_ENTRY") {
      return generateServerErrorCode(res, 400, error, "Un professeur avec cet email ou NPI existe déjà.");
    }

    return generateServerErrorCode(
      res,
      500,
      error,
      error.message || "Le professeur n'a pas pu être créé. Réessayez plus tard."
    );
  }
}; */



export const createProfesseur = async (req: Request, res: Response) => {
    console.log("Corps reçu :", req.body);

    const professeurData = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        npi: req.body.npi,
        ifu: req.body.ifu,
        email: req.body.email,
        sexe: req.body.sexe,
        nationalite: req.body.nationalite,
        dateNaissance: req.body.dateNaissance,
        telProfesseur1: req.body.telProfesseur1,
        telProfesseur2: req.body.telProfesseur2,
    };

    if (!Array.isArray(req.body.matieres) || req.body.matieres.length === 0) {
        return generateServerErrorCode(res, 400, null, "Le professeur doit avoir au moins une matière associée.");
    }

    try {
        const result = await myDataSource.manager.transaction(async (manager) => {
            // Vérifier que le quartier existe
            const quartier = await manager.findOne(Quartier, { where: { id: req.body.quartier } });
            if (!quartier) {
                throw new Error("Quartier introuvable");
            }

            // Création du professeur
            const professeur = manager.create(Professeur, {
                ...professeurData,
                quartier: quartier,
            });

            const professeurErrors = await validate(professeur);
            if (professeurErrors.length > 0) {
                throw new Error(validateMessage(professeurErrors));
            }

            const savedProfesseur = await manager.save(Professeur, professeur);
            console.log("Professeur enregistré :", savedProfesseur);

            // Associer les matières
            const professeurMatieres: ProfesseurMatiere[] = [];
            for (const matiereId of req.body.matieres) {
                const matiere = await manager.findOne(Matiere, { where: { id: matiereId } });
                if (!matiere) {
                    throw new Error(`Matière avec ID ${matiereId} introuvable`);
                }

                const professeurMatiere = manager.create(ProfesseurMatiere, {
                    professeur: savedProfesseur,
                    matiere: matiere,
                });

                const pmErrors = await validate(professeurMatiere);
                if (pmErrors.length > 0) {
                    throw new Error(validateMessage(pmErrors));
                }

                professeurMatieres.push(professeurMatiere);
            }

            await manager.save(ProfesseurMatiere, professeurMatieres);

            // Sauvegarde des pièces (si envoyées)
            // Sauvegarde des pièces (si envoyées)
            if (Array.isArray(req.body.pieces)) {
                const piecesEntities: Piece[] = [];
                for (const p of req.body.pieces) {
                    const piece = manager.create(Piece, {
                        typePiece: p.typePiece,
                        numeroPiece: p.numeroPiece,
                        urlImage: p.urlImage && typeof p.urlImage === "string" ? p.urlImage : null, // 🔑 sécurisation
                        professeur: savedProfesseur,
                    });

                    const pieceErrors = await validate(piece);
                    if (pieceErrors.length > 0) {
                        throw new Error(validateMessage(pieceErrors));
                    }

                    piecesEntities.push(piece);
                }
                await manager.save(Piece, piecesEntities);
            }

            return { professeur: savedProfesseur, nbMatieres: professeurMatieres.length };
        });

        const message = `Le professeur ${result.professeur.nom} ${result.professeur.prenom} a bien été créé avec ${result.nbMatieres} matière(s) associée(s).`;
        return success(res, 201, result.professeur, message);

    } catch (error: any) {
        console.log("Erreur transaction création professeur :", error);

        if (error.code === "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, "Un professeur avec cet email ou NPI existe déjà.");
        }

        return generateServerErrorCode(
            res,
            500,
            error,
            error.message || "Le professeur n'a pas pu être créé. Réessayez plus tard."
        );
    }
};



export const getAllProfesseur = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Professeur);
    let reque = await myDataSource.getRepository(Professeur)
        .createQueryBuilder('professeur')
        .leftJoinAndSelect("professeur.professeurMatieres", "profeseurMatiere")
            .leftJoinAndSelect("professeur.quartier", "quartier")
        .leftJoinAndSelect("profeseurMatiere.matiere", "matiere")
        .where("professeur.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
        .take(limit)
        .getManyAndCount()
        .then(([data, totalElements]) => {
            const message = 'La liste des professeurs a bien été récupérée.';
            const totalPages = Math.ceil(totalElements / limit);
            return success(res, 200, { data, totalPages, totalElements, limit }, message);
        }).catch(error => {
            const message = `La liste des professeurs n'a pas pu être récupérée. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
};

export const getAllProfesseurs = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Professeur).find({

    })
        .then((retour) => {
            const message = 'La liste des professeurs a bien été récupérée.';
            return success(res, 200, { data: retour }, message);
        }).catch(error => {
            const message = `La liste des professeurs n'a pas pu être récupérée. Réessayez dans quelques instants.`
            //res.status(500).json({ message, data: error })
            return generateServerErrorCode(res, 500, error, message)
        })
};

export const getProfesseursByMatiere = async (req: Request, res: Response) => {
    try {
        const matiereId = parseInt(req.params.matiereId);

        if (isNaN(matiereId) || matiereId <= 0) {
            const message = "L'ID de la matière est invalide.";
            return generateServerErrorCode(res, 400, null, message);
        }

        // Vérifier que la matière existe
        const matiere = await myDataSource.getRepository(Matiere).findOne({
            where: {
                id: matiereId,
                deletedAt: IsNull() // Soft delete
            }
        });

        if (!matiere) {
            const message = `La matière avec l'ID ${matiereId} n'existe pas.`;
            return generateServerErrorCode(res, 404, null, message);
        }

        // Récupérer les professeurs associés à cette matière via ProfesseurMatiere
        const professeurs = await myDataSource.getRepository(Professeur)
            .createQueryBuilder('professeur')
            .leftJoinAndSelect('professeur.professeurMatieres', 'professeurMatiere')
            .leftJoinAndSelect('professeurMatiere.matiere', 'matiere')
            .where('professeur.deletedAt IS NULL')
            .andWhere('professeurMatiere.matiere.id = :matiereId', { matiereId })
            .andWhere('matiere.deletedAt IS NULL')
            .select([
                'professeur.id',
                'professeur.nom',
                'professeur.prenom',
                'professeur.npi',
                'professeur.email',
                'professeur.dateNaissance',
                'professeur.telProfesseur1',
                'professeur.telProfesseur2',
                'professeurMatiere.id',
                'matiere.id',
                'matiere.libelle'
            ])
            .orderBy('professeur.nom', 'ASC')
            .addOrderBy('professeur.prenom', 'ASC')
            .getMany();

        // Si limit=0, on retourne tout ; sinon on peut ajouter la pagination
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 0;
        let result = professeurs;

        if (limit > 0) {
            // Si vous voulez ajouter la pagination, implémentez-la ici
            // Pour l'instant, on retourne tout si limit=0 ou pas spécifié
            result = professeurs.slice(0, limit);
        }

        const message = `Les professeurs pour la matière ${matiere.libelle} ont été récupérés avec succès.`;

        return success(res, 200, {
            data: result,
            totalElements: professeurs.length,
            matiere: {
                id: matiere.id,
                libelle: matiere.libelle
            }
        }, message);

    } catch (error: any) {
        console.error('Erreur lors de la récupération des professeurs par matière:', error);
        const message = `Impossible de récupérer les professeurs pour cette matière. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};

export const getProfesseur = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Professeur).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            professeurMatieres:
            {
                matiere: true,
            },
        },
    })
        .then(professeur => {
            if (professeur === null) {
                const message = `Le professeur demandé n'existe pas. Réessayez avec un autre identifiant.`
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message)
            }
            const message = `Le professeur a bien été trouvé.`
            return success(res, 200, professeur, message);
        })
        .catch(error => {
            const message = `Le professeur n'a pas pu être récupéré. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
};


export const updateProfesseur = async (req: Request, res: Response) => {
    const professeur = await myDataSource.getRepository(Professeur).findOne(
        {
            where: {
                id: parseInt(req.params.id),
            },
            relations: {
                //professeur:true,
            },
        }
    )
    if (!professeur) {
        return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Cet article existe déjà')
    }
    myDataSource.getRepository(Professeur).merge(professeur, req.body);
    const errors = await validate(professeur);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res, 400, errors, message)
    }
    await myDataSource.getRepository(Professeur).save(professeur).then(professeur => {
        const message = `L'étudiant ${professeur.id} a bien été modifié.`
        return success(res, 200, professeur, message);
    }).catch(error => {
        if (error instanceof ValidationError) {
            return generateServerErrorCode(res, 400, error, 'Ce professeur existe déjà')
        }
        if (error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, 'Ce professeur existe déjà')
        }
        const message = `L'étudiant n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res, 500, error, message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteProfesseur = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Professeur', parseInt(req.params.id));
    await myDataSource.getRepository(Professeur)
        .findOne({
            where: {
                id: parseInt(req.params.id)
            }
        })
        .then(professeur => {
            if (professeur === null) {
                const message = `L'étudiant demandé n'existe pas. Réessayez avec un autre identifiant.`
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
            }

            if (resultat) {
                const message = `Ce professeur est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
                return generateServerErrorCode(res, 400, "Ce professeur est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.", message);
            } else {
                myDataSource.getRepository(Professeur).softRemove(professeur)
                    .then(_ => {
                        const message = `L'étudiant avec l'identifiant n°${professeur.id} a bien été supprimé.`;
                        return success(res, 200, professeur, message);
                    })
            }
        }).catch(error => {
            const message = `L'étudiant n'a pas pu être supprimé. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
}
