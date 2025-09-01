import * as express from 'express';
import { createQuestion, deleteQuestion, getAllQuestion, getQuestion, updateQuestion } from '../controller/question.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const questionsRoutes =  (router: express.Router) => {
  router.post('/api/questions',checkPermission('AddQuestion'), createQuestion);
  router.get('/api/questions',checkPermission('ListQuestion'), getAllQuestion);
  router.get('/api/questions/:id',checkPermission('ViewQuestion'), getQuestion);
  router.delete('/api/questions/:id',checkPermission('DeleteQuestion'),deleteQuestion);
  router.put('/api/questions/:id',checkPermission('EditQuestion'), updateQuestion);
};