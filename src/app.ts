import bodyParser = require("body-parser");
import cookieParser = require("cookie-parser");
import cors = require("cors");
import session from "express-session";

// import * as express from "express";
const express = require("express");

import "dotenv/config";
import { myDataSource } from "./configs/data-source";
import { articlesRoutes } from "./modules/gestiondesarticles/route/article.route";
import { categorieArticlesRoutes } from "./modules/gestiondesarticles/route/categorieArticle.route";
import { typesMediasRoutes } from "./modules/gestiondesarticles/route/typeMedia.route";
import { categorieFaqsRoutes } from "./modules/gestiondesfaqs/route/categorieFaq.route";
import { faqsRoutes } from "./modules/gestiondesfaqs/route/faq.route";
import { tagsRoutes } from "./modules/gestiondesfaqs/route/tag.route";
import { aproposRoutes } from "./modules/gestiondesparametres/route/apropos.route";
import { categorieInfosRoutes } from "./modules/gestiondesparametres/route/categorieInfo.route";
import { parametresRoutes } from "./modules/gestiondesparametres/route/parametre.route";
import { distancesRoutes } from "./modules/gestiondespoids/route/distance.route";
import { intervallePoidsRoutes } from "./modules/gestiondespoids/route/intervallePoids.route";
import { authentication } from "./modules/gestiondesutilisateurs/route/auth.route";
import { montantsRoutes } from "./modules/gestiondespoids/route/montant.route";
import { rolesRoutes } from "./modules/gestiondesutilisateurs/route/role.route";
import { userRoutes } from "./modules/gestiondesutilisateurs/route/user.route";
import { permissionsRoutes } from "./modules/gestiondesutilisateurs/route/permission.route";
import { journalRoutes } from "./modules/gestiondesutilisateurs/route/journal.route";
import { contactsRoutes } from "./modules/gestiondescontactsSMS/route/contact.route";
import { alaUneRoutes } from "./modules/gestiondesarticles/route/aLaUne.route";
import { communesRoutes } from "./modules/gestiondeszones/route/commune.route";
import { infoFooterRoutes } from "./modules/gestiondescontactsSMS/route/infoFooter.route";
import { newslettersRoutes } from "./modules/gestiondesnewsletters/routes/newsletters.route";
import { isAuthenticatedOne } from "./middlewares/auth.middleware";
import { LibreRoutes } from "./modules/libresRoute";
import { anneesRoutes } from "./modules/gestionelearning/route/annee.route";
import { compositionsRoutes } from "./modules/gestionelearning/route/composition.route";
import { etudiantsRoutes } from "./modules/gestionelearning/route/etudiant.route";
import { filieresRoutes } from "./modules/gestionelearning/route/filiere.route";
import { forumsRoutes } from "./modules/gestionelearning/route/forum.route";
import { matieresRoutes } from "./modules/gestionelearning/route/matiere.route";
import { professeursRoutes } from "./modules/gestionelearning/route/professeur.route";

require("dotenv").config();

if (process.env.NODE_ENV !== "prod") {
  //console.log(process.env.NODE_ENV)
}

//Initialisation et connection de la base de donnée
myDataSource
  .initialize()
  .then(() => {
    //  console.log("Data Source has been initialized!")
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

// create and setup express app
const app = express();
app.use(express.json());

//gestion des cookie
app.use(cookieParser());
// app.use(cors({
//   origin: '*'
// }));

//Autoriser les entrés json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Gestion des cors
app.use(
  cors({
    origin: [
      "http://localhost:3006",
      "http://192.168.43.115:8080",
      "http://192.168.43.115:8080",
      "http://localhost:8082",
      "http://localhost:8083",
      "http://localhost:8080",
      "http://localhost:8081",
      "http://137.255.12.34:3006",
      "http://10.208.0.70:3006",
      "https://137.255.12.34:3006",
      "https://10.208.0.70:3006",
      "http://192.168.8.59:8081",
      "http://192.168.8.59:8080",
      "http://localhost:4002",
    ],
    credentials: true,
  })
);

//gestion des fichier static
app.use("/uploads", express.static("uploads"));

//Gestion des visiteurs
app.use(
  session({
    secret: "disnelkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 },
  })
);


LibreRoutes(app);

authentication(app);
app.use(isAuthenticatedOne);
//Articles
articlesRoutes(app);
//CategorieArticle
categorieArticlesRoutes(app);

//typeMedia
typesMediasRoutes(app);

//CategorieFaq
categorieFaqsRoutes(app);

//faq
faqsRoutes(app);

//tag
tagsRoutes(app);

//Apropos
aproposRoutes(app);

//CategorieInfo
categorieInfosRoutes(app);

//parametre
parametresRoutes(app);

//distance
distancesRoutes(app);

//intervallePoids
intervallePoidsRoutes(app);

montantsRoutes(app);

rolesRoutes(app);

userRoutes(app);

permissionsRoutes(app);

journalRoutes(app);

//contact
contactsRoutes(app);

//alaune
alaUneRoutes(app);

//newsletters
newslettersRoutes(app);
communesRoutes(app);
infoFooterRoutes(app);

//elearning
anneesRoutes(app);
compositionsRoutes(app);
etudiantsRoutes(app);
filieresRoutes(app);
forumsRoutes(app);
matieresRoutes(app);
professeursRoutes(app);


//Autorisation des entêtes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(({ res }) => {
  const message =
    "Le projet a bien démarré mais impossible de trouver la ressource demandée! Vous pouvez essayer une autre URL.";
  res.status(404).json({ message });
});

// start express server
app.listen(process.env.PORT_SERVER);
