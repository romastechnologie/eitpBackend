import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { IntervallePoids } from "../entity/IntervallePoids";
import { Distance } from "../entity/Distance";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { set } from "date-fns";


export const createIntervallePoids = async (req: Request, res: Response) => {
    const intervallePoids = myDataSource.getRepository(IntervallePoids).create(req.body);
    const errors = await validate(intervallePoids)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(IntervallePoids).save(intervallePoids)
    .then(intervallePoids => {
        const message = `L'intervalle a bien été créée.`
        return success(res,201, intervallePoids,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette intervalle existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette intervalle existe déjà.')
        }
        const message = `L'intervalle n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

// export const getAllIntervallePoids = async (req: Request, res: Response) => {
//     await myDataSource.getRepository(IntervallePoids).find({
//         relations:{
//             montants:true,
//         }
//     })
//     .then((retour) => {
//         const message = 'La liste des intervalles a bien été récupérée.';
//         return success(res,200,{data:retour}, message);
//     }).catch(error => {
//         const message = `La liste des intervalles n'a pas pu être récupérée. Réessayez dans quelques instants.`
//         //res.status(500).json({ message, data: error })
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getIntervallePoidsMontant = async (req: Request, res: Response) => {
    await myDataSource.getRepository(IntervallePoids).find({
        relations:{
            montants:true,
        }
    })
    .then((retour) => {
        const message = 'La liste des intervalles a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des intervalles n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllIntervallePoids = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, IntervallePoids);
    let reque = await myDataSource.getRepository(IntervallePoids)
    .createQueryBuilder('intervalle_poids')
    .where("intervalle_poids.deletedAt IS NULL");
    // if (searchQueries.length > 0) {
    //     reque.andWhere(new Brackets(qb => {
    //         qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
    //     }));
    // }
    if(searchTerm && searchTerm != ""){
        reque.andWhere("(intervalle_poids.type LIKE :keyword OR intervalle_poids.debutIntervalle LIKE :keyword OR intervalle_poids.finIntervalle LIKE :keyword )", { keyword: `%${searchTerm}%` })
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des intervalles de poids a bien été récupéré.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des intervalles de poids n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllIntervallePoidsDistance = async (req: Request, res: Response) => {
    try {
        console.log("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
        const distantPoids= await myDataSource.getRepository(Distance)
        .createQueryBuilder("distance")
        .select("concat('[ ',intervallePoid.debutIntervalle,';',intervallePoid.finIntervalle,' [') as poids,montants.montant,distance.distance,distance.libelle")
        .leftJoin("distance.montants", "montants")
        .leftJoin("montants.intervallePoids", "intervallePoid")
        .where("distance.type = :typeDist", { typeDist: req.params.dtype })
        .andWhere("intervallePoid.type = :typePoid", { typePoid: req.params.ptype })
        .orderBy(poids, "ASC")
        //.groupBy("distance.distance")
        .getRawMany();

        var data = {};
        var distances ;
        var poids ;
        if (req.params.ptype == "2" && req.params.dtype=="2") {
            distantPoids.forEach(montant => {
                if (!data[montant.distance]) {
                    data[montant.distance] = {};
                }
                data[montant.distance][montant.poids] = montant.montant;
            });
            // Créer le tableau
              distances = Object.keys(data);
              poids = [...new Set(distantPoids.map(montant => montant.poids))];
        } else {
            distantPoids.forEach(montant => {
                if (!data[montant.poids]) {
                    data[montant.poids] = {};
                }
                data[montant.poids][montant.distance] = montant.montant;
            });
    
            // Créer le tableau
             poids = Object.keys(data);
             distances= [...new Set(distantPoids.map(montant => montant.distance))];
        }

        const message = `L'intervalle a bien été trouvée.`
        console.log(distantPoids,"distantPoidsdistantPoidsdistantPoidsdistantPoidsdistantPoidsdistantPoids",distances);
        console.log(data,"distantPoidsdistantPoidsdistantPoidsdistantPoidsdistantPoidsdistantPoids",poids);

        return success(res,200, {data,poids,distances },message);
    } catch (error) {
        console.log("poidspoidspoidspoids");
        return generateServerErrorCode(res,400,"Vous n'avez pas ce privilège","Vous n'avez pas ce privilège");
    }
}

export const getIntervallePoids = async (req: Request, res: Response) => {
    await myDataSource.getRepository(IntervallePoids).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            montants: true,
        },
    })
    .then(intervallePoids => {
        if(intervallePoids === null) {
          const message = `L'intervalle demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `L'intervalle a bien été trouvée.`
        return success(res,200, intervallePoids,message);
    })
    .catch(error => {
        const message = `L'intervalle n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const updateIntervallePoids = async (req: Request, res: Response) => {
    const intervallePoids= await myDataSource.getRepository(IntervallePoids).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            montants: true,
        },
    })
    if (!intervallePoids) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet intervalle existe déjà')
    }
    myDataSource.getRepository(IntervallePoids).merge(intervallePoids,req.body);
    const errors = await validate(intervallePoids);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(IntervallePoids).save(intervallePoids).then(intervallePoids => {
        const message = `L'intervalle ${intervallePoids.id} a bien été modifiée.`
        return success(res,200, intervallePoids,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette intervalle existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette intervalle existe déjà')
        }
        const message = `L'intervalle n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteIntervallePoids = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('IntervallePoids', parseInt(req.params.id));
    await myDataSource.getRepository(IntervallePoids)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        },
        relations:{
            montants: true,  
        }
        })
    .then(intervallePoids => {        
        if(intervallePoids === null) {
          const message = `L'intervalle demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }
        if(resultat){
            const message = `Cette intervalle est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette intervalle est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(IntervallePoids).softRemove(intervallePoids)
            .then(_ => {
                const message = `L'intervalle avec l'identifiant n°${intervallePoids.id} a bien été supprimée.`;
                return success(res,200, intervallePoids,message);
            })
        }
    }).catch(error => {
        const message = `L'intervalle n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
