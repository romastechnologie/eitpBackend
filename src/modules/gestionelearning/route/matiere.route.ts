import * as express from 'express';
import { createMatiere, deleteMatiere, getAllMatiere, getAllMatieres, getMatiere, updateMatiere } from '../controller/matiere.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const matieresRoutes =  (router: express.Router) => {
  router.post('/api/matieres',checkPermission('AddMatiere'), createMatiere);
  router.get('/api/matieres',checkPermission('ListMatiere'), getAllMatiere);
  router.get('/api/all/matieres',  getAllMatieres);
  router.get('/api/matieres/:id',checkPermission('ViewMatiere'), getMatiere);
  router.delete('/api/matieres/:id',checkPermission('DeleteMatiere'),deleteMatiere);
  router.put('/api/matieres/:id',checkPermission('EditMatiere'), updateMatiere);
};