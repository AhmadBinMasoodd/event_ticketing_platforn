import { Router } from "express";

import {
    createEvent,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    publishEvent,
    unpublishEvent,
    getPublishedEvents
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

router.patch("/:eventId/publish", publishEvent);
router.patch("/:eventId/unpublish", unpublishEvent);
router.get("/published", getPublishedEvents);
router.get("/public", getPublishedEvents);
export default router;