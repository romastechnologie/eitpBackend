import { Request, Response } from "express";
import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { ValidationError, arrayContains, isArray, validate } from "class-validator";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { ContactUser } from "../entity/ContactUser";

export const createContactUser = async (req: Request, res: Response) => {
    try {
        const contact1 = myDataSource.getRepository(ContactUser).create(req.body);

        console.log('444444444444 ===> ',contact1)
        const errors = await validate(contact1);
        console.log('errorserrorserrors ===> ',errors)
        if (errors.length > 0) {
            const message = validateMessage(errors);
            return generateServerErrorCode(res,400,errors,message)
            //throw { status: 400, errors, message }; // Lancer une erreur personnalisée
        }

        const contact = await myDataSource.manager.transaction(async (transactionalEntityManager) => {
            const savedContact = await transactionalEntityManager.save(contact1);
            console.log('savedContactsavedContact ===> ',savedContact)
            return savedContact;
        });

        const message = `Le contact a bien été créé.`;
        return success(res, 201, contact, message);

    } catch (error: any) {
        if (error.status) {
            return generateServerErrorCode(res, error.status, error.errors, error.message);
        }

        if (error instanceof ValidationError || error?.code === "ER_DUP_ENTRY") {
            const message = 'Ce contact existe déjà.';
            return generateServerErrorCode(res, 400, error, message);
        }

        const message = `Erreur lors de la création du contact. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};


    export const getAllContactsUser = async (req: Request, res: Response) => {
        const contactRepository = myDataSource.getRepository(ContactUser);
        const client = req.query.client
        try {
            let contactQuery = myDataSource.getRepository(ContactUser)
                .createQueryBuilder('cn')
                .leftJoinAndSelect("cn.client","client");
    
            if (client) {
                contactQuery = contactQuery.where("client.id = :client", { client });
            }
            const message = "Récupération faite pour les contacts du client"
            const contacts = await contactQuery.getMany();
    
            return success(res,200, contacts,message);
            
            //return res.status(200).json({ contacts });
        } catch (error) {
            return res.status(500).json({ message: "vous n'avez pas ce privilège.", error: error.message });
        }
    };

    export const updateContactUser = async (req: Request, res: Response) => {
        const contact = await myDataSource.getRepository(ContactUser).findOneBy({id: parseInt(req.params.id),})
        if (!contact) {
            return generateServerErrorCode(res,400,"L'id n'existe pas",'Ce rôle existe déjà')
        }
        const contactmerge = myDataSource.getRepository(ContactUser).merge(contact,req.body);
        
        const errors = await validate(contactmerge)
        if (errors.length > 0) {
            const message = validateMessage(errors);
            return generateServerErrorCode(res,400,errors,message)
        }
        await myDataSource.manager.transaction(async (transactionalEntityManager) => {
            const resulRo = await transactionalEntityManager.save(contactmerge);
        }).then(contact=>{
            const message = `Le contact a bien été modifié.`
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
        })
    }
  
    export const deleteContactUser = async (req: Request, res: Response) => {
        const resultat = await checkRelationsOneToMany('ContactUser', parseInt(req.params.id));
        await myDataSource.getRepository(ContactUser).findOneBy({id: parseInt(req.params.id)}).then(contact => {        
            if(contact === null) {
            const message = `Le rôle demandé n'existe pas. Réessayez avec un autre identifiant.`
            return generateServerErrorCode(res,400,"L'id n'existe pas",message);
            }
            if(resultat){
                const message = `Ce contact est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
                return generateServerErrorCode(res,400,"Ce contact est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
            }else{
                myDataSource.getRepository(ContactUser).softRemove(contact)
                .then(_ => {
                    const message = `Le contact avec l'identifiant n°${contact.id} a bien été supprimé.`;
                    return success(res,200, contact,message);
                })
            }
        })
        .catch(error => {
            const message = `Le contact n'a pas pu être supprimé. Réessayez dans quelques instants.`
            return generateServerErrorCode(res,500,error,message)
        })
    }