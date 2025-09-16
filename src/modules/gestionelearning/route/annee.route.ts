import * as express from 'express';
import { createAnneeAcademique, deleteAnneeAcademique, getAllAnneeAcademique, getAllAnneeAcademiques, getAnneeAcademique, updateAnneeAcademique } from '../controller/annee.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const anneesRoutes =  (router: express.Router) => {
  router.post('/api/annees',checkPermission('AddAnneeAcademique'), createAnneeAcademique);
  router.get('/api/annees',checkPermission('ListAnneeAcademique'), getAllAnneeAcademique);
  router.get('/api/all/annees',checkPermission('ListAllAnneeAcademique'), getAllAnneeAcademiques);
  router.get('/api/annees/:id',checkPermission('ViewAnneeAcademique'), getAnneeAcademique);
  router.delete('/api/annees/:id',checkPermission('DeleteAnneeAcademique'),deleteAnneeAcademique);
  router.put('/api/annees/:id',checkPermission('EditAnneeAcademique'), updateAnneeAcademique);

  // router.post('/api/annees', createAnneeAcademique);
  // router.get('/api/annees', getAllAnneeAcademique);
  // router.get('/api/all/annees', getAllAnneeAcademiques);
  // router.get('/api/annees/:id', getAnneeAcademique);
  // router.delete('/api/annees/:id',deleteAnneeAcademique);
  // router.put('/api/annees/:id',updateAnneeAcademique);

};