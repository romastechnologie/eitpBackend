import * as express from 'express';
import { createCategorieFaq, deleteCategorieFaq, getAllCategorieFaq, getCategorieFaq, updateCategorieFaq } from '../controller/categorieFaq.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const categorieFaqsRoutes =  (router: express.Router) => {
  router.post('/api/categorieFaqs',checkPermission('AddCategorieFaq'), createCategorieFaq);
 // router.get('/api/categorieFaqs', checkPermission('ListCategorieFaq'),getAllCategorieFaq);
  router.get('/api/categorieFaqs/:id', checkPermission('ViewCategorieFaq'),getCategorieFaq);
  router.delete('/api/categorieFaqs/:id',checkPermission('DeleteCategorieFaq'),deleteCategorieFaq);
  router.put('/api/categorieFaqs/:id',checkPermission('EditCategorieFaq'), updateCategorieFaq);
};