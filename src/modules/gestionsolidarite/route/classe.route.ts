import * as express from 'express';

import { checkPermission } from '../../../middlewares/auth.middleware';
import { createClasse, deleteClasse, getAllClasse, getAllClasses, getClasse, updateClasse } from '../controller.ts/classe.controller';

export const classesRoutes = (router: express.Router) => {
  // router.post('/api/classes', checkPermission('AddClasse'), createClasse);
  // router.get('/api/classes', checkPermission('ListClasse'), getAllClasse);
  // router.get('/api/all/classes', checkPermission('ListAllClasse'), getAllClassex);
  // router.get('/api/classes/:id', checkPermission('ViewClasse'), getClasse);
  // router.delete('/api/classes/:id', checkPermission('DeleteClasse'), deleteClasse);
  // router.put('/api/classes/:id', checkPermission('EditClasse'), updateClasse);


  router.post('/api/classes', createClasse);
  router.get('/api/classes', getAllClasse);
  router.get('/api/all/classes', getAllClasses);
  router.get('/api/classes/:id', getClasse);
  router.delete('/api/classes/:id', deleteClasse);
  router.put('/api/classes/:id', updateClasse);


};