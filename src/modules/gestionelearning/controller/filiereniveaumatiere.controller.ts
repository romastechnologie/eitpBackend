import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { FiliereNiveauMatiere } from "../entity/FiliereNiveauMatiere";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

// export const createFiliereNiveauMatiere = async (req: Request, res: Response) => {
//     const filiereNiveauMatiere = myDataSource.getRepository(FiliereNiveauMatiere).create(req.body);

//     console.log(req.body, "hellooooo")
//     const errors = await validate(filiereNiveauMatiere)
//     if (errors.length > 0) {
//         const message = validateMessage(errors);
//         return generateServerErrorCode(res,400,errors,message)
//     }
//     await myDataSource.getRepository(FiliereNiveauMatiere).save(filiereNiveauMatiere)
//     .then((filiereNiveauMatiere_ : FiliereNiveauMatiere | FiliereNiveauMatiere[]) => {
//         const id = !isArray(filiereNiveauMatiere_) ? filiereNiveauMatiere_.id : '';
//         const message = `La filière par niveau ${id} a bien été créé.`
//         return success(res,201, filiereNiveauMatiere,message);
//     })
//     .catch(error => {
//         if(error instanceof ValidationError) {
//             return generateServerErrorCode(res,400,error,'Cette filière par niveau existe déjà.')
//         }
//         if(error.code == "ER_DUP_ENTRY") {
//             return generateServerErrorCode(res,400,error,'Cette filière par niveau existe déjà.')
//         }
//         const message = `La filière par niveau n'a pas pu être ajouté. Réessayez dans quelques instants.`
//         return generateServerErrorCode(res,500,error,message)
//     })
// }

export const createFiliereNiveauMatiere = async (req: Request, res: Response) => {
  const repo = myDataSource.getRepository(FiliereNiveauMatiere);

  try {
    // On récupère les données envoyées
    const { filiere, niveau, matiere, coefficient } = req.body;

    // On rend inactifs tous les anciens pour la même filiere+niveau+matiere
    await repo
      .createQueryBuilder()
      .update(FiliereNiveauMatiere)
      .set({ statut: 0 })
      .where("filiereId = :filiereId", { filiereId: filiere })
      .andWhere("niveauId = :niveauId", { niveauId: niveau })
      .andWhere("matiereId = :matiereId", { matiereId: matiere })
      .execute();

    // Création de la nouvelle avec statut actif
    const filiereNiveauMatiere = repo.create({
      filiere,
      niveau,
      matiere,
      coefficient,
      statut: 1
    });

    const errors = await validate(filiereNiveauMatiere);
    if (errors.length > 0) {
      const message = validateMessage(errors);
      return generateServerErrorCode(res, 400, errors, message);
    }

    const saved = await repo.save(filiereNiveauMatiere);

    const message = `La filière par niveau ${saved.id} a bien été créée et est maintenant active.`;
    return success(res, 201, saved, message);

  } catch (error: any) {
    if (error instanceof ValidationError) {
      return generateServerErrorCode(res, 400, error, "Cette filière par niveau existe déjà.");
    }
    if (error.code === "ER_DUP_ENTRY") {
      return generateServerErrorCode(res, 400, error, "Cette filière par niveau existe déjà.");
    }
    const message = `La filière par niveau n'a pas pu être ajoutée. Réessayez dans quelques instants.`;
    return generateServerErrorCode(res, 500, error, message);
  }
};



// export const getAllFiliereNiveauMatiere = async (req: Request, res: Response) => {
//     console.log('Appel de getAllFiliereNiveauMatiere'); 
//     console.log('Query params:', req.query); 

//     const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, FiliereNiveauMatiere);

//     try {
//         let reque = await myDataSource.getRepository(FiliereNiveauMatiere)
//         .createQueryBuilder('filiere_niveau_matiere')
//         .leftJoinAndSelect('filiere_niveau_matiere.filiere', "filiere")
//         .leftJoinAndSelect('filiere_niveau_matiere.matiere', "matiere")
//         .leftJoinAndSelect('filiere_niveau_matiere.niveau', "niveau")
//         .leftJoinAndSelect('filiere_niveau_matiere.question', "question")
//         .where("filiere_niveau_matiere.deletedAt IS NULL");

//         if (searchQueries.length > 0) {
//             reque.andWhere(new Brackets(qb => {
//                 qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
//             }));
//         }

//         const [data, totalElements] = await reque.skip(startIndex).take(limit).getManyAndCount();

//         console.log('Résultats récupérés:', data); 

