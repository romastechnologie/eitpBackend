import * as express from 'express';
import { createParent, deleteParent, getAllParent, getAllParents, getParent, updateParent } from '../controller/parent.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const parentsRoutes =  (router: express.Router) => {
  // router.post('/api/parents',checkPermission('AddParent'), createParent);
  // router.get('/api/parents',checkPermission('ListParent'), getAllParent);
  // router.get('/api/parents/:id',checkPermission('ViewParent'), getParent);
  // router.delete('/api/parents/:id',checkPermission('DeleteParent'),deleteParent);
  // router.put('/api/parents/:id',checkPermission('EditParent'), updateParent);


  router.post('/api/parents', createParent);
  router.get('/api/parents',getAllParent);
  router.get('/api/all/parents',getAllParents);
  router.get('/api/parents/:id',getParent);
  router.delete('/api/parents/:id',deleteParent);
  router.put('/api/parents/:id', updateParent);


};