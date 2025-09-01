import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets, Not } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Apropos } from "../entity/Apropos";
import multer from 'multer';
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createApropos = async (req: Request, res: Response) => {

    if(req["files"]){
        for(let i in req["files"]){
            req.body[i] = req["files"][i][0].originalname;
         }
    }
    
    console.log("BOOODY  ==> ", req.body)
    //return 0;
    const apropos = myDataSource.getRepository(Apropos).create(req.body);
    const errors = await validate(apropos);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Apropos).save(apropos)
    .then((apropos: Apropos | Apropos[]) => {
        const id = !isArray(apropos) ? apropos.id : '';
        const message = `L'apropos N° ${id} a bien été créée.`;
        return success(res,201, apropos,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce apropos existe déjà');
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce apropos existe déjà');
        }
        const message = `L'apropos n'a pas pu être ajouté. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res,500,error,message);
    })
}

// export const getAllApropos = async (req: Request, res: Response) => {
//     await myDataSource.getRepository(Apropos).find({
//     })
//     .then((retour) => {
//         const message = 'La liste des apropos a bien été récupérée.';
//         return success(res,200,{data:retour}, message);
//     }).catch(error => {
//         const message = `La liste des apropos n'a pas pu être récupérée. Réessayez dans quelques instants.`
//         //res.status(500).json({ message, data: error })
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getAllApropos = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Apropos);
    let reque = await myDataSource.getRepository(Apropos)
    .createQueryBuilder('apropos')
    .where("apropos.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des apropos a bien été récupéré.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des apropos n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAproposByStatus = async (req: Request, res: Response) => {
    try {
        const apropos = await myDataSource.getRepository(Apropos).find({
            where: {
                statut: true, 
            },
        });

        const message = "Récupération des apropos avec statut actif effectuée avec succès";
        return success(res, 200, apropos, message);
    } catch (error) {
        const message = "La liste des apropos n'a pas pu être récupérée. Réessayez dans quelques instants.";
        return generateServerErrorCode(res, 500, error, message);
    }
};

export const getApropos = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Apropos).findOne({
        where: {
            id: parseInt(req.params.id),
        },
    })
    .then(apropos => {
        if(apropos === null) {
          const message = `L'apropos demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `L'apropos a bien été trouvé.`
        return success(res,200, apropos,message);
    })
    .catch(error => {
        const message = `L'apropos n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


// export const updateApropos = async (req: Request, res: Response) => {
//     const apropos = await myDataSource.getRepository(Apropos).findOne(
//        { 
//         where: {
//             id: parseInt(req.params.id),
//         },
//     }
//     )
//     if (!apropos) {
//         return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet apropos existe déjà')
//     }
//     myDataSource.getRepository(Apropos).merge(apropos,req.body);
//     const errors = await validate(apropos);
//     if (errors.length > 0) {
//         const message = validateMessage(errors);
//         return generateServerErrorCode(res,400,errors,message)
//     }
//     await myDataSource.getRepository(Apropos).save(apropos).then(Apropos => {
//         const message = `L'apropos ${apropos.id} a bien été modifié.`
//         return success(res,200, Apropos,message);
//     }).catch(error => {
//         if(error instanceof ValidationError) {
//             return generateServerErrorCode(res,400,error,'Cet apropos existe déjà')
//         }
//         if(error.code == "ER_DUP_ENTRY") {
//             return generateServerErrorCode(res,400,error,'Cet apropos existe déjà')
//         }
//         const message = `L'apropos n'a pas pu être ajouté. Réessayez dans quelques instants.`
//         return generateServerErrorCode(res,500,error,message)
//         // res.status(500).json({ message, data: error }) 
//     })
// }

export const updateApropos = async (req: Request, res: Response) => {
    try {
        const apropos = await myDataSource.getRepository(Apropos).findOne({
            where: {
                id: parseInt(req.params.id),
            },
        });

        if (!apropos) {
            return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Cet apropos existe déjà');
        }

        const statutActuel = apropos.statut;

        if(req["files"]){
                    for(let i in req["files"]){
                        console.log("IIIIIIII",req["files"][i]);
                        req.body[i] = req["files"][i][0].originalname;
                    }
                }
        myDataSource.getRepository(Apropos).merge(apropos, req.body);
        if (statutActuel) {
            apropos.statut = true;
        }
        console.log('Merge', apropos)
        const errors = await validate(apropos);
        if (errors.length > 0) {
            const message = validateMessage(errors);
            return generateServerErrorCode(res, 400, errors, message);
        }

        await myDataSource.getRepository(Apropos).update(apropos.id, apropos);
        console.log('Update', apropos)

        const successMessage = `L'apropos ${apropos.id} a bien été modifié.`;
        return success(res, 200, apropos, successMessage);
    } catch (error) {
        return generateServerErrorCode(res, 500, error, `L'apropos n'a pas pu être modifié. Réessayez dans quelques instants.`);
    }
}

export const deleteApropos = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Apropos', parseInt(req.params.id));
    await myDataSource.getRepository(Apropos)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        },
        })
    .then(apropos => {        
        if(apropos === null) {
          const message = `L'apropos demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cet apropos est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cet apropos est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Apropos).softRemove(apropos)
            .then(_ => {
                const message = `L'apropos avec l'identifiant n°${apropos.id} a bien été supprimé.`;
                return success(res,200, apropos,message);
            })
        }
    }).catch(error => {
        const message = `L'apropos n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}


// export const activeApropos = async (req: Request, res: Response) => {
//     const apropos = await myDataSource.getRepository(Apropos).findOneBy({ id: parseInt(req.params.id) });
//     if (!apropos) {
//       return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Cet apropos existe déjà');
//     }
  
//     if (apropos.statut === false) {
//       apropos.statut = true;
//     }
//     await myDataSource.getRepository(Apropos).update({ id: Not(apropos.id) }, { statut: false });
  
//     const errors = await validate(apropos);
//     if (errors.length > 0) {
//       const message = validateMessage(errors);
//       return generateServerErrorCode(res, 400, errors, message);
//     }
  
//     await myDataSource.getRepository(Apropos).save(apropos).then(apropos => {
//       const message = `L'apropos ${req.body.id} a bien été modifié.`;
//       return success(res, 200, apropos, message);
//     }).catch(error => {
//       if (error instanceof ValidationError) {
//         return generateServerErrorCode(res, 400, error, 'Cet apropos existe déjà');
//       }
//       if (error.code == "ER_DUP_ENTRY") {
//         return generateServerErrorCode(res, 400, error, 'Cet apropos existe déjà');
//       }
//       const message = `L'apropos n'a pas pu être ajouté. Réessayez dans quelques instants.`;
//       return generateServerErrorCode(res, 500, error, message);
//     });
//   }

export const activeApropos = async (req: Request, res: Response) => {
    try {
        const aproposId = parseInt(req.params.id);
        const aproposToUpdate = await myDataSource.getRepository(Apropos).findOneBy({ id: parseInt(req.params.id) });

        if (!aproposToUpdate) {
            return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Cet apropos nexiste pas');
        }

        aproposToUpdate.statut = true;
        await myDataSource.getRepository(Apropos).save(aproposToUpdate);

        await myDataSource.getRepository(Apropos).createQueryBuilder()
            .update(Apropos)
            .set({ statut: false })
            .where('id != :id', { id: aproposId })
            .execute();

        const successMessage = `L'apropos ${aproposId} a bien été activé.`;
        return success(res, 200, aproposToUpdate, successMessage);
    } catch (error) {
        return generateServerErrorCode(res, 500, error, `L'apropos n'a pas pu être activé. Réessayez dans quelques instants.`);
    }
}
