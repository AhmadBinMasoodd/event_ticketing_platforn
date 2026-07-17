import {Router} from "express";
import {
    createTicketType,
    getEventTicketTypes,
    getTicketTypeById,
    updateTicketType,
    deleteTicketType,
    activateTicketType,
    deactivateTicketType,
} from "../controllers/ticketType.controller.js";

import { verifyJWT,authorizeRoles } from "../middlewares/auth.middleware.js";
import { Roles } from "../models/user.model.js";

const router=Router();
router.use(verifyJWT);
router.use(authorizeRoles(Roles.ORGANIZER))

// Create Ticket Type
router.route("/")
    .post(createTicketType);

// Get all ticket types of an event
router.route("/event/:eventId")
    .get(getEventTicketTypes);

// Single Ticket Type CRUD
router.route("/:ticketTypeId")
    .get(getTicketTypeById)
    .patch(updateTicketType)
    .delete(deleteTicketType);

// Activate / Deactivate
router.route("/:ticketTypeId/activate")
    .patch(activateTicketType);

router.route("/:ticketTypeId/deactivate")
    .patch(deactivateTicketType);

export default router;