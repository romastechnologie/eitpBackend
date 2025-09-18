import * as express from 'express';
import { createCommune, deleteCommune, getAllCommune, getAllCommunes, getCommune, getCommuneByDepartement, updateCommune } from '../controller/commune.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const communesRoutes =  (router: express.Router) => {
  router.post('/api/communes', checkPermission('AddCommune'), createCommune);
  router.get('/api/communes', checkPermission('ListCommune'), getAllCommune);
  router.get('/api/all/communes', checkPermission('ListAllCommunes'), getAllCommunes);
  router.get('/api/communes/:id', checkPermission('ViewCommune'), getCommune);
  router.get('/api/departements/communes/:id', checkPermission('ViewCommuneByDepartement'), getCommuneByDepartement);
  router.delete('/api/communes/:id', checkPermission('DeleteCommune'), deleteCommune);
  router.put('/api/communes/:id', checkPermission('EditCommune'), updateCommune);
};