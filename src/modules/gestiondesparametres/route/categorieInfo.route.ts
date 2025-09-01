import * as express from 'express';
import { createCategorieInfo, deleteCategorieInfo, getAllCategorieInfo, getCategorieInfo, updateCategorieInfo } from '../controller/categorieInfo.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const categorieInfosRoutes =  (router: express.Router) => {
  router.post('/api/categorieInfos',checkPermission('AddCategorieInfo'), createCategorieInfo);
  router.get('/api/categorieInfos',checkPermission('ListCategorieInfo'), getAllCategorieInfo);
  router.get('/api/categorieInfos/:id',checkPermission('ViewCategorieInfo'), getCategorieInfo);
  router.delete('/api/categorieInfos/:id',checkPermission('DeleteCategorieInfo'),deleteCategorieInfo);
  router.put('/api/categorieInfos/:id',checkPermission('EditCategorieInfo'), updateCategorieInfo);
};