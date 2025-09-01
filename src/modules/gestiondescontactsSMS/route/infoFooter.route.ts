import * as express from 'express';
import { checkPermission } from '../../../middlewares/auth.middleware';
import { listen, upload } from '../../../configs/uploads';
import { activeInfoFooter, createInfoFooter, deleteInfoFooter, getAllInfoFooter, getInfoFooter, getInfoFooterByStatus, updateInfoFooter } from '../controller/infoFooter.controller';
const  uploadMiddleware  = require('../../../configs/manyUploads');

export  const infoFooterRoutes =  (router: express.Router) => {
  router.post('/api/infoFooter', checkPermission('AddInfoFooter'),createInfoFooter);
  router.get('/api/infoFooter',checkPermission('ListInfoFooter'), getAllInfoFooter);
  router.get('/api/infoFooter/:id',checkPermission('ViewInfoFooter'), getInfoFooter);
  router.get('/api/infoFooter/statut/1',checkPermission('ViewInfoFooterByStatus'),getInfoFooterByStatus);
  router.put('/api/infoFooter/:id',checkPermission('UpdateInfoFooter'), updateInfoFooter);
  router.delete('/api/infoFooter/:id',checkPermission('DeleteInfoFooter'),deleteInfoFooter);
  router.put('/api/active/infoFooter/:id',checkPermission('ActiveInfoFooter'), activeInfoFooter);
};