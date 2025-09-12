import { Request, Response } from "express";
import { Role } from "../entity/role.entity";
import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { ValidationError, isArray, validate } from "class-validator";
import { RolePermission } from "../entity/RolePermission.entity";
import { diffToTwoArray } from "../../../configs/config";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { User } from "../entity/user.entity";

    export const createRole = async (req: Request, res: Response) => {
        const { privileges, ...roleData } = req.body;
    
        const roleRepository = myDataSource.getRepository(Role);
        const userRepository = myDataSource.getRepository(User);
    
        const userId = req.headers['userid'];
        if (!userId) {
            return res.status(400).json({ message: "L'identifiant de l'utilisateur n'est pas fourni dans les en-têtes.." });
        }
    
        try {
            const userConnecte = await userRepository.findOne({
                where: { id: Number(userId) },
                relations: ['marchand']
            });
    
            if (!userConnecte) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }
    
            await myDataSource.manager.transaction(async (transactionalEntityManager) => {
                
                const role = roleRepository.create(roleData);
                const errors = await validate(role);
    
                if (errors.length > 0) {
                    const message = validateMessage(errors);
                    return generateServerErrorCode(res, 400, errors, message);
                }
    
                const savedRoleOrRoles = await transactionalEntityManager.save(role);
    
                if (privileges && savedRoleOrRoles) {
                    if (Array.isArray(savedRoleOrRoles)) {
                        const savedRoles = savedRoleOrRoles as Role[];
                        for (const savedRole of savedRoles) {
                            const rolePermissions = privileges.map(permissionId => {
                                const rolePermission = new RolePermission();
                                rolePermission.permissionId = permissionId;
                                rolePermission.roleId = savedRole.id;
                                return rolePermission;
                            });
    
                            await transactionalEntityManager.save(rolePermissions);
                        }
                    } else {
                        const savedRole = savedRoleOrRoles as Role;
                        const rolePermissions = privileges.map(permissionId => {
                            const rolePermission = new RolePermission();
                            rolePermission.permissionId = permissionId;
                            rolePermission.roleId = savedRole.id;
                            return rolePermission;
                        });
    
                        await transactionalEntityManager.save(rolePermissions);
                    }
                }
    
                return savedRoleOrRoles;
            }).then(role => {
                const message = `Le rôle et ses privilèges ont bien été créés.`;
                return success(res, 201, role, message);
            }).catch(error => {
                if (error instanceof ValidationError) {
                    return generateServerErrorCode(res, 400, error, 'Ce rôle existe déjà');
                }
                if (error.code === "ER_DUP_ENTRY") {
                    return generateServerErrorCode(res, 400, error, 'Ce rôle existe déjà');
                }
                const message = `Le rôle n'a pas pu être ajouté. Réessayez dans quelques instants.`;
                return generateServerErrorCode(res, 500, error, message);
            });
        } catch (error) {
            const message = `Erreur lors de la création du rôle. Réessayez dans quelques instants.`;
            return generateServerErrorCode(res, 500, error, message);
        }
    };
    
    
    export const createRolePermeission = async (req: Request, res: Response) => {
        if (req.body.privileges.length < 1) {
            return generateServerErrorCode(res,400,"Aucune liste de privilège","Aucune liste de privilège")
        }
        
        await myDataSource.manager.transaction(async (transactionalEntityManager) => {
            const permission = req.body.privileges;
            let rolePermissions = [];
            if(permission && req.body.idRole) {
                for (let index = 0; index < permission.length; index++) {
                    const element = new RolePermission()
                    element.permissionId = parseInt(permission[index]);
                    element.roleId = req.body.idRole;
                    rolePermissions.push(element);
                }
            await transactionalEntityManager.save(rolePermissions);
            }
        }).then(role=>{
            const message = `Le rôle a été mis à jour avec succès`
            return success(res,200, role,message);
        }).catch(error => {
            if(error instanceof ValidationError) {
                return generateServerErrorCode(res,400,error,'Ce role existe déjà')
            }
            if(error.code == "ER_DUP_ENTRY") {
                return generateServerErrorCode(res,400,error,'Ce role existe déjà')
            }
            const message = `Le rôle n'a pas pu être ajouté. Réessayez dans quelques instants.`
            return generateServerErrorCode(res,500,error,message)
        })
    }

    // export const getAllRoles = async (req: Request, res: Response) => {
    //     const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Role);
    //     await myDataSource.getRepository(Role)
    //         .find({ 
    //             select:{id:true, nom:true, description:true, estMarchand:true, rolePermissions:{ permissionId:true, permission:{ nom:true, description:true }}},
    //             relations: { rolePermissions: { permission: true}} 
    //         })
    //     .then(roles => {
    //         const message = 'La liste des roles a bien été récupéré.';
    //         return success(res,200,roles, message);
    //     }).catch(error => {
    //         const message = `La liste des roles n'a pas pu être récupéré. Réessayez dans quelques instants.`
    //         ////res.status(500).json({ message, data: error })
    //         return generateServerErrorCode(res,500,error,message)
    //     })
    // };

    export const getAllRoles = async (req: Request, res: Response) => {
        const userRepository = myDataSource.getRepository(User);
        const userId = req.headers['userid'];
        
        try {
            const userConnecte = await userRepository.findOne({
                where: { id: Number(userId) },
                //relations: ['marchand']
            });
    
            if (!userConnecte) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }
    
            let rolesQuery = myDataSource.getRepository(Role)
                .createQueryBuilder('role')
                .select([
                    'role.id',
                    'role.nom',
                    'role.description',
                    // 'role.estMarchand',
                    'rolePermissions.permissionId',
                    'permission.nom',
                    'permission.description'
                ])
                .leftJoin('role.rolePermissions', 'rolePermissions')
                .leftJoin('rolePermissions.permission', 'permission');
    
           
    
            const roles = await rolesQuery.getMany();
    
            return res.status(200).json({ roles });
        } catch (error) {
            return res.status(500).json({ message: "vous n'avez pas ce privilège.", error: error.message });
        }
    };
  
    export const getSimpleRole = async (req: Request, res: Response) => {

        await myDataSource.getRepository(Role).findOneBy({ id: parseInt(req.params.id) })
        .then(role => {
            if(role === null) {
            const message = `Le rôle demandé n'existe pas. Réessayez avec un autre identifiant.`
            return generateServerErrorCode(res,400,"L'id n'existe pas",message)
            }
            const message = 'Un rôle a bien été trouvé.'
            return success(res,200, role,message);
        })
        .catch(error => {
            const message = `Le rôle n'a pas pu être récupéré. Réessayez dans quelques instants.`
            return generateServerErrorCode(res,500,error,message)
        })
    };

    export const getRole = async (req: Request, res: Response) => {
        await myDataSource.getRepository(Role).findOne({
            where: { id: parseInt(req.params.id) },
            select: {id:true, nom:true, description:true, estMarchand:true, createdAt:true,
                users:{ id:true, nom:true, prenom:true,email:true, sexe:true,telephone:true, createdAt:true },
            },
            relations: { 
                rolePermissions: { permission: true},
                users:true
            } 
        }).then(role => {
            if(role === null) {
            const message = `Le rôle demandé n'existe pas. Réessayez avec un autre identifiant.`
            return generateServerErrorCode(res,400,"L'id n'existe pas",message)
            }
            const message = 'Un rôle a bien été trouvé.'
            return success(res,200, role,message);
        }).catch(error => {
            const message = `Le rôle n'a pas pu être récupéré. Réessayez dans quelques instants.`
            return generateServerErrorCode(res,500,error,message)
        })
    };

    export const updateRole = async (req: Request, res: Response) => {
        const role = await myDataSource.getRepository(Role).findOneBy({id: parseInt(req.params.id),})
        if (!role) {
            return generateServerErrorCode(res,400,"L'id n'existe pas",'Ce rôle existe déjà')
        }
        const rolemerge = myDataSource.getRepository(Role).merge(role,req.body);
        
        const errors = await validate(role)
        if (errors.length > 0) {
            const message = validateMessage(errors);
            return generateServerErrorCode(res,400,errors,message)
        }
        let privileges=[];
        await myDataSource.manager.getRepository(RolePermission).find(
            { 
                where:  { roleId: parseInt(req.params.id) },
                select: { permissionId:true }
            }
        ).then(rolePermission => {
            rolePermission.forEach(element => {
                privileges.push(element.permissionId.toString())
            });
          
        })
        let intersection = req.body.privileges.filter(x => !privileges.includes(x))

        await myDataSource.manager.transaction(async (transactionalEntityManager) => {
            const resulRo = await transactionalEntityManager.save(rolemerge);
            var roleId;
            //req.params.id;
            if(isArray(resulRo)) {
                roleId = resulRo[0].id
            }else {
                const resultrol = resulRo as Role
                roleId = resultrol.id
            }
            const permission = req.body.privileges;
            let rolePermissions = [];
            if(permission && roleId) {
                for(let index = 0; index < permission.length; index++) {
                    if (!privileges.includes(permission[index])) {
                        const element = new RolePermission()
                        element.permissionId = parseInt(permission[index]);
                        element.roleId = parseInt(roleId);
                        rolePermissions.push(element);
                    }
                }
               if (rolePermissions.length > 0) {
                  await transactionalEntityManager.save(rolePermissions);
               }
            }
            const diff = diffToTwoArray(permission,privileges);
           // console.log(diff,'diff');
            if (diff.length > 0) {
                transactionalEntityManager.getRepository(RolePermission).createQueryBuilder()
                .softDelete()
                .where("permissionId in (:permissionIds )", { permissionIds: diff.join(',') })
                .andWhere("roleId in (:roleId )", { roleId:  req.params.id})
                .execute();
            }
        }).then(role=>{
            const message = `Le rôle ${req.body.nom} et ses privilèges sont bien été modifié.`
            return success(res,200, role,message);
        }).catch(error => {
            if(error instanceof ValidationError) {
                return generateServerErrorCode(res,400,error,'Ce role existe déjà')
            }
            if(error.code == "ER_DUP_ENTRY") {
                return generateServerErrorCode(res,400,error,'Ce role existe déjà')
            }
            const message = `Le rôle n'a pas pu être ajouté. Réessayez dans quelques instants.`
            return generateServerErrorCode(res,500,error,message)
        })
    }
  
    export const deleteRole = async (req: Request, res: Response) => {
        const resultat = await checkRelationsOneToMany('Role', parseInt(req.params.id));
        await myDataSource.getRepository(Role).findOneBy({id: parseInt(req.params.id)}).then(role => {        
            if(role === null) {
            const message = `Le rôle demandé n'existe pas. Réessayez avec un autre identifiant.`
            return generateServerErrorCode(res,400,"L'id n'existe pas",message);
            }
            if(resultat){
                const message = `Ce rôle est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
                return generateServerErrorCode(res,400,"Ce rôle est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
            }else{
                myDataSource.getRepository(Role).softRemove(role)
                .then(_ => {
                    const message = `Le rôle avec l'identifiant n°${role.id} a bien été supprimé.`;
                    return success(res,200, role,message);
                })
            }
        })
        .catch(error => {
            const message = `Le rôle n'a pas pu être supprimé. Réessayez dans quelques instants.`
            return generateServerErrorCode(res,500,error,message)
        })
    }

    export const deleteRolePermission = async (req: Request, res: Response) => {
        //const resultat = await checkRelationsOneToMany('Role', parseInt(req.params.id));
        await myDataSource.getRepository(RolePermission).findOneBy({id: parseInt(req.params.id)}).then(role => {        
            if(role === null) {
            const message = `Le rôle demandé n'existe pas. Réessayez avec un autre identifiant.`
            return generateServerErrorCode(res,400,"L'id n'existe pas",message);
            }
            myDataSource.getRepository(RolePermission).softRemove(role)
            .then(_ => {
                const message = `Le rôle avec l'identifiant n°${role.id} a bien été supprimé.`;
                return success(res,200, role,message);
            })
        })
        .catch(error => {
            const message = `Le rôle n'a pas pu être supprimé. Réessayez dans quelques instants.`
            return generateServerErrorCode(res,500,error,message)
        })
    }