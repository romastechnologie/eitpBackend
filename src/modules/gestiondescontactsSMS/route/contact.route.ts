import * as express from 'express';
import { createContact, deleteContact, getAllContact, getContact, updateContact } from '../controller/contact.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export  const contactsRoutes =  (router: express.Router) => {
  router.post('/api/contacts', checkPermission('AddContact'),createContact);
  router.get('/api/contacts',checkPermission('ListContact'),getAllContact);
  router.get('/api/contacts/:id', checkPermission('ViewContact'),getContact);
  router.delete('/api/contacts/:id',checkPermission('DeleteContact'),deleteContact);
  router.put('/api/contacts/:id',checkPermission('UpdateContact'), updateContact);
  //router.put('/api/active/contact/:id', activeContact);
};