import * as express from 'express';
import { createApropos, deleteApropos, getAllApropos, getApropos, updateApropos, activeApropos, getAproposByStatus} from '../controller/apropos.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';
import { listen, upload } from '../../../configs/uploads';
const  uploadMiddleware  = require('../../../configs/manyUploads');

export  const aproposRoutes =  (router: express.Router) => {
  //router.post('/api/apropos', createApropos);
  //router.post('/api/apropos',checkPermission('AddApropos'),uploadMiddleware, createApropos);
  router.post('/api/apropos',checkPermission('AddApropos'),listen.fields([{ name: 'urlImage', maxCount: 1 },{ name: 'organigramme', maxCount: 1 }]), createApropos);
  router.get('/api/apropos',checkPermission('ListApropos'), getAllApropos);
  router.get('/api/apropos/:id',checkPermission('ViewApropos'), getApropos);
  //router.get('/api/apropos/statut/1',checkPermission('ViewAproposByStatus'),getAproposByStatus);
  router.put('/api/apropos/:id',checkPermission('EditApropos'),listen.fields([{ name: 'urlImage', maxCount: 1 },{ name: 'organigramme', maxCount: 1 }]), updateApropos);
  router.delete('/api/apropos/:id',checkPermission('DeleteApropos'),deleteApropos);
  router.put('/api/active/apropos/:id', checkPermission('ActiveApropos'), activeApropos);
  //router.put('/api/apropos/:id', updateVisite);
  //router.get('/api/uniqueVisitorCount', getVisit);
};