//         const message = 'La liste des filières par niveau a bien été récupérée.';
//         const totalPages = Math.ceil(totalElements / limit);
//         return success(res, 200, { data, totalPages, totalElements, limit }, message);

//     } catch (error) {
//         console.error('Erreur dans getAllFiliereNiveauMatiere:', error); 
//         const message = `La liste des filières par niveau n'a pas pu être récupérée. Réessayez dans quelques instants.`;
//         return generateServerErrorCode(res, 500, error, message);
//     }
// };

export const getAllFiliereNiveauMatiere = async (req: Request, res: Response) => {
    console.log('Appel de getAllFiliereNiveauMatiere'); 
    console.log('Query params:', req.query); 

    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, FiliereNiveauMatiere);

    // Récupération des query params pour filiere et niveau
    const { filiere, niveau } = req.query;

    try {
        let reque = await myDataSource.getRepository(FiliereNiveauMatiere)
            .createQueryBuilder('filiere_niveau_matiere')
            .leftJoinAndSelect('filiere_niveau_matiere.filiere', "filiere")
            .leftJoinAndSelect('filiere_niveau_matiere.matiere', "matiere")
            .leftJoinAndSelect('filiere_niveau_matiere.niveau', "niveau")
            .leftJoinAndSelect('filiere_niveau_matiere.question', "question")
            .where("filiere_niveau_matiere.deletedAt IS NULL");

        // Filtrage sur filière si fourni
        if (filiere) {
            reque.andWhere("filiere.id = :filiereId", { filiereId: filiere });
        }

        // Filtrage sur niveau si fourni
        if (niveau) {
            reque.andWhere("niveau.id = :niveauId", { niveauId: niveau });
        }

        // Recherche sur d'autres champs si nécessaire
        if (searchQueries.length > 0) {
            reque.andWhere(new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
            }));
        }

        const [data, totalElements] = await reque.skip(startIndex).take(limit).getManyAndCount();

        console.log('Résultats récupérés:', data); 

        const message = 'La liste des filières par niveau a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res, 200, { data, totalPages, totalElements, limit }, message);

    } catch (error) {
        console.error('Erreur dans getAllFiliereNiveauMatiere:', error); 
        const message = `La liste des filières par niveau n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};


export const getFiliereNiveauMatiere = async (req: Request, res: Response) => {
    await myDataSource.getRepository(FiliereNiveauMatiere).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            filiere:true,
            matiere:true,
            niveau:true,
            question:true

    },
    })
    .then(filiereNiveauMatiere => {
        if(filiereNiveauMatiere === null) {
          const message = `La filière par niveau demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La filière par niveau de méda a bien été trouvé.`
        return success(res,200, filiereNiveauMatiere,message);
    })
    .catch(error => {
        const message = `La filière par niveau n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateFiliereNiveauMatiere = async (req: Request, res: Response) => {
    const filiereNiveauMatiere = await myDataSource.getRepository(FiliereNiveauMatiere).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            filiere:true,
            matiere:true,
            niveau:true,
            question:true
        },
    }
    )
    if (!filiereNiveauMatiere) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(FiliereNiveauMatiere).merge(filiereNiveauMatiere,req.body);
    const errors = await validate(filiereNiveauMatiere);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(FiliereNiveauMatiere).save(filiereNiveauMatiere).then(filiereNiveauMatiere => {
        const message = `La filière par niveau ${filiereNiveauMatiere.id} a bien été modifié.`
        return success(res,200, filiereNiveauMatiere,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette filière par niveau de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette filière par niveau de média existe déjà')
        }
        const message = `La filière par niveau n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteFiliereNiveauMatiere = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('FiliereNiveauMatiere', parseInt(req.params.id));
    await myDataSource.getRepository(FiliereNiveauMatiere)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(filiereNiveauMatiere => {        
        if(filiereNiveauMatiere === null) {
          const message = `La filière par niveau demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette filière par niveau de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette filière par niveau de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(FiliereNiveauMatiere).softRemove(filiereNiveauMatiere)
            .then(_ => {
                const message = `La filière par niveau avec l'identifiant n°${filiereNiveauMatiere.id} a bien été supprimé.`;
                return success(res,200, filiereNiveauMatiere,message);
            })
        }
    }).catch(error => {
        const message = `La filière par niveau n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
export const getAllFiliereNiveauMatieres= async (req: Request, res: Response) => {
    await myDataSource.getRepository(FiliereNiveauMatiere).find({
       
    })
    .then((retour) => {
        const message = 'La liste des filières par niveau a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des filières par niveau n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};