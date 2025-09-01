import { Permission } from "../entity/permission.entity"
import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { User } from "../entity/user.entity";

export const createPermission = async (req: Request, res: Response) => {
    const permission = myDataSource.getRepository(Permission).create(req.body);
    const errors = await validate(permission)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Permission).save(permission)
    .then(permission => {
        const message = `La permission ${req.body.nom} a bien été crée.`
        return success(res,201, permission,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette permission existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette permission existe déjà')
        }
        const message = `La permission n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const getPermissions = async (req: Request, res: Response) => {
    let reque = await myDataSource.getRepository(Permission)
    .find({ 
        select:{id:true, nom:true, description:true, createdAt:true, rolePermissions:{ roleId:true, role:{ nom:true, description:true }}},
            relations: { rolePermissions: { role: true}} 
        })
    .then(permissions => {
        const message = 'La liste des permissions a bien été récupéré.';
        return success(res,200,permissions, message);
    }).catch(error => {
        const message = `La liste des permissions n'a pas pu être récupéré. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};


export const getAllPermissions = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Permission); // Assurez-vous que paginationAndRechercheInit est correctement défini
    const userId = req.headers['userid'];

    if (!userId) {
        return res.status(400).json({ message: "ID de l'utilisateur connecté non fourni." });
    }

    try {
        const userRepository = myDataSource.getRepository(User);
        const userConnecte = await userRepository.findOne({
            where: { id: Number(userId) },
            // relations: ["marchand"]
        });

        if (!userConnecte) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        let query = myDataSource.getRepository(Permission)
            .createQueryBuilder('permission')
            .leftJoinAndSelect("permission.rolePermissions", "rolePermissions")
            .leftJoinAndSelect("rolePermissions.role", "role")
            .where("permission.deletedAt IS NULL");
        if (searchQueries.length > 0) {
            query.andWhere(new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` });
            }));
        }

        const [data, totalElements] = await query
            .skip(startIndex)
            .take(limit)
            .getManyAndCount();

        const message = 'La liste des permissions a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res, 200, { data, totalPages, totalElements, limit }, message);
    } catch (error) {
        const message = `La liste des permissions n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};
  
export const getPermission = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Permission).findOneBy({id: parseInt(req.params.id)})
    .then(permission => {
        if(permission === null) {
          const message = `La permission demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = 'La permission a bien été trouvé.'
        return success(res,200, permission,message);
    })
    .catch(error => {
        const message = `La permission n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const getPermissionNotIn = async (req: Request, res: Response) => {

    const userId = req.params.userId;
    const sesPermissions = await myDataSource.getRepository(Permission)
    .createQueryBuilder("permission")
    .select("permission.id")
    .leftJoinAndSelect("permission.rolePermissions", "rolePermission")
    .leftJoinAndSelect("rolePermission.role", "role")
    .where("role.id = :id", { id: userId})
    .getMany();

    await myDataSource.getRepository(Permission)
        .createQueryBuilder("per")
        .where(`per.id NOT IN (:...ids)`, { ids: sesPermissions.map(permission => permission.id) })
        .getMany()
    .then(permission => {
        console.log("LES PERMISSION QU'IL N'A PAS SONT LAAAA");
        console.log(permission);
        if(permission === null) {
          const message = `La permission demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = 'Les permission ont bien été récupéré.'
        return success(res,200, permission,message);
    })
    .catch(error => {
        const message = `La permission n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const updatePermission = async (req: Request, res: Response) => {
    const permission = await myDataSource.getRepository(Permission).findOneBy({id: parseInt(req.params.id),})
    if (!permission) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette permission existe déjà')
    }
    myDataSource.getRepository(Permission).merge(permission,req.body);
    const errors = await validate(permission)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Permission).save(permission).then(permission => {
        const message = `La permission ${req.body.id} a bien été modifié.`
        return success(res,200, permission,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette permission existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette permission existe déjà')
        }
        const message = `La permission n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
  
export const deletePermission = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Permission', parseInt(req.params.id));
    await myDataSource.getRepository(Permission).findOneBy({id: parseInt(req.params.id)}).then(permission => {        
        if(permission === null) {
            const message = `La permission demandé n'existe pas. Réessayez avec un autre identifiant.`
            return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }
        if(resultat){
            const message = `Cette permission est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette permission est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Permission).softRemove(permission)
            .then(_ => {
                const message = `La permission avec l'identifiant n°${permission.id} a bien été supprimé.`;
                return success(res,200, permission,message);
            })
        }
    }).catch(error => {
        const message = `La permission n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
