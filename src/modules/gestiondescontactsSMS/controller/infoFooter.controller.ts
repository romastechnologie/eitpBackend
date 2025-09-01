import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets, Not } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { InfoFooter } from "../entity/InfoFooter";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createInfoFooter = async (req: Request, res: Response) => {
    
    const infoFooter = myDataSource.getRepository(InfoFooter).create(req.body);
    const errors = await validate(infoFooter);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(InfoFooter).save(infoFooter)
    .then(infoFooter=> {
        const message = `Les informations du footer ont bien été créées.`
        return success(res,201, infoFooter,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce info Footer existe déjà');
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce infoFooter existe déjà');
        }
        const message = `Les informations du footer n'ont pas pu être ajoutées. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res,500,error,message);
    })
}

export const getAllInfoFooter = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, InfoFooter);
    let reque = await myDataSource.getRepository(InfoFooter)
    .createQueryBuilder('infoFooter')
    .where("infoFooter.deletedAt IS NULL");
    // if (searchQueries.length > 0) {
    //     reque.andWhere(new Brackets(qb => {
    //         qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
    //     }));
    // }
    if(searchTerm && searchTerm != ""){
        reque = reque.andWhere("(infoFooter.politiqueCondition LIKE :keyword OR infoFooter.expeLivraison LIKE :keyword OR infoFooter.politiqueRR LIKE :keyword OR infoFooter.contact LIKE :keyword OR  infoFooter.quiSommeNous LIKE :keyword)", { keyword: `%${searchTerm}%` })
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des informations du footer a bien été récupéré.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des informations du footer n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getInfoFooter = async (req: Request, res: Response) => {
    await myDataSource.getRepository(InfoFooter).findOne({
        where: {
            id: parseInt(req.params.id),
        },
    })
    .then(infoFooter => {
        if(infoFooter === null) {
          const message = `L'information demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `L'information a bien été trouvé.`
        return success(res,200, infoFooter,message);
    })
    .catch(error => {
        const message = `L'information n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getInfoFooterByStatus = async (req: Request, res: Response) => {
    try {
        const apropos = await myDataSource.getRepository(InfoFooter).find({
            where: {
                statut: true, 
            },
        });

        const message = "Récupération des informations avec statut actif effectuée avec succès";
        return success(res, 200, apropos, message);
    } catch (error) {
        const message = "Les informations n'ont pas pu être récupérée. Réessayez dans quelques instants.";
        return generateServerErrorCode(res, 500, error, message);
    }
};

export const updateInfoFooter = async (req: Request, res: Response) => {
    try {
        const infoFooter = await myDataSource.getRepository(InfoFooter).findOne({
            where: {
                id: parseInt(req.params.id),
            },
        });

        if (!infoFooter) {
            return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Cet infoFooter existe déjà');
        }

        const statutActuel = infoFooter.statut;

        myDataSource.getRepository(InfoFooter).merge(infoFooter, req.body);
        if (statutActuel) {
            infoFooter.statut = true;
        }
        console.log('Merge', infoFooter)
        const errors = await validate(infoFooter);
        if (errors.length > 0) {
            const message = validateMessage(errors);
            return generateServerErrorCode(res, 400, errors, message);
        }

        await myDataSource.getRepository(InfoFooter).update(infoFooter.id, infoFooter);
        console.log('Update', infoFooter)

        const successMessage = `L'infoFooter ${infoFooter.id} a bien été modifié.`;
        return success(res, 200, infoFooter, successMessage);
    } catch (error) {
        return generateServerErrorCode(res, 500, error, `L'infoFooter n'a pas pu être modifié. Réessayez dans quelques instants.`);
    }
}

export const deleteInfoFooter = async (req: Request, res: Response) => {
     const resultat = await checkRelationsOneToMany('InfoFooter', parseInt(req.params.id));
     await myDataSource.getRepository(InfoFooter)
     .findOne({
         where: {
            id: parseInt(req.params.id)
         },
      })
     .then(infoFooter => {        
         if(infoFooter === null) {
           const message = `L'infoFooter demandé n'existe pas. Réessayez avec un autre identifiant.`
           return generateServerErrorCode(res,400,"L'id n'existe pas",message);
         }
         if(resultat){
             const message = `Cet infoFooter est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
             return generateServerErrorCode(res,400,"Cet infoFooter est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
         }else{
             myDataSource.getRepository(InfoFooter).softRemove(infoFooter)
             .then(_ => {
                 const message = `L'infoFooter avec l'identifiant n°${infoFooter.id} a bien été supprimé.`;
                 return success(res,200, infoFooter,message);
             })
         }
     }).catch(error => {
         const message = `L'infoFooter n'a pas pu être supprimé. Réessayez dans quelques instants.`
         return generateServerErrorCode(res,500,error,message)
     })
 }

export const activeInfoFooter = async (req: Request, res: Response) => {
    try {
        const infoFooterId = parseInt(req.params.id);
        const infoFooterToUpdate = await myDataSource.getRepository(InfoFooter).findOneBy({ id: parseInt(req.params.id) });

        if (!infoFooterToUpdate) {
            return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Cet infoFooter nexiste pas');
        }

        infoFooterToUpdate.statut = true;
        await myDataSource.getRepository(InfoFooter).save(infoFooterToUpdate);

        await myDataSource.getRepository(InfoFooter).createQueryBuilder()
            .update(InfoFooter)
            .set({ statut: false })
            .where('id != :id', { id: infoFooterId })
            .execute();

        const successMessage = `L'infoFooter ${infoFooterId} a bien été activé.`;
        return success(res, 200, infoFooterToUpdate, successMessage);
    } catch (error) {
        return generateServerErrorCode(res, 500, error, `L'infoFooter n'a pas pu être activé. Réessayez dans quelques instants.`);
    }
}