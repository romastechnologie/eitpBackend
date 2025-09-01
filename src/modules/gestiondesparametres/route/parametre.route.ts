import { Router } from "express";
import { createParametre, deleteParametre, getAllParametres, getParametre, updateParametre } from "../controller/parametre.controller";
import { checkPermission } from "../../../middlewares/auth.middleware";
//import { checkPermission } from "../../../middlewares/auth.middleware";

export const parametresRoutes = (router) => {
    router.post('/api/parametres', checkPermission('AddParametre'), createParametre);
    router.get('/api/parametres', checkPermission('ListParametre'), getAllParametres);
    router.get('/api/parametres/:id', checkPermission('ViewParametre'), getParametre);
    router.delete('/api/parametres/:id',checkPermission('DeleteParametre'),  deleteParametre);
    router.put('/api/parametres/:id',checkPermission('EditParametre'),  updateParametre);
}