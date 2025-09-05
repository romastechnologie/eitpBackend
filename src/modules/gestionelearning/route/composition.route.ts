import * as express from 'express';
import { createComposition, deleteComposition, getAllComposition, getComposition, updateComposition } from '../controller/composition.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const compositionsRoutes =  (router: express.Router) => {
  // router.post('/api/compositions',checkPermission('AddComposition'), createComposition);
  // router.get('/api/compositions',checkPermission('ListComposition'), getAllComposition);
  // router.get('/api/compositions/:id',checkPermission('ViewComposition'), getComposition);
  // router.delete('/api/compositions/:id',checkPermission('DeleteComposition'),deleteComposition);
  // router.put('/api/compositions/:id',checkPermission('EditComposition'), updateComposition);

    router.post('/api/compositions', createComposition);
    router.get('/api/compositions', getAllComposition);
    // router.get('/api/all/compositions', getAllcompositions);
    router.get('/api/compositions/:id', getComposition);
    router.delete('/api/compositions/:id', deleteComposition);
    router.put('/api/compositions/:id', updateComposition);
    // router.get('/filiereNiveauMatieres', getAllFiliereNiveauMatieres);
};