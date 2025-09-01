import * as express from 'express';
import { createTypeMedia, deleteTypeMedia, getAllTypeMedia, getTypeMedia, updateTypeMedia } from '../controller/typeMedia.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const typesMediasRoutes =  (router: express.Router) => {
  router.post('/api/typesMedias',checkPermission('AddTypeMedia'), createTypeMedia);
  router.get('/api/typesMedias',checkPermission('ListTypeMedia'), getAllTypeMedia);
  router.get('/api/typesMedias/:id',checkPermission('ViewTypeMedia'), getTypeMedia);
  router.delete('/api/typesMedias/:id',checkPermission('DeleteTypeMedia'),deleteTypeMedia);
  router.put('/api/typesMedias/:id',checkPermission('EditTypeMedia'), updateTypeMedia);
};