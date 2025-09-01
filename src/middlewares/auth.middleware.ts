import * as express from 'express';
import Jwt  = require("jsonwebtoken");
import { myDataSource } from '../configs/data-source';
import { config } from '../configs/config';
import { User } from '../modules/gestiondesutilisateurs/entity/user.entity';
import { generateServerErrorCode } from '../configs/response';
import { Permission } from '../modules/gestiondesutilisateurs/entity/permission.entity';


export const isAuthenticated = async (req, res, next) => {
    const tokenBear = req.header('Authorization');
    if (!tokenBear) {
      return generateServerErrorCode(res,401,'token non renseigné',"Échec d'authentification");
    }
    const token = tokenBear.split(' ')[1]
    Jwt.verify(token, config.jwt.accessToken, (err, user) => {
      if (err) return generateServerErrorCode(res,403,"Le jeton n'est pas valide","Échec d'authentification");
      req.user = user;
      next();
    });
}


export const isAuthenticatedOne = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization

  if(!authorizationHeader) {
    const message = `Vous n'avez pas fourni de jeton d'authentification. Ajoutez-en un dans l'en-tête de la requête.`
    return generateServerErrorCode(res,401,'token non renseigné',message);
  }
  
  const token = authorizationHeader.split(' ')[1]
  const decodedToken = Jwt.verify(token, config.jwt.accessToken, (error, decodedToken) => {
    if(error) {
      const message = `L'utilisateur n'est pas autorisé à accèder à cette ressource.`
      return generateServerErrorCode(res,401,'token non renseigné',message);
    }
    console.log(decodedToken.userId,'dfffffffffffffffffffffffffddddddddddd');
    if(decodedToken.userType == "Client"){
      req.body.client = decodedToken.userId;
      req.body.userCreation = decodedToken.userId
    } else {
      req.body.userCreation = decodedToken.userId
    }

    const userId = decodedToken.userId;
    console.log("RRRRRRRRRR ===> ", req.body)
    console.log("decodedToken.userId ===> ", userId);
    console.log("req.body.userId ===> ", req.body.userId);

    
    if(req.body.userId && req.body.userId !== userId) {
      const message = `L'identifiant de l'utilisateur est invalide.`
      return generateServerErrorCode(res,401,"Le jeton n'est pas valide",message);
    }else {
      next()
    }
  })
}

export const checkPermission = (resource) => {
  return async (req, res, next) => {
    console.log('JE VERIFIE PA MOI MEME ==> ',req.body)
    try {
      const user = await myDataSource.getRepository(Permission)
       .createQueryBuilder("permission")
       .leftJoin("permission.rolePermissions", "rolePermission")
       .leftJoin("rolePermission.role", "role")
       .leftJoin("role.users", "users")
       .where("users.id = :ident", { ident: req.body.userCreation || req.body.userId })
       .andWhere("permission.nom = :resou", { resou: resource })
       .getMany();
       //console.log(user,"ffffffffffffffffffffffffffffffffffff");
       if (user.length > 0) {
          next();
        } else {
          return generateServerErrorCode(res,400,"Vous n'avez pas ce privilège","Vous n'avez pas ce privilège");
       }
      } catch (error) {
       return generateServerErrorCode(res,400,"Vous n'avez pas ce privilège","Vous n'avez pas ce privilège");
    }
  }
}
