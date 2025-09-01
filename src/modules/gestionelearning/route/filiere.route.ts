import * as express from 'express';
import { createFiliere, deleteFiliere, getAllFiliere, getFiliere, updateFiliere } from '../controller/filiere.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const filieresRoutes =  (router: express.Router) => {
  router.post('/api/filieres',checkPermission('AddFiliere'), createFiliere);
  router.get('/api/filieres',checkPermission('ListFiliere'), getAllFiliere);
  router.get('/api/filieres/:id',checkPermission('ViewFiliere'), getFiliere);
  router.delete('/api/filieres/:id',checkPermission('DeleteFiliere'),deleteFiliere);
  router.put('/api/filieres/:id',checkPermission('EditFiliere'), updateFiliere);
};