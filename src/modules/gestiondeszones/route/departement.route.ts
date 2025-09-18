import * as express from 'express';
import { createDepartement, deleteDepartement, getAllDepartement, getAllDepartements, getDepartement, updateDepartement } from '../controller/departement.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const departementsRoutes =  (router: express.Router) => {
  router.post('/api/departements', checkPermission('AddDepartement'), createDepartement);
  router.get('/api/departements', checkPermission('ListDepartement'), getAllDepartement);
  router.get('/api/all/departements', checkPermission('ListAllDepartements'), getAllDepartements);
  router.get('/api/departements/:id', checkPermission('ViewDepartement'), getDepartement);
  router.delete('/api/departements/:id', checkPermission('DeleteDepartement'), deleteDepartement);
  router.put('/api/departements/:id', checkPermission('EditDepartement'), updateDepartement);
};