import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Distance } from "../entity/Distance";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";


export const createDistance = async (req: Request, res: Response) => {
    const distance = myDataSource.getRepository(Distance).create(req.body);
    const errors = await validate(distance)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Distance).save(distance)
    .then((distance : Distance | Distance[]) => {
        const id = !isArray(distance) ? distance.libelle : '';
        const message = `La distance ${id} a bien été créée.`
        return success(res,201, distance,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette distance existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette distance existe déjà.')
        }
        const message = `La distance n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

// export const getAllDistance = async (req: Request, res: Response) => {
//     await myDataSource.getRepository(Distance).find({
//         relations:{
//             montants:true,
//         }
//     })
//     .then((retour) => {
//         const message = 'La liste des distances a bien été récupérée.';
//         return success(res,200,{data:retour}, message);
//     }).catch(error => {
//         const message = `La liste des distances n'a pas pu être récupérée. Réessayez dans quelques instants.`
//         //res.status(500).json({ message, data: error })
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getAllDistance = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Distance);
    let reque = await myDataSource.getRepository(Distance)
    .createQueryBuilder('distance')
    .leftJoinAndSelect('distance.montants', 'montants')
    .where("distance.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des distances a bien été récupéré.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des distances n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getDistance = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Distance).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            montants: true,
    },
    })
    .then(distance => {
        if(distance === null) {
          const message = `La distante demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La distance a bien été trouvée.`
        return success(res,200, distance,message);
    })
    .catch(error => {
        const message = `La distance n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getDistanceByType = async (req: Request, res: Response) => {
    await(myDataSource.getRepository(Distance)
    .createQueryBuilder("distance")
    .where("distance.type = :id", { id: req.params.id })
    .getMany()
        )
    .then(distance => {
        if(distance === null) {
          const message = `Aucun élément ne correspond à votre recherche.`
          return generateServerErrorCode(res,400,"Aucun élément ne correspond à votre recherche",message)
        }
        const message = `La récupération a bien été exécutée.`
        return success(res,200,distance,message);
    })
    .catch(error => {
        const message = `Les distances n'ont pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const updateDistance = async (req: Request, res: Response) => {
    const distance = await myDataSource.getRepository(Distance).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            montants: true,
        },
    }
    )
    if (!distance) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette distance existe déjà')
    }
    myDataSource.getRepository(Distance).merge(distance,req.body);
    const errors = await validate(distance);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Distance).save(distance).then(distance => {
        const message = `La distance ${distance.id} a bien été modifiée.`
        return success(res,200, distance,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette distance existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette distance existe déjà')
        }
        const message = `La distance n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteDistance = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Distance', parseInt(req.params.id));
    await myDataSource.getRepository(Distance)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        },
        relations:{
            montants: true,
            
        }
        })
    .then(distance => {        
        if(distance === null) {
          const message = `La distance demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette distance est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette faq est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Distance).softRemove(distance)
            .then(_ => {
                const message = `La distance avec l'identifiant n°${distance.id} a bien été supprimée.`;
                return success(res,200, distance,message);
            })
        }
    }).catch(error => {
        const message = `La distance n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
