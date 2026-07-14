import { Router } from "express";

import {
    createEvent,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} from "../controllers/event.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/")
    .post(createEvent)
    .get(getMyEvents);

router
    .route("/:eventId")
    .get(getEventById)
    .patch(updateEvent)
    .delete(deleteEvent);

export default router;