import * as express from 'express';
import { createQuartier, deleteQuartier, getAllQuartier, getAllQuartiers, getQuartier, getQuartierByArrondissement, getQuartiers, updateQuartier } from '../controller/quartier.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const quartiersRoutes =  (router: express.Router) => {
  router.post('/api/quartiers', checkPermission('AddQuartier'), createQuartier);
  router.get('/api/all/quartiers', checkPermission('ListAllQuartiers'), getAllQuartiers);
  router.get('/api/quartiers', checkPermission('ListQuartier'), getAllQuartier);
  router.get('/api/quartiers/:id', checkPermission('ViewQuartier'), getQuartier);
  router.get('/api/arrondissements/quartiers/:id', checkPermission('ViewQuartierByArrondissement'), getQuartierByArrondissement);
  router.delete('/api/quartiers/:id', checkPermission('DeleteQuartier'), deleteQuartier);
  router.get('/api/zone/quartiers/:key', getQuartiers);
  router.put('/api/quartiers/:id', checkPermission('EditQuartier'), updateQuartier);
};