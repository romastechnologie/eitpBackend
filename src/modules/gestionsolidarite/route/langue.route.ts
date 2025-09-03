import * as express from 'express';

import { createLangues, deleteLangues, getAllLangue, getAllLangues, getLangues, updateLangues } from '../controller.ts/langues.controller';

export const languesRoutes = (router: express.Router) => {
  // router.post('/api/langues', checkPermission('AddLangue'), createLangue);
  // router.get('/api/langues', checkPermission('ListLangue'), getAllLangue);
  // router.get('/api/all/langues', checkPermission('ListAllLangue'), getAllLanguex);
  // router.get('/api/langues/:id', checkPermission('ViewLangue'), getLangue);
  // router.delete('/api/langues/:id', checkPermission('DeleteLangue'), deleteLangue);
  // router.put('/api/langues/:id', checkPermission('EditLangue'), updateLangue);


  router.post('/api/langues', createLangues);
  router.get('/api/langues', getAllLangues);
  router.get('/api/all/langues', getAllLangue);
  router.get('/api/langues/:id', getLangues);
  router.delete('/api/langues/:id', deleteLangues);
  router.put('/api/langues/:id', updateLangues);


};