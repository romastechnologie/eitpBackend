import * as express from 'express';

import { checkPermission } from '../../../middlewares/auth.middleware';
import { createCategorieOffre, deleteCategorieOffre, getAllCategorieOffre, getAllCategorieOffres, getCategorieOffre, updateCategorieOffre } from '../controller.ts/categorieOffre.controller';

export const categorieOffresRoutes = (router: express.Router) => {
  // router.post('/api/categorieOffres', checkPermission('AddCategorieOffre'), createCategorieOffre);
  // router.get('/api/categorieOffres', checkPermission('ListCategorieOffre'), getAllCategorieOffre);
  // router.get('/api/all/categorieOffres', checkPermission('ListAllCategorieOffre'), getAllCategorieOffrex);
  // router.get('/api/categorieOffres/:id', checkPermission('ViewCategorieOffre'), getCategorieOffre);
  // router.delete('/api/categorieOffres/:id', checkPermission('DeleteCategorieOffre'), deleteCategorieOffre);
  // router.put('/api/categorieOffres/:id', checkPermission('EditCategorieOffre'), updateCategorieOffre);


  router.post('/api/categorieOffres', createCategorieOffre);
  router.get('/api/categorieOffres', getAllCategorieOffre);
  router.get('/api/all/categorieOffres', getAllCategorieOffres);
  router.get('/api/categorieOffres/:id', getCategorieOffre);
  router.delete('/api/categorieOffres/:id', deleteCategorieOffre);
  router.put('/api/categorieOffres/:id', updateCategorieOffre);


};