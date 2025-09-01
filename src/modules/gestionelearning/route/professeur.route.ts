import * as express from 'express';
import { createProfesseur, deleteProfesseur, getAllProfesseur, getProfesseur, updateProfesseur } from '../controller/professeur.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const professeursRoutes =  (router: express.Router) => {
  router.post('/api/professeurs',checkPermission('AddProfesseur'), createProfesseur);
  router.get('/api/professeurs',checkPermission('ListProfesseur'), getAllProfesseur);
  router.get('/api/professeurs/:id',checkPermission('ViewProfesseur'), getProfesseur);
  router.delete('/api/professeurs/:id',checkPermission('DeleteProfesseur'),deleteProfesseur);
  router.put('/api/professeurs/:id',checkPermission('EditProfesseur'), updateProfesseur);
};