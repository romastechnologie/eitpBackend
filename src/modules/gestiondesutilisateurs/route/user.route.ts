import * as express from 'express';
import { getAllUsers, updatePassword, deleteUser, getUser, createUser, switchUser, getUsers, updateUser, ChangerPasswordAdmin } from '../controller/user.controller';
// import { checkPermission } from '../../../middlewares/auth.middleware';

export const userRoutes = (router: express.Router) => {
  // router.get('/api/users', checkPermission('ListUser'), getAllUsers);
  // router.post('/api/users', checkPermission('AddUser'), createUser);
  // router.put("/api/user/password", updatePassword)
  // router.get('/api/user', getUser);
  // router.put('/api/user', updateUser);
  // router.get('/api/users/:id', checkPermission('ViewUser'), getUsers);
  // router.delete('/api/users/:id', checkPermission('DeleteUser'), deleteUser);
  // router.put("/api/users/password/:id", checkPermission('UpdatePassword'), updatePassword)
  // router.put("/api/users/password/admin/:id", checkPermission('ChangerPasswordAdmin'), ChangerPasswordAdmin)
  // router.put('/api/users/:id', checkPermission('EditUser'), updateUser);
  // router.put('/api/user/statut/:id', checkPermission('SwitchUser'), switchUser);


  router.get('/api/users', getAllUsers);
  router.post('/api/users', createUser);
  router.get('/api/users/:id', getUser);
  router.delete('/api/users/:id', deleteUser);
  router.put("/api/users/password/:id", updatePassword)
  router.put("/api/users/password/admin/:id", ChangerPasswordAdmin)
  router.put('/api/users/:id', updateUser);
};