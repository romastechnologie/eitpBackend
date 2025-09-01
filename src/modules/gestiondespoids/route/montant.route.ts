import * as express from 'express';
import { createMontant, deleteMontant, getAllMontant, getMontant, montantEstimation, updateMontant } from '../controller/montant.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const montantsRoutes =  (router: express.Router) => {
  router.post('/api/montants',checkPermission('AddMontant'), createMontant);
  //router.post('/api/montantEstimations', montantEstimation);
  router.get('/api/montants', checkPermission('ListMontant'),getAllMontant);
  router.get('/api/montants/:id', checkPermission('ViewMontant'),getMontant);
  router.delete('/api/montants/:id',checkPermission('DeleteMontant'), deleteMontant);
  router.put('/api/montants/:id',checkPermission('EditMontant'),  updateMontant);
};