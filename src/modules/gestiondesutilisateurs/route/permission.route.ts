import * as express from 'express';
import { createPermission, deletePermission,getPermissionNotIn, getAllPermissions, getPermission, getPermissions, updatePermission } from '../controller/permission.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const permissionsRoutes =  (router: express.Router) => {
  router.post('/api/permissions',checkPermission('AddPermission'), createPermission);
  router.get('/api/permissions', checkPermission('ListPermission'),getPermissions);
  router.get('/api/all/permissions', checkPermission('ListAllPermission'),getAllPermissions);
  router.get('/api/permissions/:id', checkPermission('ViewPermission'),getPermission);
  router.get('/api/resteante/permissions/:userId', checkPermission('PermissionNotIn'),getPermissionNotIn);
  router.delete('/api/permissions/:id', checkPermission('DeletePermission'),deletePermission);
  router.put('/api/permissions/:id', checkPermission('EditPermission'),updatePermission);

  // router.post('/api/permissions', createPermission);
  // router.get('/api/permissions', getPermissions);
  // router.get('/api/all/permissions', getAllPermissions);
  // router.get('/api/permissions/:id', getPermission);
  // router.get('/api/resteante/permissions/:userId', getPermissionNotIn);
  // router.delete('/api/permissions/:id', deletePermission);
  // router.put('/api/permissions/:id', updatePermission);
};