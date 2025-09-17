import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Inscription } from "../entity/Inscription";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";
import { Parent } from "../entity/Parent";
import { Etudiant } from "../entity/Etudiant";
import { ParentEtudiant } from "../entity/ParentEtudiant";
import { Filiere } from "../entity/Filiere";
import { Niveau } from "../entity/Niveau";
import { AnneeAcademique } from "../entity/AnneAcademique";
import { Piece } from "../entity/Piece";





export const createInscription = async (req: Request, res: Response) => {
  console.log("Corps reçu :", req.body);

  // Extraction des données du corps de la requête
  const {
    nom,
    prenom,
    sexe,
    email,
    dateNaissance,
    ecoleProvenance,
    numeroEducMaster,
    niveau,
    filiere,
    parent,
    pieces,
  } = req.body;

  try {
    const result = await myDataSource.manager.transaction(async (manager) => {
      // Étape 1 : Créer ou récupérer l'étudiant
      let etudiant = await manager.findOne(Etudiant, {
        where: { email }, // Vérifier si l'étudiant existe déjà via l'email
      });

      if (!etudiant) {
        // Créer un nouvel étudiant si aucun n'existe
        etudiant = manager.create(Etudiant, {
          matricule: numeroEducMaster || `MAT-${Date.now()}`, // Générer un matricule si non fourni
          nom,
          prenom,
          sexe,
          email,
          dateNaissance: new Date(dateNaissance),
          ecoleProvenance,
        });

        const etudiantErrors = await validate(etudiant);
        if (etudiantErrors.length > 0) {
          throw new Error(validateMessage(etudiantErrors));
        }

        etudiant = await manager.save(Etudiant, etudiant);
        console.log("Étudiant enregistré :", etudiant);
      }

      // Étape 2 : Vérifier l'année académique
      const anneeAcademique = await manager.findOne(AnneeAcademique, {
        where: { id: req.body.anneeId }, // Supposons que l'ID de l'année est envoyé
      });
      if (!anneeAcademique) {
        throw new Error("Année académique introuvable");
      }

      // Étape 3 : Vérifier la filière
      const filiereEntity = await manager.findOne(Filiere, {
        where: { id: filiere },
      });
      if (!filiereEntity) {
        throw new Error("Filière introuvable");
      }

      // Étape 4 : Vérifier le niveau
      const niveauEntity = await manager.findOne(Niveau, {
        where: { id: niveau },
      });
      if (!niveauEntity) {
        throw new Error("Niveau introuvable");
      }

      // Étape 5 : Créer l'inscription
      const inscription = manager.create(Inscription, {
        dateInscription: new Date(), // Date actuelle pour l'inscription
        etudiant,
        annee: anneeAcademique,
        filiere: filiereEntity,
        niveau: niveauEntity,
      });

      const inscriptionErrors = await validate(inscription);
      if (inscriptionErrors.length > 0) {
        throw new Error(validateMessage(inscriptionErrors));
      }

      const savedInscription = await manager.save(Inscription, inscription);
      console.log("Inscription enregistrée :", savedInscription);

      // Étape 6 : Créer l'association ParentEtudiant
      if (parent) {
        const parentEtudiant = manager.create(ParentEtudiant, {
          parent: { id: parent }, // Supposons que parent est l'ID du parent
          etudiant,
        });

        const parentEtudiantErrors = await validate(parentEtudiant);
        if (parentEtudiantErrors.length > 0) {
          throw new Error(validateMessage(parentEtudiantErrors));
        }

        await manager.save(ParentEtudiant, parentEtudiant);
        console.log("Association ParentEtudiant enregistrée");
      }

      // Étape 7 : Gérer les pièces (facultatif, si vous souhaitez les enregistrer)
      if (pieces && Array.isArray(pieces)) {
        for (const pieceData of pieces) {
          const piece = manager.create(Piece, {
            typePiece: { id: pieceData.typePiece }, // Supposons que typePiece est l'ID
            numeroPiece: pieceData.numeroPiece,
            urlImage: pieceData.urlImage, // À gérer selon votre logique d'upload
            etudiant,
          });

          const pieceErrors = await validate(piece);
          if (pieceErrors.length > 0) {
            throw new Error(validateMessage(pieceErrors));
          }

          await manager.save(Piece, piece);
        }
        console.log("Pièces enregistrées :", pieces.length);
      }

      return { inscription: savedInscription, etudiant };
    });

    const message = `L'inscription a été créée avec succès pour l'étudiant ${result.etudiant.nom} ${result.etudiant.prenom}.`;
    return success(res, 201, result.inscription, message);
  } catch (error: any) {
    console.error("Erreur lors de la création de l'inscription :", error);

    if (error.code === "ER_DUP_ENTRY") {
      return generateServerErrorCode(res, 400, error, "Un étudiant avec cet email ou matricule existe déjà.");
    }

    return generateServerErrorCode(
      res,
      500,
      error,
      error.message || "L'inscription n'a pas pu être créée. Réessayez plus tard."
    );
  }
};



