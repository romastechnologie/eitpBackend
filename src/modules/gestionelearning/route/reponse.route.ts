import * as express from 'express';
import { createReponse, deleteReponse, getAllReponses, getReponse, updateReponse, getReponsesByProposition, getResultsByQuestion } from '../controller/reponse.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export const reponseSondageRoutes = (router: express.Router) => {
  router.post('/api/reponses', checkPermission('AddReponse'), createReponse);
  router.get('/api/reponses', checkPermission('ListReponse'), getAllReponses);
  router.get('/api/reponses/:id', checkPermission('ViewReponse'), getReponse);
  router.put('/api/reponses/:id', checkPermission('EditReponse'), updateReponse);
  router.delete('/api/reponses/:id', checkPermission('DeleteReponse'), deleteReponse);
  router.get('/api/propositions/:id/reponses', checkPermission('ViewReponsesByProposition'), getReponsesByProposition);
  router.get('/api/questions/:questionId/results', getResultsByQuestion);
 
};