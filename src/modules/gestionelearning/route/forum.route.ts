import * as express from 'express';
import { createForum, deleteForum, getAllForum, getForum, updateForum } from '../controller/forum.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const forumsRoutes =  (router: express.Router) => {
  router.post('/api/forums',checkPermission('AddForum'), createForum);
  router.get('/api/forums',checkPermission('ListForum'), getAllForum);
  router.get('/api/forums/:id',checkPermission('ViewForum'), getForum);
  router.delete('/api/forums/:id',checkPermission('DeleteForum'),deleteForum);
  router.put('/api/forums/:id',checkPermission('EditForum'), updateForum);
};