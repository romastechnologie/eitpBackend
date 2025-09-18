import * as express from 'express';
import { createProfesseur, deleteProfesseur, getAllProfesseur, getAllProfesseurs, getProfesseur, getProfesseursByMatiere, updateProfesseur } from '../controller/professeur.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const professeursRoutes =  (router: express.Router) => {
  // router.post('/api/professeurs',checkPermission('AddProfesseur'), createProfesseur);
  // router.get('/api/all/professeurs',checkPermission('ListProfesseur'), getAllProfesseur);
  // router.get('/api/professeurs',checkPermission('ListAllProfesseur'), getAllProfesseurs);
  // router.get('/api/professeurs/:id',checkPermission('ViewProfesseur'), getProfesseur);
  // router.delete('/api/professeurs/:id',checkPermission('DeleteProfesseur'),deleteProfesseur);
  // router.put('/api/professeurs/:id',checkPermission('EditProfesseur'), updateProfesseur);

  router.post('/api/professeurs', createProfesseur);
  router.get('/api/all/professeurs',getAllProfesseur);
  router.get('/api/professeurs', getAllProfesseurs);
  router.get('/api/professeurs/:id',getProfesseur);
  router.get('/api/professeurs/matiere/:matiereId', getProfesseursByMatiere);
  router.delete('/api/professeurs/:id',deleteProfesseur);
  router.put('/api/professeurs/:id', updateProfesseur);


};