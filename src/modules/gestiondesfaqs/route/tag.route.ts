import * as express from 'express';
import { createTag, deleteTag, getAllFaqTag, getAllTag, getTag, updateTag } from '../controller/tag.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const tagsRoutes =  (router: express.Router) => {
  router.post('/api/tags',checkPermission('AddTag'), createTag);
  router.get('/api/tags', checkPermission('ListTag'),getAllTag);
  //router.get('/api/faqtags', checkPermission('ListFaqTag'),getAllFaqTag);
  router.get('/api/tags/:id',checkPermission('ViewTag'), getTag);
  router.delete('/api/tags/:id',checkPermission('DeleteTag'),deleteTag);
  router.put('/api/tags/:id',checkPermission('EditTag'), updateTag);
};