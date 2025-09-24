import * as express from 'express';
import { createInscription, deleteInscription, getAllInscription, getAllInscriptions, getInscription, updateInscription } from '../controller/inscription.controller';
import { listen } from '../../../configs/uploads';

export  const inscriptionsRoutes =  (router: express.Router) => {
  // router.post('/api/inscriptions',checkPermission('AddInscription'), createInscription);
  // router.get('/api/inscriptions',checkPermission('ListInscription'), getAllInscription);
  // router.get('/api/all/inscriptions',checkPermission('ListAllInscription'), getAllInscriptions);
  // router.get('/api/inscriptions/:id',checkPermission('ViewInscription'), getInscription);
  // router.delete('/api/inscriptions/:id',checkPermission('DeleteInscription'),deleteInscription);
  // router.put('/api/inscriptions/:id',checkPermission('EditInscription'), updateInscription);


  //router.post('/api/inscriptions',listen.fields({name:"images",maxCount:100}), createInscription);
  router.post('/api/inscriptions', createInscription);
  router.get('/api/inscriptions', getAllInscription);
  router.get('/api/all/inscriptions', getAllInscriptions);
  router.get('/api/inscriptions/:id', getInscription);
  router.delete('/api/inscriptions/:id',deleteInscription);
  router.put('/api/inscriptions/:id',updateInscription);

};