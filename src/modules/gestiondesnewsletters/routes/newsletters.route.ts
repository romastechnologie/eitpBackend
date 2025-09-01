import * as express from 'express';
import { createNewsletters, deleteNewsletters, getAllNewsletters, getNewsletters, updateNewsletters } from '../controller/newsletters.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';
export  const newslettersRoutes =  (router: express.Router) => {
  router.get('/api/newsletters', checkPermission('ListNewsletters'),getAllNewsletters);
  router.get('/api/newsletters/:id',checkPermission('ViewNewsletters'), getNewsletters);
  router.delete('/api/newsletters/:id',checkPermission('DeleteNewsletters'),deleteNewsletters);
  router.put('/api/newsletters/:id', checkPermission('EditNewsletters'),updateNewsletters);
};