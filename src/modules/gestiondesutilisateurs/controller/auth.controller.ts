import { Request, Response } from "express";
import { User } from "../entity/user.entity";
import { JournalConnexion } from "../entity/journalConnexion";
import { sign, verify } from "jsonwebtoken";
import bcryptjs = require("bcryptjs");
import { myDataSource } from "../../../configs/data-source";
import {
  generateServerErrorCode,
  success,
} from "../../../configs/response";
import { config } from "../../../configs/config";
import { ValidationError } from "class-validator";
import { Role } from "./../entity/role.entity";
import { mailConfirm } from "../../gestiondescontactsSMS/controller/envoieMail";

export const Register = async (req: Request, res: Response) => {
  try {
    const { nomComplet, telephone, email, sexe, password } = req.body;

    if (!email || !password || !nomComplet || !telephone || !sexe) {
      return generateServerErrorCode(
        res,
        400,
        "",
        "Tous les champs obligatoires ne sont pas renseignés"
      );
    }

    const userExiste = await myDataSource.getRepository(User).findOne({
      where: { email: email },
    });

    if (userExiste) {
      return generateServerErrorCode(res, 400, "", "Cet utilisateur existe déjà");
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const user = await myDataSource.getRepository(User).save({
      nomComplet,
      telephone,
      email,
      sexe,
      password: hashedPassword,
    });

    return success(res, 201, user, "L'utilisateur est enregistré avec succès");
  } catch (error) {
    if (error instanceof ValidationError) {
      return generateServerErrorCode(res, 400, error, "Erreur de validation");
    }
    if (error.code == "ER_DUP_ENTRY") {
      return generateServerErrorCode(
        res,
        400,
        error,
        "Cet utilisateur existe déjà avec ce mail ou numéro de téléphone"
      );
    }
    return generateServerErrorCode(
      res,
      500,
      "",
      "L'utilisateur n'a pas pu être enregistré. Réessayez plus tard."
    );
  }
};

export const verifyMailAdress = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;

    const user = await myDataSource.getRepository(User).findOne({
      where: { tokenVerifyMail: token, mailIsVerifiy: false },
    });

    if (!user) {
      return generateServerErrorCode(res, 400, "", "Ce lien n'est pas valide");
    }

    const diff = Math.abs(Date.now() - user.createdTokenVerifyMail.getTime());
    const minutes = Math.floor(diff / 1000 / 60);

    if (minutes > 30) {
      return generateServerErrorCode(
        res,
        400,
        "",
        "Ce lien a expiré. Veuillez demander un autre lien"
      );
    }

    user.mailIsVerifiy = true;
    await myDataSource.getRepository(User).save(user);

    return success(res, 200, user, "Votre mail a été vérifié avec succès");
  } catch (error) {
    return generateServerErrorCode(
      res,
      500,
      "",
      "Une erreur est survenue lors de la vérification du mail"
    );
  }
};


export const RegisterAbonner = async (req: Request, res: Response) => {
  try {
    const { nomComplet, telephone, categorieAbonne, password } = req.body;

    if (!password || !nomComplet || !telephone || !categorieAbonne) {
      return generateServerErrorCode(
        res,
        400,
        "",
        "Tous les champs obligatoires ne sont pas renseignés"
      );
    }

    const userExiste = await myDataSource.getRepository(User).findOne({
      where: { telephone: telephone },
    });

    if (userExiste) {
      return generateServerErrorCode(
        res,
        400,
        "",
        "Un compte existe déjà avec ce numéro de téléphone " + telephone
      );
    }

    const role = await myDataSource.getRepository(Role).findOne({
      where: { id: 1 },
    });

    const hashedPassword = await bcryptjs.hash(password, 12);

    const newUser = await myDataSource.getRepository(User).save({
      nomComplet,
      telephone,
      password: hashedPassword,
      role,
    });

    const { password: _, ...data } = newUser;

    return success(
      res,
      201,
      data,
      "Votre compte a été créé avec succès"
    );
  } catch (error) {
    return generateServerErrorCode(
      res,
      500,
      error,
      "L'abonné n'a pas pu être enregistré. Réessayez plus tard."
    );
  }
};

