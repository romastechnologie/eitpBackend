import * as express from 'express';
import { createTypePiece, deleteTypePiece, getAllTypePiece, getAllTypePieces, getTypePiece, updateTypePiece } from '../controller/typepiece.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const typePiecesRoutes =  (router: express.Router) => {
  // router.post('/api/typePieces',checkPermission('AddTypePiece'), createTypePiece);
  // router.get('/api/typePieces',checkPermission('ListTypePiece'), getAllTypePiece);
  // router.get('/api/all/typePieces',checkPermission('ListAllTypePiece'), getAllTypePieces);
  // router.get('/api/typePieces/:id',checkPermission('ViewTypePiece'), getTypePiece);
  // router.delete('/api/typePieces/:id',checkPermission('DeleteTypePiece'),deleteTypePiece);
  // router.put('/api/typePieces/:id',checkPermission('EditTypePiece'), updateTypePiece);


  router.post('/api/typePieces', createTypePiece);
  router.get('/api/typePieces', getAllTypePiece);
  router.get('/api/all/typePieces', getAllTypePieces);
  router.get('/api/typePieces/:id', getTypePiece);
  router.delete('/api/typePieces/:id',deleteTypePiece);
  router.put('/api/typePieces/:id',updateTypePiece);

};