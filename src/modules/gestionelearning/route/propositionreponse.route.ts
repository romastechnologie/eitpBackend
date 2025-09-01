import * as express from 'express';
import { createPropositionReponse, deletePropositionReponse, getAllPropositionReponses,getPropositionsByQuestion, getReponsesByProposition, updatePropositionReponse } from '../controller/propositionreponse.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export const propositionReponseRoutes = (router: express.Router) => {
  router.post('/api/propositions', checkPermission('AddPropositionReponse'), createPropositionReponse);
  router.get('/api/propositions', checkPermission('ListPropositionReponse'), getAllPropositionReponses);
  router.get('/api/propositions/:id', checkPermission('ViewPropositionReponse'), getReponsesByProposition);
  router.put('/api/propositions/:id', checkPermission('EditPropositionReponse'), updatePropositionReponse);
  router.delete('/api/propositions/:id', checkPermission('DeletePropositionReponse'), deletePropositionReponse);
  router.get('/api/propositions/:id/reponses', getReponsesByProposition);
  router.get('/api/question/:id/propositions', checkPermission('ViewPropositionsByQuestion'), getPropositionsByQuestion);
};