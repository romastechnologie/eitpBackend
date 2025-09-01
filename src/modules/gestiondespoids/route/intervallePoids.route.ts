import * as express from "express";
import {
  createIntervallePoids,
  deleteIntervallePoids,
  getAllIntervallePoidsDistance,
  getAllIntervallePoids,
  getIntervallePoidsMontant,
  getIntervallePoids,
  updateIntervallePoids,
} from "../controller/intervallePoids.controller";
import { checkPermission } from "../../../middlewares/auth.middleware";

export const intervallePoidsRoutes = (router: express.Router) => {
  router.post(
    "/api/intervallePoids",
    checkPermission("AddIntervallePoids"),
    createIntervallePoids
  );
  router.get(
    "/api/intervallePoids",
    checkPermission("ListIntervallePoids"),
    getAllIntervallePoids
  );
  //router.get('/api/poidsDistanceMontants/:dtype/:ptype',checkPermission('ListIntervallePoidsDistance'),  getAllIntervallePoidsDistance);
  router.get(
    "/api/intervalPMontants",
    checkPermission("ListIntervallePoidsMontant"),
    getIntervallePoidsMontant
  );
  router.get(
    "/api/intervallePoids/:id",
    checkPermission("ViewIntervallePoids"),
    getIntervallePoids
  );
  router.delete(
    "/api/intervallePoids/:id",
    checkPermission("DeleteIntervallePoids"),
    deleteIntervallePoids
  );
  router.put(
    "/api/intervallePoids/:id",
    checkPermission("EditIntervallePoids"),
    updateIntervallePoids
  );
};
