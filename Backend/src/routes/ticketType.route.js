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
/**
 * @swagger
 * /ticket-types:
 *   post:
 *     summary: Create a new ticket type
 *     tags: [Ticket Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - name
 *               - price
 *               - quantity
 *               - saleEnd
 *             properties:
 *               event:
 *                 type: string
 *                 example: 689df2e5a0d7fd84c4d13d21
 *               name:
 *                 type: string
 *                 example: VIP
 *               description:
 *                 type: string
 *                 example: VIP Access
 *               price:
 *                 type: number
 *                 example: 5000
 *               quantity:
 *                 type: integer
 *                 example: 100
 *               saleEnd:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Ticket type created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 */
router.route("/")
    .post(createTicketType);

// Get all ticket types of an event
/**
 * @swagger
 * /ticket-types/event/{eventId}:
 *   get:
 *     summary: Get all ticket types of an event
 *     tags: [Ticket Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket types fetched successfully
 *       404:
 *         description: Event not found
 */
router.route("/event/:eventId")
    .get(getEventTicketTypes);

// Single Ticket Type CRUD
/**
 * @swagger
 * /ticket-types/{ticketTypeId}:
 *   get:
 *     summary: Get ticket type by ID
 *     tags: [Ticket Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketTypeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket type fetched successfully
 *       404:
 *         description: Ticket type not found
 */
/**
 * @swagger
 * /ticket-types/{ticketTypeId}:
 *   patch:
 *     summary: Update ticket type
 *     tags: [Ticket Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketTypeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               saleEnd:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Ticket type updated successfully
 *       404:
 *         description: Ticket type not found
 */
/**
 * @swagger
 * /ticket-types/{ticketTypeId}:
 *   delete:
 *     summary: Delete ticket type
 *     tags: [Ticket Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketTypeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket type deleted successfully
 *       400:
 *         description: Tickets already sold
 *       404:
 *         description: Ticket type not found
 */

router.route("/:ticketTypeId")
    .get(getTicketTypeById)
    .patch(updateTicketType)
    .delete(deleteTicketType);

// Activate / Deactivate
/**
 * @swagger
 * /ticket-types/{ticketTypeId}/activate:
 *   patch:
 *     summary: Activate a ticket type
 *     tags: [Ticket Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketTypeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket type activated successfully
 *       404:
 *         description: Ticket type not found
 */
router.route("/:ticketTypeId/activate")
    .patch(activateTicketType);
/**
 * @swagger
 * /ticket-types/{ticketTypeId}/deactivate:
 *   patch:
 *     summary: Deactivate a ticket type
 *     tags: [Ticket Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketTypeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket type deactivated successfully
 *       404:
 *         description: Ticket type not found
 */
router.route("/:ticketTypeId/deactivate")
    .patch(deactivateTicketType);

export default router;