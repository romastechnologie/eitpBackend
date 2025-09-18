import * as express from 'express';
import { checkClasseAvailability, createEmploiDuTemps, deleteEmploiDuTemps, getAllEmploiDuTemps, getEmploiDuTemps, updateEmploiDuTemps } from '../controller.ts/emploidutemps.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';

export const emploisDuTempsRoutes = (router: express.Router) => {

    // router.post('/api/emplois-du-temps', checkPermission('AddEmploiDuTemps'), createEmploiDuTemps);
    // router.get('/api/emplois-du-temps', checkPermission('ListEmploiDuTemps'), getAllEmploiDuTemps);
    // router.get('/api/emplois-du-temps/:id', checkPermission('ViewEmploiDuTemps'), getEmploiDuTemps);
    // router.delete('/api/emplois-du-temps/:id', checkPermission('DeleteEmploiDuTemps'), deleteEmploiDuTemps);
    // router.put('/api/emplois-du-temps/:id', checkPermission('EditEmploiDuTemps'), updateEmploiDuTemps);


    router.post('/api/emplois-du-temps', createEmploiDuTemps);
    router.get('/api/emplois-du-temps', getAllEmploiDuTemps);
    router.get('/api/emplois-du-temps/:id', getEmploiDuTemps);
    router.get('/api/emplois-du-temps/check-classe', getEmploiDuTemps);
    router.get('/api/emplois-du-temps/check-classe-availability', checkClasseAvailability);
    router.delete('/api/emplois-du-temps/:id', deleteEmploiDuTemps);
    router.put('/api/emplois-du-temps/:id', updateEmploiDuTemps);
};
