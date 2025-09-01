import * as express from 'express';
import { createAlaUne, deleteAlaUne, getAlaUne, getAllAlaUne, updateAlaUne } from '../controller/alaUne.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';
import { listen } from '../../../configs/uploads';

export  const alaUneRoutes =  (router: express.Router) => {
  router.post('/api/alaUnes',checkPermission('AddAlaUne'),listen.fields([{ name: 'urlImage', maxCount: 1 }]), createAlaUne);
  //router.get('/api/alaUnes',checkPermission('ListAlaUne'), getAllAlaUne);
  router.get('/api/alaUnes/:id',checkPermission('ViewAlaUne'), getAlaUne);
  router.delete('/api/alaUnes/:id',checkPermission('DeleteAlaUne'),deleteAlaUne);
  router.put('/api/alaUnes/:id',checkPermission('EditAlaUne'),listen.fields([{ name: 'urlImage', maxCount: 1 }]), updateAlaUne);
};