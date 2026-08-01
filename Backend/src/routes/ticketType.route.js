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
 *     description: Requires organizer role.
 *     tags:
 *       - Ticket Types
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
 *         description: All fields are required
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not the owner of this event or organizer role required
 *       404:
 *         description: Event not found
 *       409:
 *         description: Ticket type with this name already exists for this event
 */
router.route("/")
    .post(createTicketType);

// Get all ticket types of an event
/**
 * @swagger
 * /ticket-types/event/{eventId}:
 *   get:
 *     summary: Get all ticket types of an event
 *     description: Requires organizer role.
 *     tags:
 *       - Ticket Types
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
 *         description: Ticket types fetched successfully or no ticket types found for this event
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not the owner of this event or organizer role required
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
 *     description: Requires organizer role. Returns ticket type with populated event organizer.
 *     tags:
 *       - Ticket Types
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
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not the owner of this event or organizer role required
 *       404:
 *         description: Ticket type not found
 *   patch:
 *     summary: Update ticket type
 *     description: Requires organizer role.
 *     tags:
 *       - Ticket Types
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketTypeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
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
 *       400:
 *         description: Quantity cannot be less than sold tickets
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not authorized to update this ticket type or organizer role required
 *       404:
 *         description: Ticket type not found
 *       409:
 *         description: Ticket type with this name already exists for this event
 *   delete:
 *     summary: Delete ticket type
 *     description: Requires organizer role.
 *     tags:
 *       - Ticket Types
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
 *         description: Cannot delete a ticket type after tickets have been sold
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not authorized to delete this ticket type or organizer role required
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
 *     description: Requires organizer role.
 *     tags:
 *       - Ticket Types
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
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not authorized to activate this ticket type or organizer role required
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
 *     description: Requires organizer role.
 *     tags:
 *       - Ticket Types
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
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not authorized to deactivate this ticket type or organizer role required
 *       404:
 *         description: Ticket type not found
 */
router.route("/:ticketTypeId/deactivate")
    .patch(deactivateTicketType);

export default router;
