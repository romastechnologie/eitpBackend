import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
//import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Brackets, Not } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Contact } from "../entity/Contact";
import { sendEmail } from "../../gestiondescontactsSMS/controller/envoieMail";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";


export const createContact = async (req: Request, res: Response) => {
    const contact = myDataSource.getRepository(Contact).create(req.body);
    
    console.log(req.body)
    
    const errors = await validate(contact)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Contact).save(contact)
    .then(contact=> {
        const nomComplet= req.body.nomComplet;
        const  email=req.body.email;
        const telephone = req.body.telephone;
        const service = req.body.service;
        const message = req.body.message;
        const subject = 'envoie';
        sendEmail(subject, nomComplet,email, telephone,service,message );
        
        const info = `Le contact ${req.body.nomComplet} a bien été créé.`
        return success(res,201, contact,info);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce contact existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce contact existe déjà');
        }
        const message = `Le contact n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message);
    })
}

// export const getAllContact = async (req: Request, res: Response) => {

//     await myDataSource.getRepository(Contact).find({
//         order: {
//             id: "DESC",
//         },
//     })
//     .then(categories => {
//        const message = "Récuperation d'contact effectuée avec succès";
//         return success(res,200,categories, message);
//     }).catch(error => {
//         const message = `La liste des contact n'a pas pu être récupérée. Réessayez dans quelques instants.`;
//         //res.status(500).json({ message, data: error })
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getAllContact = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Contact);
    let reque = await myDataSource.getRepository(Contact)
    .createQueryBuilder('contact')
    .leftJoinAndSelect('contact.categorieArticle', 'categorieArticle')
    .where("contact.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des contacts a bien été récupéré.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des contacts n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};
export const getContact = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Contact).findOneBy({id: parseInt(req.params.id)})
    .then(contact => {
        if(contact === null) {
          const message = `Le contact demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le contact a bien été trouvé.`
        return success(res,200, contact,message);
    })
    .catch(error => {
        const message = `Le contact n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const updateContact = async (req: Request, res: Response) => {
    const contact = await myDataSource.getRepository(Contact).findOneBy({id: parseInt(req.params.id),})
    if (!contact) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Ce contact existe déjà')
    }
    myDataSource.getRepository(Contact).merge(contact,req.body);
    const errors = await validate(contact)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Contact).save(contact).then(contact => {
        const message = `Le contact ${req.body.nomComplet} a bien été modifié.`
        return success(res,200, contact,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce contact existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce contact existe déjà')
        }
        const message = `Le contact n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}
  
export const deleteContact = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Contact', parseInt(req.params.id));
    await myDataSource.getRepository(Contact).findOneBy({id: parseInt(req.params.id)}).then(contact => {        
        if(contact === null) {
          const message = `Le contact n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }
        if(resultat){
            const message = `Ce contact est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce contact est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Contact).softRemove(contact)
            .then(_ => {
                const message = `Le contact ${contact.id}  a bien été supprimé.`;
                return success(res,200, contact,message);
            })
        }
    }).catch(error => {
        const message = `Le contact n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

// export const activeContact = async (req: Request, res: Response) => {
//     const contact = await myDataSource.getRepository(Contact).findOneBy({ id: parseInt(req.params.id) });
//     if (!contact) {
//       return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Ce contact existe déjà');
//     }
  
//     if (contact.statut === false) {
//       contact.statut = true;
//     }
//     await myDataSource.getRepository(Contact).update({ id: Not(contact.id) }, { statut: false });
  
//     const errors = await validate(contact);
//     if (errors.length > 0) {
//       const message = validateMessage(errors);
//       return generateServerErrorCode(res, 400, errors, message);
//     }
  
//     await myDataSource.getRepository(Contact).save(contact).then(contact => {
//       const message = `Le contact ${req.body.libelle} a bien été modifié.`;
//       return success(res, 200, contact, message);
//     }).catch(error => {
//       if (error instanceof ValidationError) {
//         return generateServerErrorCode(res, 400, error, 'Ce contact existe déjà');
//       }
//       if (error.code == "ER_DUP_ENTRY") {
//         return generateServerErrorCode(res, 400, error, 'Ce contact existe déjà');
//       }
//       const message = `Le contact n'a pas pu être ajouté. Réessayez dans quelques instants.`;
//       return generateServerErrorCode(res, 500, error, message);
//     });
//   }
