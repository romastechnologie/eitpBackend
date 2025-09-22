import * as express from 'express';
import { createArrondissement, deleteArrondissement, getAllArrondissement, getAllArrondissements, getArrondissement, getArrondissementByCommune, updateArrondissement } from '../controller/arrondissement.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const arrondissementsRoutes =  (router: express.Router) => {
  // router.post('/api/arrondissements',checkPermission('AddArrondissement'), createArrondissement);
  // router.get('/api/all/arrondissements', checkPermission('ListAllArrondissement'), getAllArrondissements);
  // router.get('/api/arrondissements', checkPermission('ListArrondissement'), getAllArrondissement);
  // router.get('/api/arrondissements/:id', checkPermission('ViewArrondissement'), getArrondissement);
  // router.get('/api/communes/arrondissements/:id', checkPermission('ViewArrondissementByCommune'), getArrondissementByCommune);
  // router.delete('/api/arrondissements/:id', checkPermission('DeleteArrondissement'), deleteArrondissement);
  // router.put('/api/arrondissements/:id', checkPermission('EditArrondissement'), updateArrondissement);

 router.post('/api/arrondissements', createArrondissement);
  router.get('/api/all/arrondissements',  getAllArrondissements);
  router.get('/api/arrondissements',  getAllArrondissement);
  router.get('/api/arrondissements/:id',  getArrondissement);
  router.get('/api/communes/arrondissements/:id', getArrondissementByCommune);
  router.delete('/api/arrondissements/:id', deleteArrondissement);
  router.put('/api/arrondissements/:id',updateArrondissement);


};
