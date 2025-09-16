import * as express from 'express';
import { createEmploiDuTemps, deleteEmploiDuTemps, getAllEmploiDuTemps, getEmploiDuTemps, updateEmploiDuTemps } from '../controller.ts/emploidutemps.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export const emploisDuTempsRoutes = (router: express.Router) => {

    // router.post('/api/emplois-du-temps', checkPermission('AddEmploiDuTemps'), createEmploiDuTemps);
    // router.get('/api/emplois-du-temps', checkPermission('ListEmploiDuTemps'), getAllEmploiDuTemps);
    // router.get('/api/emplois-du-temps/:id', checkPermission('ViewEmploiDuTemps'), getEmploiDuTemps);
    // router.delete('/api/emplois-du-temps/:id', checkPermission('DeleteEmploiDuTemps'), deleteEmploiDuTemps);
    // router.put('/api/emplois-du-temps/:id', checkPermission('EditEmploiDuTemps'), updateEmploiDuTemps);

    // Routes sans permissions pour le développement
    router.post('/api/emplois-du-temps', createEmploiDuTemps);
    router.get('/api/emplois-du-temps', getAllEmploiDuTemps);
    router.get('/api/emplois-du-temps/:id', getEmploiDuTemps);
    router.delete('/api/emplois-du-temps/:id', deleteEmploiDuTemps);
    router.put('/api/emplois-du-temps/:id', updateEmploiDuTemps);
};