import { Router } from "express";
import {
  createListing,
  deleteListing,
  getListing,
  getAllListings,
} from "../controllers/listing.controller";
import authenticate from "../middleware/authenticate";
import validateParams from "../middleware/validateParams";

const router = Router();

router.route("/").get(getAllListings).post(authenticate, createListing);

router
  .route("/:id")
  .get(validateParams, getListing)
  .delete(authenticate, validateParams, deleteListing);

export default router;
