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
 *                 example: Cash
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Event or Ticket Type not found
 *       409:
 *         description: Duplicate pending order
 */
router.post("/",authorizeRoles(Roles.CUSTOMER), createOrder);
/**
 * @swagger
 * /orders/{orderId}/approve:
 *   patch:
 *     summary: Approve a customer's order
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
 *         description: Invalid order state or insufficient tickets
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.patch("/:orderId/approve",authorizeRoles(Roles.ORGANIZER), approveOrder);
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders for organizer events
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - paid
 *             - cancelled
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
 *           enum:
 *             - asc
 *             - desc
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       403:
 *         description: Unauthorized
 */
router.get("/",authorizeRoles( Roles.ORGANIZER), getOrders);

export default router;