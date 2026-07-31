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
/**
 * @swagger
 * /tickets/my:
 *   get:
 *     summary: Get current customer's tickets
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/my",
    authorizeRoles(Roles.CUSTOMER),
    getMyTickets
);
/**
 * @swagger
 * /tickets/{ticketId}:
 *   get:
 *     summary: Get a single ticket
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *       404:
 *         description: Ticket not found
 */
router.get(
    "/:ticketId",
    authorizeRoles(Roles.CUSTOMER),
    getTicketById
);
/**
 * @swagger
 * /tickets/event/{eventId}:
 *   get:
 *     summary: Get all tickets of an event
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event tickets retrieved successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.get(
    "/event/:eventId",
    authorizeRoles(Roles.ORGANIZER),
    getEventTickets
);
/**
 * @swagger
 * /tickets/scan/{qrCode}:
 *   post:
 *     summary: Scan a ticket QR Code
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket QR Code
 *     responses:
 *       200:
 *         description: Ticket scanned successfully
 *       400:
 *         description: Ticket already used or inactive
 *       404:
 *         description: Ticket not found
 */
router.post(
    "/scan/:qrCode",
    authorizeRoles(Roles.ORGANIZER),
    scanTicket
);

export default router;