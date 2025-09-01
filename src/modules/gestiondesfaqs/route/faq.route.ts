import * as express from 'express';
import { createFaq, createFaqTag, deleteFaq, deleteFaqTag, getAllFaq, getAllFaqByCategorie, getFaq, getFaqByCat, getFaqByTag, getFaqByTagOnly, getTagsNotIn, updateFaq } from '../controller/faq.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const faqsRoutes =  (router: express.Router) => {
  router.post('/api/faqs',checkPermission('AddFaq'), createFaq);
  router.get('/api/faqs',checkPermission('ListeFaq'), getAllFaq);
  //router.get('/api/faqs/:categorieId', checkPermission('ListFaqByCategorie'),getAllFaqByCategorie);
  router.get('/api/faqOnlys/:id', checkPermission('ViewFaq'),getFaq);
  router.post('/api/faqs/tags/:id', checkPermission('AddFaqTag'),createFaqTag);
  router.get('/api/resteante/faqtags/:faqId',checkPermission('ViewFaqTagsNotIn'), getTagsNotIn);
  router.delete('/api/faqtag/:id', checkPermission('DeleteFaqTag'),deleteFaqTag);
 // router.get('/api/categories/faqs/:id',  checkPermission('ViewFaqByCat'),getFaqByCat);
  //router.get('/api/tags/faqs/:id',checkPermission('ViewFaqByTag'), getFaqByTag);
  //router.get('/api/tagforfaqs/:id', checkPermission('ViewFaqByTagOnly'), getFaqByTagOnly);
  router.delete('/api/faqs/:id', checkPermission('DeleteFaq'),deleteFaq);
  router.put('/api/faqs/:id',checkPermission('EditFaq'), updateFaq);
};