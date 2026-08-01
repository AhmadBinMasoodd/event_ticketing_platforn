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
 *     description: Requires customer role. Returns tickets with populated event, ticketType, and order.
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, used, cancelled]
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully with pagination
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Customer role required
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
 *     description: Requires customer role. Returns ticket with populated event, ticketType, and order.
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
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Customer role required
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
 *     description: Requires organizer role. Returns tickets with populated user, ticketType, and order.
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, used, cancelled]
 *     responses:
 *       200:
 *         description: Event tickets retrieved successfully with pagination
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not authorized or organizer role required
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
 *     summary: Scan a ticket QR code
 *     description: Requires organizer role. Marks an active ticket as used.
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
 *     responses:
 *       200:
 *         description: Ticket scanned successfully
 *       400:
 *         description: Ticket is not active
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Unauthorized or organizer role required
 *       404:
 *         description: Ticket or event not found
 */
router.post(
    "/scan/:qrCode",
    authorizeRoles(Roles.ORGANIZER),
    scanTicket
);

export default router;
