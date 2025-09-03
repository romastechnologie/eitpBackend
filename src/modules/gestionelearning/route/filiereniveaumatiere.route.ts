import * as express from 'express';
import { createFiliereNiveauMatiere, deleteFiliereNiveauMatiere, getAllFiliereNiveauMatiere, getAllFiliereNiveauMatieres, getFiliereNiveauMatiere, updateFiliereNiveauMatiere } from '../controller/filiereNiveauMatiere.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export const filiereNiveauMatieresRoutes = (router: express.Router) => {
  // router.post('/api/filiereNiveauMatieres',checkPermission('AddFiliereNiveauMatiere'), createFiliereNiveauMatiere);
  // router.get('/api/filiereNiveauMatieres',checkPermission('ListFiliereNiveauMatiere'), getAllFiliereNiveauMatiere);
  // router.get('/api/all/filiereNiveauMatieres',checkPermission('ListAllFiliereNiveauMatiere'), getAllFiliereNiveauMatieres);
  // router.get('/api/filiereNiveauMatieres/:id',checkPermission('ViewFiliereNiveauMatiere'), getFiliereNiveauMatiere);
  // router.delete('/api/filiereNiveauMatieres/:id',checkPermission('DeleteFiliereNiveauMatiere'),deleteFiliereNiveauMatiere);
  // router.put('/api/filiereNiveauMatieres/:id',checkPermission('EditFiliereNiveauMatiere'), updateFiliereNiveauMatiere);

  router.post('/api/filiereNiveauMatieres', createFiliereNiveauMatiere);
  router.get('/api/filiereNiveauMatieres', getAllFiliereNiveauMatiere);
  router.get('/api/all/filiereNiveauMatieres', getAllFiliereNiveauMatieres);
  router.get('/api/filiereNiveauMatieres/:id', getFiliereNiveauMatiere);
  router.delete('/api/filiereNiveauMatieres/:id', deleteFiliereNiveauMatiere);
  router.put('/api/filiereNiveauMatieres/:id', updateFiliereNiveauMatiere);



};