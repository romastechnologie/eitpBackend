import * as express from 'express';
import { createEtudiant, deleteEtudiant, getAllEtudiant, getEtudiant, updateEtudiant } from '../controller/etudiant.controller';
// import { checkPermission } from '../../../middlewares/auth.middleware';
 
// export  const etudiantsRoutes =  (router: express.Router) => {
//   router.post('/api/etudiants',checkPermission('AddEtudiant'), createEtudiant);
//   router.get('/api/etudiants',checkPermission('ListEtudiant'), getAllEtudiant);
//   router.get('/api/etudiants/:id',checkPermission('ViewEtudiant'), getEtudiant);
//   router.delete('/api/etudiants/:id',checkPermission('DeleteEtudiant'),deleteEtudiant);
//   router.put('/api/etudiants/:id',checkPermission('EditEtudiant'), updateEtudiant);

export  const etudiantsRoutes =  (router: express.Router) => {
  router.post('/api/etudiants', createEtudiant);
  router.get('/api/etudiants', getAllEtudiant);
  router.get('/api/etudiants/:id', getEtudiant);
  router.delete('/api/etudiants/:id', deleteEtudiant);
  router.put('/api/etudiants/:id', updateEtudiant);

};