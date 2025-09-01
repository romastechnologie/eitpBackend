import * as express from 'express';
import { createNiveau, deleteNiveau, getAllNiveau, getAllNiveaux, getNiveau, updateNiveau } from '../controller/niveau.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export const niveauxRoutes = (router: express.Router) => {
  router.post('/api/niveaux', checkPermission('AddNiveau'), createNiveau);
  router.get('/api/niveaux', checkPermission('ListNiveau'), getAllNiveau);
  router.get('/api/all/niveaux', checkPermission('ListAllNiveau'), getAllNiveaux);
  router.get('/api/niveaux/:id', checkPermission('ViewNiveau'), getNiveau);
  router.delete('/api/niveaux/:id', checkPermission('DeleteNiveau'), deleteNiveau);
  router.put('/api/niveaux/:id', checkPermission('EditNiveau'), updateNiveau);
};