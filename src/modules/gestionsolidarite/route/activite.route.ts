import * as express from 'express';
import { createActivite, deleteActivite, getActivite, getAllActivite, getAllActivites, updateActivite } from '../controller.ts/activite.controller';



export const activitesRoutes = (router: express.Router) => {
  // router.post('/api/activites', checkPermission('AddActivite'), createActivite);
  // router.get('/api/activites', checkPermission('ListActivite'), getAllActivite);
  // router.get('/api/all/activites', checkPermission('ListAllActivite'), getAllActivitex);
  // router.get('/api/activites/:id', checkPermission('ViewActivite'), getActivite);
  // router.delete('/api/activites/:id', checkPermission('DeleteActivite'), deleteActivite);
  // router.put('/api/activites/:id', checkPermission('EditActivite'), updateActivite);


  router.post('/api/activites', createActivite);
  router.get('/api/activites', getAllActivite);
  router.get('/api/all/activites', getAllActivites);
  router.get('/api/activites/:id', getActivite);
  router.delete('/api/activites/:id', deleteActivite);
  router.put('/api/activites/:id', updateActivite);


};