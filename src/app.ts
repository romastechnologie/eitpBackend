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
import { questionsRoutes } from "./modules/gestionelearning/route/question.route";
import { reponseRoutes } from "./modules/gestionelearning/route/reponse.route";
import { propositionReponseRoutes } from "./modules/gestionelearning/route/propositionreponse.route";
import { niveauxRoutes } from "./modules/gestionelearning/route/niveau.route";
import { typeEmploiDuTempsRoutes } from "./modules/gestionsolidarite/route/typeEmploiDuTemps.route";
import { qualificationsRoutes } from "./modules/gestionsolidarite/route/qualification.route";
import { languesRoutes } from "./modules/gestionsolidarite/route/langue.route";
import { activitesRoutes } from "./modules/gestionsolidarite/route/activite.route";
import { classesRoutes } from "./modules/gestionsolidarite/route/classe.route";
import { categorieOffresRoutes } from "./modules/gestionsolidarite/route/categorieOffre.route";
import { filiereNiveauMatieresRoutes } from "./modules/gestionelearning/route/filiereniveaumatiere.route";
import { offresRoutes } from "./modules/gestionsolidarite/route/offre.route";
import { piecesRoutes } from "./modules/gestionelearning/route/piece.route";
import { typePiecesRoutes } from "./modules/gestionelearning/route/typepiece.route";
import { parentsRoutes } from "./modules/gestionelearning/route/parent.route";
import { inscriptionsRoutes } from "./modules/gestionelearning/route/inscription.route";
import { emploisDuTempsRoutes } from "./modules/gestionsolidarite/route/emploidutemps.route";
import { arrondissementsRoutes } from "./modules/gestiondeszones/route/arrondissement.route";
import { quartiersRoutes } from "./modules/gestiondeszones/route/quartier.route";
import { departementsRoutes } from "./modules/gestiondeszones/route/departement.route";



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
      "http://localhost:5173"

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
categorieOffresRoutes(app);
activitesRoutes(app);
offresRoutes(app);
communesRoutes(app);
emploisDuTempsRoutes(app);
professeursRoutes(app);

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

infoFooterRoutes(app);

//elearning
anneesRoutes(app);
compositionsRoutes(app);
etudiantsRoutes(app);
filieresRoutes(app);
forumsRoutes(app);
matieresRoutes(app);
// professeursRoutes(app);
questionsRoutes(app);
reponseRoutes(app);
propositionReponseRoutes(app);
niveauxRoutes(app);
filiereNiveauMatieresRoutes(app);
piecesRoutes(app);
typePiecesRoutes(app);
parentsRoutes(app);

//solidarité
typeEmploiDuTempsRoutes(app);
// emploisDuTempsRoutes(app);
qualificationsRoutes(app);
languesRoutes(app);

classesRoutes(app);

inscriptionsRoutes(app);

//zones
arrondissementsRoutes(app);
communesRoutes(app);
quartiersRoutes(app);
departementsRoutes(app);



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
