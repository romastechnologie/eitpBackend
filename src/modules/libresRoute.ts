import * as express from "express";
import {
  countVisiteur,
  getAllAlaUne,
  getNbVisiteurs,
} from "./gestiondesarticles/controller/alaUne.controller";
import {
  getAllArticle,
  getAllMediaInArticle,
  getArticle,
  getArticles,
  getTreeArticle,
  getAllArticleAlaUne,
  previewArticle,
  getAllMediaInArticlePreview,
} from "./gestiondesarticles/controller/article.controller";
import { getAproposByStatus } from "./gestiondesparametres/controller/apropos.controller";
import {
  getAllCategorieArticle,
  getAllCategorieArticleChild,
} from "./gestiondesarticles/controller/categorieArticle.controller";
import {
  getAllFaq,
  getAllFaqByCategorie,
  getFaqByCat,
  getFaqByTag,
  getFaqByTagOnly,
} from "./gestiondesfaqs/controller/faq.controller";
import { createContact } from "./gestiondescontactsSMS/controller/contact.controller";
import { getAllParametres } from "./gestiondesparametres/controller/parametre.controller";
import {
  getAllFaqTag,
  getAllTag,
} from "./gestiondesfaqs/controller/tag.controller";
import {
  getAllCommune,
 
} from "./gestiondeszones/controller/commune.controller";

import { getDistanceByType } from "./gestiondespoids/controller/distance.controller";
import { montantEstimation } from "./gestiondespoids/controller/montant.controller";
import { getAllCategorieFaq } from "./gestiondesfaqs/controller/categorieFaq.controller";
import { getAllIntervallePoidsDistance } from "./gestiondespoids/controller/intervallePoids.controller";
import { verifyMailAdress } from "./gestiondesutilisateurs/controller/auth.controller";
import { createNewsletters } from "./gestiondesnewsletters/controller/newsletters.controller";
import { createContactUser, getAllContactsUser } from "./gestiondesutilisateurs/controller/contactUser.controller";

export const LibreRoutes = (router: express.Router) => {
  

  



  //##### REFONTE #####
  //AlaUne
  router.get("/api/alaUnes", getAllAlaUne);
  router.get("/api/distance/type/:id", getDistanceByType);
  router.post("/api/montantEstimations", montantEstimation);

  router.post("/api/create/contact/user",createContactUser)
  router.get("/api/create/contact/user",getAllContactsUser)

  //Articles
  router.get("/api/articles", getAllArticle);
  router.get("/api/tree/articles/:categorieId", getTreeArticle);
  router.get("/api/alaUne/articles/:categorieId", getAllArticleAlaUne);
  router.get("/api/actualite/articles/:categorieId", getArticles);
  router.get("/api/articles/medias/:id", getAllMediaInArticle);
  router.get("/api/articles/:id", getArticle);

  //Categorie Articles
  router.get("/api/categorieArticleChilds", getAllCategorieArticleChild);
  router.get("/api/categorieArticles", getAllCategorieArticle);
  router.get("/api/faqs/:categorieId", getAllFaqByCategorie);
  router.get("/api/tagforfaqs/:id", getFaqByTagOnly);
  router.get("/api/categories/faqs/:id", getFaqByCat);
  router.get("/api/tags/faqs/:id", getFaqByTag);
  router.get("/api/categorieFaqs", getAllCategorieFaq);
  router.get("/api/faqtags", getAllFaqTag);
  //A propos
  router.get("/api/apropos/statut/1", getAproposByStatus);

  //faq
  router.get("/api/faqs", getAllFaq);

  //tag
  router.get("/api/tags", getAllTag);

  //Contact
  router.post("/api/contacts", createContact);

  //Parametres
  router.get("/api/parametres", getAllParametres);


  //commune
  router.get("/api/communes", getAllCommune);
  

  
  router.get("/api/preview/article/:alias", previewArticle);
  router.get("/api/previewarticle/medias/:alias", getAllMediaInArticlePreview);

  router.post("/api/newsletters", createNewsletters);

  router.get(
    "/api/poidsDistanceMontants/:dtype/:ptype",
    getAllIntervallePoidsDistance
  );

  // nb visiteur
  router.post("/api/visitors", countVisiteur);
  router.get("/api/visiteurs", getNbVisiteurs);

  //verificatinon d'email
  router.get("/api/verify/mail/:token", verifyMailAdress);
};
