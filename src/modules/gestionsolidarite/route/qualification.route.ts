import * as express from 'express';
import { checkPermission } from '../../../middlewares/auth.middleware';
import { createQualification, deleteQualification, getAllQualification, getAllQualifications, getQualification, updateQualification } from '../controller.ts/qualification.controller';

export const qualificationsRoutes = (router: express.Router) => {
  // router.post('/api/qualifications', checkPermission('AddQualification'), createQualification);
  // router.get('/api/qualifications', checkPermission('ListQualification'), getAllQualification);
  // router.get('/api/all/qualifications', checkPermission('ListAllQualification'), getAllQualificationx);
  // router.get('/api/qualifications/:id', checkPermission('ViewQualification'), getQualification);
  // router.delete('/api/qualifications/:id', checkPermission('DeleteQualification'), deleteQualification);
  // router.put('/api/qualifications/:id', checkPermission('EditQualification'), updateQualification);


  router.post('/api/qualifications', createQualification);
  router.get('/api/qualifications', getAllQualification);
  router.get('/api/all/qualifications', getAllQualifications);
  router.get('/api/qualifications/:id', getQualification);
  router.delete('/api/qualifications/:id', deleteQualification);
  router.put('/api/qualifications/:id', updateQualification);


};