import * as express from 'express';
import { createOffre, deleteOffre, getAllOffre, getAllOffres, getOffre, updateOffre } from '../controller.ts/offre.controller';


export const offresRoutes = (router: express.Router) => {
  // router.post('/api/offres', checkPermission('AddOffre'), createOffre);
  // router.get('/api/offres', checkPermission('ListOffre'), getAllOffre);
  // router.get('/api/all/offres', checkPermission('ListAllOffre'), getAllOffrex);
  // router.get('/api/offres/:id', checkPermission('ViewOffre'), getOffre);
  // router.delete('/api/offres/:id', checkPermission('DeleteOffre'), deleteOffre);
  // router.put('/api/offres/:id', checkPermission('EditOffre'), updateOffre);


  router.post('/api/offres', createOffre);
  router.get('/api/offres', getAllOffre);
  router.get('/api/all/offres', getAllOffres);
  router.get('/api/offres/:id', getOffre);
  router.delete('/api/offres/:id', deleteOffre);
  router.put('/api/offres/:id', updateOffre);


};