export const ResetPasswordAbonner = async (req: Request, res: Response) => {
  req.body.telephone = req.body.telephone.replace(/\s/g, "");
  try {
    if (!req.body.password || !req.body.telephone) {
      return generateServerErrorCode(
        res,
        400,
        "",
        "Tous les champs obligatoires ne sont pas renseignés"
      );
    }

    const userExiste = await myDataSource.getRepository(User).findOne({
      where: { telephone: req.body.telephone },
    });

    if (!userExiste) {
      return generateServerErrorCode(res, 400, "", "Ce compte n'existe pas");
    }

    userExiste.password = await bcryptjs.hash(req.body.password, 12);
    await myDataSource.getRepository(User).save(userExiste);

    return success(res, 200, {}, "Votre mot de passe a été modifié avec succès");
  } catch (error) {
    return generateServerErrorCode(
      res,
      500,
      error,
      "Le mot de passe n'a pas pu être modifié"
    );
  }
};



export const Login = async (req: Request, res: Response) => {
  try {
    if (!req.body.email || !req.body.password) {
      const message = "L'email et le mot de passe est une propriété requise.";
      return generateServerErrorCode(res, 400, "errors", message);
    }
    //const user = await myDataSource.getRepository(User).findOneBy({ email: req.body.email });
    const user = await myDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .leftJoinAndSelect("role.rolePermissions", "rolePermission")
      .leftJoinAndSelect("rolePermission.permission", "permission")
      //.leftJoinAndSelect("user.marchand", "marchand")
      // .leftJoinAndSelect("user.agence", "agence")
      .where("user.email = :email", { email: req.body.email })
      .getOne();

    if (!user) {
      return generateServerErrorCode(
        res,
        400,
        "Invalid Credentials",
        "Les informations d'identification sont invalides"
      );
    }

    if (!user.statut) {
      return generateServerErrorCode(
        res,
        400,
        "Invalid Credentials",
        "Vous n'êtes pas autorisé à vous connecter. Veuillez contacter l'administrateur"
      );
    }

    if (user.role != null && user.role.id == 6) {
      return generateServerErrorCode(
        res,
        400,
        "Invalid Credentials",
        "Vous n'êtes pas autorisé à vous connecter. Veuillez contacter l'administrateur"
      );
    }

    if (!(await bcryptjs.compare(req.body.password, user.password))) {
      return generateServerErrorCode(
        res,
        400,
        "Invalid Credentials",
        "Les informations d'identification sont invalides"
      );
    }
    const accessToken = sign(
      { userId: user.id, userType: "staff" },
      config.jwt.accessToken
    );
    const refreshToken = sign(
      { userId: user.id, userType: "staff" },
      config.jwt.refreshToken
    );

       const { password, ...data } = user;
    const newdata = {
      user: data,
      token: accessToken,
      refreshToken,
    };
   
    return success(res, 200, newdata, "L'authentification réussit");
  } catch (error) {
    const message = `Réessayez dans quelques instants.`;
    return generateServerErrorCode(res, 500, error, message);
  }
};


export const codeVerification = async (req: Request, res: Response) => {
  const telephone = req.body.telephone;
  const code = req.body.code;
  const verifyNumber = req.body.verifyNumber;
  const abonneId = req.body.abonneId;
  const userId = req.body.userId;
  console.log(verifyNumber, code, telephone, abonneId);

};

export const sendVerificationCode = async (req: Request, res: Response) => {
  
};

export const SendResetPasswordCode = async (req: Request, res: Response) => {
  console.log("ALOOOOOOo");
  console.log(req.body);
  req.body.telephone = req.body.telephone.replace(/\s/g, "");
  try {
    if (!req.body.telephone) {
      const message = "Le numéro de téléphone est requise.";
      return generateServerErrorCode(res, 400, "errors", message);
    }
    const user = await myDataSource.getRepository(User).findOne({
      where: { telephone: req.body.telephone }, //, relations:{abonne:true}
    });

    if (!user) {
      return generateServerErrorCode(
        res,
        400,
        "Invalid Credentials",
        "Ce compte n'esixte pas"
      );
    }
    const { password, ...data } = user;
    
  } catch (e) {
    const message = `Réessayez dans quelques instants.`;
    return generateServerErrorCode(res, 500, e, message);
  }
};

export const LoginAbonner = async (req: Request, res: Response) => {
  try {
    if (!req.body.telephone || !req.body.password) {
      const message =
        "Le numéro de téléphone et le mot de passe sont des propriétés requises.";
      return generateServerErrorCode(res, 400, "errors", message);
    }
    const abonne = await myDataSource.getRepository(User).findOne({
      where: { telephone: req.body.telephone }, //, relations:{abonne:true}
    });
    
    if (!abonne) {
      return generateServerErrorCode(
        res,
        400,
        "Invalid Credentials",
        "Les informations d'identification sont invalides"
      );
    }
    if (!(await bcryptjs.compare(req.body.password, abonne.password))) {
      return generateServerErrorCode(
        res,
        400,
        "Invalid Credentials",
        "Les informations d'identification sont invalides"
      );
    }
   
    const { password, ...data } = abonne;
    const newdata = data;
   
    console.log(newdata, "newdatanewdatanewdatanewdatanewdata");
    
  } catch (error) {
    const message = `Réessayez dans quelques instants.`;
    return generateServerErrorCode(res, 500, error, message);
  }
};

