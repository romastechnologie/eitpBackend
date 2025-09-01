import * as express from 'express';
import { createRole, deleteRole,createRolePermeission,deleteRolePermission, getAllRoles, getRole, getSimpleRole, updateRole } from '../controller/role.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export const rolesRoutes = (router: express.Router) => {
  router.post('/api/roles',checkPermission('AddRole'), createRole);
  router.get('/api/roles', checkPermission('ListRole'),getAllRoles);
  router.get('/api/roles/simple/:id', getSimpleRole);
  router.get('/api/roles/:id', checkPermission ('ViewRole'),getRole);
  router.delete('/api/roles/:id',  checkPermission('DeleteRole'),deleteRole);
  router.delete('/api/rolePermission/:id',  checkPermission('DeleteRole'),deleteRolePermission);
  router.put('/api/roles/:id', checkPermission('EditRole'),updateRole);
  router.post('/api/roles/permissions', checkPermission('AddRolePermission'),createRolePermeission);

  // router.post('/api/roles', createRole);
  // router.get('/api/roles',getAllRoles);
  // router.get('/api/roles/simple/:id', getSimpleRole);
  // router.get('/api/roles/:id',getRole);
  // router.delete('/api/roles/:id',deleteRole);
  // router.delete('/api/rolePermission/:id',deleteRolePermission);
  // router.put('/api/roles/:id',updateRole);
  // router.post('/api/roles/permissions', createRolePermeission);
};