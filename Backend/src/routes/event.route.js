import { Router } from "express";

import {
    createEvent,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} from "../controllers/event.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { Roles } from "../models/user.model.js";
const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles(Roles.ORGANIZER));
router
    .route("/")
    .post(
        createEvent
    )
    .get(
        getMyEvents
    );

router
    .route("/:eventId")
    .get(
        getEventById
    )
    .patch(
        updateEvent
    )
    .delete(
        deleteEvent
    );

export default router;