// export const createEtudiantEtParent = async (
//   etudiantData: Partial<Etudiant>,
//   parentData: Partial<Parent>
// ) => {
//   const queryRunner = myDataSource.createQueryRunner();
//   await queryRunner.connect();
//   await queryRunner.startTransaction();

//   try {
//     // 1. Création du parent
//     const parent = queryRunner.manager.create(Parent, parentData);
//     await queryRunner.manager.save(parent);

//     // 2. Création de l’étudiant
//     const etudiant = queryRunner.manager.create(Etudiant, etudiantData);
//     await queryRunner.manager.save(etudiant);

//     // 3. Création de la relation ParentEtudiant
//     const parentEtudiant = queryRunner.manager.create(ParentEtudiant, {
//       etudiant,
//       parent,
//     });
//     await queryRunner.manager.save(parentEtudiant);

//     // 4. Valider la transaction
//     await queryRunner.commitTransaction();

//     return { etudiant, parent, parentEtudiant };
//   } catch (error) {
//     await queryRunner.rollbackTransaction();
//     throw error;
//   } finally {
//     await queryRunner.release();
//   }
// };





export const getAllInscription = async (req: Request, res: Response) => {
  const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Inscription);

  try {
    let reque = myDataSource.getRepository(Inscription)
      .createQueryBuilder("inscription")
      .leftJoinAndSelect("inscription.userInscriptions", "userInscription")   
      .leftJoinAndSelect("userInscription.user", "user")         
      .where("inscription.deletedAt IS NULL");
    if (searchQueries.length > 0) {
      reque.andWhere(
        new Brackets(qb => {
          qb.where(searchQueries.join(" OR "), { keyword: `%${searchTerm}%` });
        })
      );
    }

    const [data, totalElements] = await reque
      .skip(startIndex)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalElements / limit);
    const message = "La liste des inscriptions a bien été récupérée.";

    return success(res, 200, { data, totalPages, totalElements, limit }, message);
  } catch (error) {
    const message = "La liste des inscriptions n'a pas pu être récupérée. Réessayez dans quelques instants.";
    return generateServerErrorCode(res, 500, error, message);
  }
};


export const getAllInscriptions= async (req: Request, res: Response) => {
    await myDataSource.getRepository(Inscription).find({
        relations:{
          etudiant:true,
          annee:true,
          filiere:true,
          niveau:true   
        }
    })
    .then((retour) => {
        const message = 'La liste des inscriptions a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des inscriptions n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getInscription = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Inscription).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //inscription:true,
    },
    })
    .then(inscription => {
        if(inscription === null) {
          const message = `Le inscription demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le inscription de méda a bien été trouvé.`
        return success(res,200, inscription,message);
    })
    .catch(error => {
        const message = `Le inscription n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateInscription = async (req: Request, res: Response) => {
    const inscription = await myDataSource.getRepository(Inscription).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //inscription:true,
        },
    }
    )
    if (!inscription) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Inscription).merge(inscription,req.body);
    const errors = await validate(inscription);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Inscription).save(inscription).then(inscription => {
        const message = `Le inscription ${inscription.id} a bien été modifié.`
        return success(res,200, inscription,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce inscription de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce inscription de média existe déjà')
        }
        const message = `Le inscription n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteInscription = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Inscription', parseInt(req.params.id));
    await myDataSource.getRepository(Inscription)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(inscription => {        
        if(inscription === null) {
          const message = `Le inscription demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Ce inscription de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce inscription de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Inscription).softRemove(inscription)
            .then(_ => {
                const message = `Le inscription avec l'identifiant n°${inscription.id} a bien été supprimé.`;
                return success(res,200, inscription,message);
            })
        }
    }).catch(error => {
        const message = `Le inscription n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
