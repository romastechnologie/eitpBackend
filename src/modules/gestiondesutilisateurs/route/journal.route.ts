import * as express from 'express';
import { checkPermission } from '../../../middlewares/auth.middleware';
import { getAllJournalConnexions, getAllJournalOperations } from '../controller/journal.controller';

export  const journalRoutes =  (router: express.Router) => {
  router.get('/api/journalConnexions', checkPermission('ListJournalConnexion'),getAllJournalConnexions);
  router.get('/api/journalOperations', checkPermission('ListJournalOperation'),getAllJournalOperations);
};