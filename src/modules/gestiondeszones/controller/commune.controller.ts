import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Commune } from "../entity/Communes";

export const createCommune = async (req: Request, res: Response) => {
    const commune = myDataSource.getRepository(Commune).create(req.body);
    const errors = await validate(commune)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Commune).save(commune)
    .then(commune => {
        const message = `La commune ${req.body.libelle} a bien été créée.`
        return success(res,201,commune,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette commune existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette commune existe déjà.')
        }
        const message = `La commune n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllCommune = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Commune);
    var requu = myDataSource.getRepository(Commune)
    .createQueryBuilder("c")
    .orderBy('c.libelle', "ASC")

    if(searchTerm && searchTerm != ""){
        requu = requu.andWhere("(c.code LIKE :keyword OR c.libelle LIKE :keyword)", { keyword: `%${searchTerm}%` })
    }
    await requu
    .skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des communes a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des communes n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllCommune2 = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Commune);
    var requu = myDataSource.getRepository(Commune)
    .createQueryBuilder("c")
    if(searchTerm && searchTerm != ""){
        requu = requu.andWhere("(c.code LIKE :keyword OR c.libelle LIKE :keyword)", { keyword: `%${searchTerm}%` })
    }
    await requu
    .getMany()
    .then((data) => {
        const message = 'La liste des communes a bien été récupérée.';
        return success(res,200,{data}, message);
    }).catch(error => {
        const message = `La liste des communes n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getCommune = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Commune).findOne({
        where: {
            id: parseInt(req.params.id),
        },
    //     relations: {
    //         departement:true,
    //         arrondissements:true

    // },
    })
    .then(commune => {
        if(commune === null) {
          const message = `La commune demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La commune a bien été trouvée.`
        return success(res,200, commune,message);
    })
    .catch(error => {
        const message = `La commune n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const getCommuneByDepartement = async (req: Request, res: Response) => {
    await(myDataSource.getRepository(Commune)
    .createQueryBuilder("c")
    .where("c.departementId = :id", { id: req.params.id })
    .getMany()
        )
    .then(commune => {
        if(commune === null) {
          const message = `Aucun élément ne correspond à votre recherche.`
          return generateServerErrorCode(res,400,"Aucun élément ne correspond à votre recherche",message)
        }
        const message = `La récupération a bien été exécuté.`
        return success(res,200,commune,message);
    })
    .catch(error => {
        const message = `Les communes n'ont pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateCommune = async (req: Request, res: Response) => {
    const commune = await myDataSource.getRepository(Commune).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
    //     relations: {
    //         departement:true,
    //         arrondissements:true

    //  },
    }
    )
    if (!commune) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette commune existe déjà')
    }
    myDataSource.getRepository(Commune).merge(commune,req.body);
    const errors = await validate(commune);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Commune).save(commune).then(commune => {
        const message = `La commune ${commune.id} a bien été modifié.`
        return success(res,200,commune,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette communeexiste déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette communeexiste déjà')
        }
        const message = `La commune n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteCommune = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('commune', parseInt(req.params.id));
    await myDataSource.getRepository(Commune)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        },
//         relations:{
//             departement:true,
//             arrondissements:true
//    }
        })
    .then(commune => {        
        if(commune === null) {
          const message = `La commune demandée n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette commune est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette communeest lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Commune).softRemove(commune)
            .then(_ => {
                const message = `La commune avec l'identifiant n°${commune.id} a bien été supprimée.`;
                return success(res,200, commune,message);
            })
        }
    }).catch(error => {
        const message = `La commune n'a pas pu être supprimée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
