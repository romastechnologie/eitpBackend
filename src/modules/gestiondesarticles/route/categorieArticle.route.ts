import * as express from 'express';
import { createCategorieArticle, deleteCategorieArticle, getAllCategorieArticle, getAllCategorieArticleChild, getCategorieArticle, updateCategorieArticle } from '../controller/categorieArticle.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';
import { listen } from '../../../configs/uploads';

export  const categorieArticlesRoutes =  (router: express.Router) => {
  router.post('/api/categorieArticles',checkPermission('AddCategorieArticle'),listen.fields([{ name: 'urlImage', maxCount: 1 }]), createCategorieArticle);
  router.get('/api/categorieArticles',checkPermission('ListCategorieArticle'), getAllCategorieArticle);
  router.get('/api/categorieArticles/:id',checkPermission('ViewCategorieArticle'),getCategorieArticle );
  //router.get('/api/categorieArticleChilds',checkPermission('ListCategorieArticleChild'),getAllCategorieArticleChild );
  router.put('/api/categorieArticles/:id',checkPermission('EditCategorieArticle'),listen.fields([{ name: 'urlImage', maxCount: 1 }]), updateCategorieArticle);
  router.delete('/api/categorieArticles/:id',checkPermission('DeleteCategorieArticle'),deleteCategorieArticle);
};