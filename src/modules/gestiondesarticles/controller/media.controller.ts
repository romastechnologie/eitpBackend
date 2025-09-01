import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Media } from "../entity/Media";
import { decryptage, deleteFile,supprimeFichier } from "../../../configs/function";

export const createMedia = async (req: Request, res: Response) => {
    const media = myDataSource.getRepository(Media).create(req.body);
    const errors = await validate(media)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Media).save(media)
    .then(media => {
        const message = `Le média ${req.body.id} a bien été créé.`
        return success(res,201, media,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce média existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce média existe déjà.')
        }
        const message = `Le média n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getAllMedia = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Media).find({
        relations:{
            article:true,
            typeMedia:true,
        }
    })
    .then((retour) => {
        const message = 'La liste des médias a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des médias n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getMedia = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Media).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            article:true,
            typeMedia:true,
    },
    })
    .then(media => {
        if(media === null) {
          const message = `Le média demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le média a bien été trouvé.`
        return success(res,200, media,message);
    })
    .catch(error => {
        const message = `Le média n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateMedia = async (req: Request, res: Response) => {
    const media = await myDataSource.getRepository(Media).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            article:true,
            typeMedia:true,
        },
    }
    )
    if (!media) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Ce média existe déjà')
    }
    myDataSource.getRepository(Media).merge(media,req.body);
    const errors = await validate(media);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Media).save(media).then(media => {
        const message = `Le média ${media.id} a bien été modifié.`
        return success(res,200, media,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce média existe déjà')
        }
        const message = `Le média n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteMedia = async (req: Request, res: Response) => {
    const mediaId = decryptage(req.params.key);
    var medias = null;
    await myDataSource.manager.transaction(async (transactionalEntityManager) => {
        medias = await transactionalEntityManager.getRepository(Media).findOneBy({id: parseInt(mediaId)});
        const ancienMedia = medias.name;
       await transactionalEntityManager.getRepository(Media).remove(medias);
       await deleteFile("uploads/Produits", ancienMedia);
    }).then(media => {
        const message = `Le média avec l'identifiant n°${medias.id} a bien été supprimé.`;
        return success(res,200, medias,message);
    }).catch(error => {
        const message = `Le média n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
