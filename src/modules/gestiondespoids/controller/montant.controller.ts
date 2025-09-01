import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Montant } from "../entity/Montant";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { IntervallePoids } from "../entity/IntervallePoids";
import { Distance } from "../entity/Distance";


export const createMontant = async (req: Request, res: Response) => {
    const montant = myDataSource.getRepository(Montant).create(req.body);
    const errors = await validate(montant)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Montant).save(montant)
    .then(montant => {
        const message = `Le montant ${req.body.montant} a bien été créé.`
        return success(res,201, montant,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce montant existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce montant existe déjà.')
        }
        const message = `Le montant n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

// export const getAllMontant = async (req: Request, res: Response) => {
//     await myDataSource.getRepository(Montant).find({
//         relations:{
//             intervallePoids:true,
//             distance:true
//         }
//     })
//     .then((retour) => {
//         const message = 'La liste des montants a bien été récupérée.';
//         return success(res,200,{data:retour}, message);
//     }).catch(error => {
//         const message = `La liste des montants n'a pas pu être récupérée. Réessayez dans quelques instants.`
//         //res.status(500).json({ message, data: error })
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getAllMontant = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Montant);
    let reque = await myDataSource.getRepository(Montant)
    .createQueryBuilder('montant')
    .leftJoinAndSelect('montant.intervallePoids', 'intervallePoids')
    .leftJoinAndSelect('montant.distance', 'distance')
    .where("montant.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des montant a bien été récupéré.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des montant n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getMontant = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Montant).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            intervallePoids: true,
            distance:true
    },
    })
    .then(montant => {
        if(montant === null) {
          const message = `La distante demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le montant a bien été trouvée.`
        return success(res,200, montant,message);
    })
    .catch(error => {
        const message = `Le montant n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const updateMontant = async (req: Request, res: Response) => {
    const montant = await myDataSource.getRepository(Montant).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
    }
    )
    if (!montant) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Ce montant existe déjà')
    }
    myDataSource.getRepository(Montant).merge(montant,req.body);
    const errors = await validate(montant);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Montant).save(montant).then(montant => {
        const message = `Le montant ${montant.id} a bien été modifiée.`
        return success(res,200, montant,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce montant existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce montant existe déjà')
        }
        const message = `Le montant n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const montantEstimation = async (req: Request, res: Response) => {
    const { type, poids, distance } = req.body;

    const intervallePoidsRepository = myDataSource.getRepository(IntervallePoids);
    const distanceRepository = myDataSource.getRepository(Distance);
    const montantRepository = myDataSource.getRepository(Montant);
  
    if (!type || !poids || !distance) {
      return res.status(400).json({ message: 'Données manquantes dans la requête' });
    }
  
    try {
      const intervallePoids = await intervallePoidsRepository
        .createQueryBuilder("intervallePoids")
        .where("intervallePoids.type = :type", { type })
        .andWhere(":poids BETWEEN intervallePoids.debutIntervalle AND intervallePoids.finIntervalle", { poids })
        .getOne();
  
      if (!intervallePoids) {
        console.error('Aucun intervalle de poids correspondant trouvé pour', { type, poids });
        return generateServerErrorCode(res, 400, "Aucun intervalle de poids correspondant trouvé", 'Aucun intervalle de poids correspondant trouvé');
      }
  
      const distanceEntity = await distanceRepository
        .createQueryBuilder("distance")
        .where("distance.type = :type", { type })
        .andWhere("distance.id = :id", { id: distance })
        .getOne();
  
      if (!distanceEntity) {
        console.error('Aucune distance correspondante trouvée pour', { type, distance });
        return generateServerErrorCode(res, 400, "Aucune distance correspondante trouvée", 'Aucune distance correspondante trouvée');
      }
  
      const getPoids = req.body.poids;

      const montant = await montantRepository
        .createQueryBuilder("montant")
        .where("montant.intervallePoidsId = :intervallePoidsId", { intervallePoidsId: intervallePoids.id })
        .andWhere("montant.distanceId = :distanceId", { distanceId: distanceEntity.id })
        .getOne();
  
      if (!montant) {
        console.error('Aucun montant correspondant trouvé pour', { intervallePoidsId: intervallePoids.id, distanceId: distanceEntity.id });
        return generateServerErrorCode(res, 400, "Aucun montant correspondant trouvé", 'Ce montant existe déjà');
      }
  
      const errors = await validate(montant);
      if (errors.length > 0) {
        const message = validateMessage(errors);
        console.error('Erreurs de validation pour le montant', { montant, errors });
        return generateServerErrorCode(res, 400, errors, message);
      }
  
      return res.json({ montant,distanceEntity,intervallePoids, getPoids });
  
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return generateServerErrorCode(res, 500, error, 'Erreur interne du serveur');
    }
  };

export const deleteMontant = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('montant', parseInt(req.params.id));
    await myDataSource.getRepository(Montant)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(montant => {        
        if(montant === null) {
          const message = `Le montant demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Ce montant est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce faq est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Montant).softRemove(montant)
            .then(_ => {
                const message = `Le montant avec l'identifiant n°${montant.id} a bien été supprimée.`;
                return success(res,200, montant,message);
            })
        }
    }).catch(error => {
        const message = `Le montant n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
