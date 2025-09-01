import * as express from 'express';
import { createReponse, deleteReponse, getAllReponse, getReponse, updateReponse } from '../controller/reponse.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const reponsesRoutes =  (router: express.Router) => {
  router.post('/api/reponses',checkPermission('AddReponse'), createReponse);
  router.get('/api/reponses',checkPermission('ListReponse'), getAllReponse);
  router.get('/api/reponses/:id',checkPermission('ViewReponse'), getReponse);
  router.delete('/api/reponses/:id',checkPermission('DeleteReponse'),deleteReponse);
  router.put('/api/reponses/:id',checkPermission('EditReponse'), updateReponse);
};