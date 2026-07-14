
import e, { Router } from "express";
import {
    createOrganizer,
    getMyOrganizers,
    getOrganizerById,
    updateOrganizer,
    deleteOrganizer
}  from "../controllers/organizer.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/").post(createOrganizer).get(getMyOrganizers);
router.route("/:organizerId").get(getOrganizerById).patch(updateOrganizer).delete(deleteOrganizer);

export default router;
