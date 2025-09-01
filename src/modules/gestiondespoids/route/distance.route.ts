import * as express from 'express';
import { createDistance, deleteDistance, getAllDistance, getDistance, getDistanceByType, updateDistance } from '../controller/distance.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const distancesRoutes =  (router: express.Router) => {
  router.post('/api/distances', checkPermission('AddDistance'), createDistance);
  router.get('/api/distances', checkPermission('ListDistance'), getAllDistance);
  router.get('/api/distance/type/:id', checkPermission('ListDistance'), getDistanceByType);
  router.get('/api/distances/:id', checkPermission('ViewDistance'),getDistance);
  router.delete('/api/distances/:id', checkPermission('DeleteDistance'), deleteDistance);
  router.put('/api/distances/:id', checkPermission('EditDistance'), updateDistance);
};