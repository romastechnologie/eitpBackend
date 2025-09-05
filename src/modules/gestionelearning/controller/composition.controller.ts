import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Composition } from "../entity/Composition";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { FiliereNiveauMatiere } from "../entity/FiliereNiveauMatiere";

export const createComposition = async (req: Request, res: Response) => {
    const composition = myDataSource.getRepository(Composition).create(req.body);
    const errors = await validate(composition)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Composition).save(composition)
    .then((composition_ : Composition | Composition[]) => {
        const titre = !isArray(composition_) ? composition_.titre : '';
        const message = `La composition ${titre} a bien été créé.`
        return success(res,201, composition_,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce type existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce type existe déjà.')
        }
        const message = `Le type n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}


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
            professeur:true,
    },
    })
    .then(composition => {
        if(composition === null) {
          const message = `La composition demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le type de méda a bien été trouvé.`
        return success(res,200, composition,message);
    })
    .catch(error => {
        const message = `La composition n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateComposition = async (req: Request, res: Response) => {
    const composition = await myDataSource.getRepository(Composition).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            professeur:true,
        },
    }
    )
    if (!composition) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette composition existe déjà')
    }
    myDataSource.getRepository(Composition).merge(composition,req.body);
    const errors = await validate(composition);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Composition).save(composition).then(composition => {
        const message = `La composition ${composition.id} a bien été modifié.`
        return success(res,200, composition,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette composition existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette composition existe déjà')
        }
        const message = `La composition n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

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
}

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
