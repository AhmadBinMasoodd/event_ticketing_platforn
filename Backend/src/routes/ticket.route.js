import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { Roles } from "../models/user.model.js";
import {
    getMyTickets,
    getTicketById
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

export default router;