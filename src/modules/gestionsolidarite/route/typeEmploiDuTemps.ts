import * as express from 'express';
import { createTypeEmploiDuTemps, deleteTypeEmploiDuTemps, getAllTypeEmploiDuTemp, getAllTypeEmploiDuTemps, getTypeEmploiDuTemps, updateTypeEmploiDuTemps } from '../controller.ts/typeEmploiDuTemps.controller';


export const typeEmploiDuTempsRoutes = (router: express.Router) => {
  // router.post('/api/typeEmploiDuTemps', checkPermission('AddTypeEmploiDuTemps'), createTypeEmploiDuTemps);
  // router.get('/api/typeEmploiDuTemps', checkPermission('ListTypeEmploiDuTemps'), getAllTypeEmploiDuTemps);
  // router.get('/api/all/typeEmploiDuTemps', checkPermission('ListAllTypeEmploiDuTemps'), getAllTypeEmploiDuTempsx);
  // router.get('/api/typeEmploiDuTemps/:id', checkPermission('ViewTypeEmploiDuTemps'), getTypeEmploiDuTemps);
  // router.delete('/api/typeEmploiDuTemps/:id', checkPermission('DeleteTypeEmploiDuTemps'), deleteTypeEmploiDuTemps);
  // router.put('/api/typeEmploiDuTemps/:id', checkPermission('EditTypeEmploiDuTemps'), updateTypeEmploiDuTemps);


  router.post('/api/typeEmploiDuTemps', createTypeEmploiDuTemps);
  router.get('/api/typeEmploiDuTemps', getAllTypeEmploiDuTemps);
  router.get('/api/all/typeEmploiDuTemps', getAllTypeEmploiDuTemp);
  router.get('/api/typeEmploiDuTemps/:id', getTypeEmploiDuTemps);
  router.delete('/api/typeEmploiDuTemps/:id', deleteTypeEmploiDuTemps);
  router.put('/api/typeEmploiDuTemps/:id', updateTypeEmploiDuTemps);


};