export const RegisterPassport = async (req: Request, res: Response) => {
  try {
    const { nom, prenoms, telephone, email, sexe, password } = req.body;

    if (!email || !password || !nom || !prenoms || !telephone || !sexe) {
      return res.status(400).send({
        message: "Tous les champs obligatoires ne sont pas renseignés",
      });
    }
    const user = await myDataSource.getRepository(User).findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      const newUser = await myDataSource.getRepository(User).save({
        nom,
        prenoms,
        telephone,
        email,
        sexe,
        password: await bcryptjs.hash(password, 12),
      });

      // Sign token
      const token = sign({ user: newUser.id }, config.jwt.accessToken, {
        expiresIn: 10000000,
      });
      const userToReturn = { ...newUser, ...{ token } };

      delete userToReturn.password;

      res.status(200).json(userToReturn);
    } else {
      generateServerErrorCode(
        res,
        403,
        "erreur d'enregistrement par e-mail",
        "L'UTILISATEUR EXISTE DÉJÀ"
      );
    }
  } catch (e) {
    generateServerErrorCode(
      res,
      500,
      e,
      "Quelque chose ne s'est pas bien passé"
    );
  }
};

export const LoginPassport = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await myDataSource
      .getRepository(User)
      .findOneBy({ email: email });
    if (user && user.email) {
      if (await bcryptjs.compare(password, user.password)) {
        // Sign token
        const accessToken = sign({ user: user.id }, config.jwt.accessToken, {
          expiresIn: 10000000,
        });
        const refreshToken = sign({ user: user.id }, "refresh_secret", {
          expiresIn: 24 * 60 * 60,
        });
        res.cookie("token", accessToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, //equivalent to 1 day
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000, //equivalent to 7 days
        });
        const userToReturn = { ...user, ...{ accessToken } };

        // delete userToReturn.password;

        res.status(200).json(userToReturn);
      } else {
        generateServerErrorCode(
          res,
          403,
          "login password error",
          "login password error"
        );
      }
    } else {
      generateServerErrorCode(
        res,
        404,
        "login email error",
        "USER_DOES_NOT_EXIST"
      );
    }
  } catch (error) {
    return generateServerErrorCode(
      res,
      404,
      "login email error",
      "USER_DOES_NOT_EXIST"
    );
  }
};

export const AuthenticatedUser = async (req: Request, res: Response) => {
  try {
    // console.log(req.cookies);
    const accessToken = req.cookies["accessToken"];
    const payload: any = verify(accessToken, "access_secret");
    if (!payload) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const user = await myDataSource.getRepository(User).findOne({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const { password, ...data } = user;
    res.send(data);
  } catch (e) {
    // console.log(e)
    return res.status(401).send({
      message: "Unauthenticated",
    });
  }
};

export const Refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies["refreshToken"];

    const payload: any = verify(refreshToken, config.jwt.refreshToken);

    if (!payload) {
      return res.status(401).send({
        message: "unauthenticated",
      });
    }

    const accessToken = sign(
      {
        user: payload.user,
      },
      "access_secret",
      { expiresIn: 60 * 60 }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, //equivalent to 1 day
    });

    res.send({
      message: "success",
    });
  } catch (e) {
    return res.status(401).send({
      message: "unauthenticated",
    });
  }
};

export const verifyAuth = async (req: Request, res: Response) => {
  try {
    const api_token = req.body["api_token"];

    const payload: any = verify(api_token, config.jwt.accessToken);

    if (!payload) {
      return res.status(401).send({
        message: "unauthenticated",
      });
    }

    res.status(200).send({
      message: "success",
    });
  } catch (e) {
    return res.status(401).send({
      message: "unauthenticated",
    });
  }
};

export const Logout = async (req: Request, res: Response) => {
  // journaux de connexion/ deconnexion
  const journal = new JournalConnexion();
  if (typeof req.query.userId === "string") {
    journal.entityId = req.query.userId;
  }
  if (typeof req.query.userName === "string") {
    journal.userName = req.query.userName;
  }
  journal.action = "Déconnexion";
  myDataSource.getRepository(JournalConnexion).save(journal);

  res.cookie("accessToken", "", { maxAge: 0 });
  res.cookie("refreshToken", "", { maxAge: 0 });
  res.status(200).json({ message: "Vous etes deconnecté" });
};

