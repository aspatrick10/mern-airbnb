import { Router } from "express";
import {
  createReservation,
  deleteReservation,
  getAllReservations,
} from "../controllers/reservation.controller";
import authenticate from "../middleware/authenticate";
import validateParams from "../middleware/validateParams";

const router = Router();

router.route("/").get(getAllReservations).post(authenticate, createReservation);
router.delete("/:id", authenticate, validateParams, deleteReservation);

export default router;
