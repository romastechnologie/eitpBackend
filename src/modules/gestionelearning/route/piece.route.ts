import * as express from 'express';
import { createPiece, deletePiece, getAllPiece, getAllPieces, getPiece, updatePiece } from '../controller/piece.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const piecesRoutes =  (router: express.Router) => {
  // router.post('/api/pieces',checkPermission('AddPiece'), createPiece);
  // router.get('/api/pieces',checkPermission('ListPiece'), getAllPiece);
  // router.get('/api/all/pieces',checkPermission('ListAllPiece'), getAllPieces);
  // router.get('/api/pieces/:id',checkPermission('ViewPiece'), getPiece);
  // router.delete('/api/pieces/:id',checkPermission('DeletePiece'),deletePiece);
  // router.put('/api/pieces/:id',checkPermission('EditPiece'), updatePiece);


  router.post('/api/pieces', createPiece);
  router.get('/api/pieces', getAllPiece);
  router.get('/api/all/pieces', getAllPieces);
  router.get('/api/pieces/:id', getPiece);
  router.delete('/api/pieces/:id',deletePiece);
  router.put('/api/pieces/:id',updatePiece);

};