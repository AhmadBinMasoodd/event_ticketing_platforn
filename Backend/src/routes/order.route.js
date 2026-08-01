import { Router } from "express";

import {
    createOrder,
    approveOrder,
    getOrders
} from "../controllers/order.controller.js";

import {
    verifyJWT,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";

import { Roles } from "../models/user.model.js";

const router = Router();
router.use(verifyJWT);
// Create Order
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new ticket order
 *     description: Requires customer role.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - ticketTypeId
 *               - quantity
 *               - paymentMethod
 *             properties:
 *               eventId:
 *                 type: string
 *                 example: 688af4a123456789abcdef12
 *               ticketTypeId:
 *                 type: string
 *                 example: 688af4a123456789abcdef13
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, bank_transfer, easypaisa, jazzcash]
 *                 example: cash
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: All fields are required, quantity invalid, event not published, ticket type inactive or unavailable, sale not started or ended, or ticket type does not belong to event
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Customer role required
 *       404:
 *         description: Event or ticket type not found
 *       409:
 *         description: Pending order already exists for this ticket type
 *   get:
 *     summary: Get all orders for organizer events
 *     description: Requires organizer role. Returns orders with populated userId, eventId, and ticketTypeId.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, cancelled, refunded]
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
 *     responses:
 *       200:
 *         description: Orders retrieved successfully with pagination
 *       400:
 *         description: Invalid order status
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not authorized to view orders or organizer role required
 */
router.post("/",authorizeRoles(Roles.CUSTOMER), createOrder);
/**
 * @swagger
 * /orders/{orderId}/approve:
 *   patch:
 *     summary: Approve a customer's order
 *     description: Requires organizer role. Generates tickets and marks the order as paid.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order approved successfully
 *       400:
 *         description: Order ID required, not enough tickets available, or only pending orders can be approved
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not authorized to approve this order or organizer role required
 *       404:
 *         description: Order, event, or ticket type not found
 */
router.patch("/:orderId/approve",authorizeRoles(Roles.ORGANIZER), approveOrder);
router.get("/",authorizeRoles( Roles.ORGANIZER), getOrders);

export default router;
