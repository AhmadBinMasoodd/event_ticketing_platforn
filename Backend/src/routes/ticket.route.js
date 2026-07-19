import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { Roles } from "../models/user.model.js";
import {
    getMyTickets,
    getTicketById,
    getEventTickets,
    scanTicket
} from "../controllers/ticket.controller.js";

const router = Router();

router.use(verifyJWT);

// Customer
router.get(
    "/my",
    authorizeRoles(Roles.CUSTOMER),
    getMyTickets
);

router.get(
    "/:ticketId",
    authorizeRoles(Roles.CUSTOMER),
    getTicketById
);

router.get(
    "/event/:eventId",
    authorizeRoles(Roles.ORGANIZER),
    getEventTickets
);

router.post(
    "/scan/:qrCode",
    authorizeRoles(Roles.ORGANIZER),
    scanTicket
);

export default router;