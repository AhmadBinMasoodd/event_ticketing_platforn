import { Router } from "express";

import {
    createEvent,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    publishEvent,
    unpublishEvent,
    getPublishedEvents
} from "../controllers/event.controller.js";

import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { Roles } from "../models/user.model.js";
const router = Router();

//router.get("/published", getPublishedEvents);
/**
 * @swagger
 * /events/public:
 *   get:
 *     summary: Get all published events
 *     tags:
 *       - Public Events
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Published events fetched successfully
 */
router.get("/public", getPublishedEvents);

router.use(verifyJWT);
router.use(authorizeRoles(Roles.ORGANIZER));
/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizer
 *               - title
 *               - description
 *               - venue
 *               - city
 *               - eventDate
 *               - startTime
 *               - endTime
 *               - capacity
 *             properties:
 *               organizer:
 *                 type: string
 *                 example: 688af4a123456789abcdef12
 *               title:
 *                 type: string
 *                 example: Tech Conference 2026
 *               description:
 *                 type: string
 *                 example: Annual technology conference
 *               venue:
 *                 type: string
 *                 example: Expo Center Lahore
 *               city:
 *                 type: string
 *                 example: Lahore
 *               eventDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-08-20
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "17:00"
 *               capacity:
 *                 type: integer
 *                 example: 500
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events of logged-in organizer
 *     tags:
 *       - Events
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
 *         name: search
 *         schema:
 *           type: string
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
 *         description: Events fetched successfully
 */
router
    .route("/")
    .post(
        createEvent
    )
    .get(
        getMyEvents
    );

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: Get event by ID
 *     tags:
 *       - Events
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
 *         description: Event fetched successfully
 *       404:
 *         description: Event not found
 */
/**
 * @swagger
 * /events/{eventId}:
 *   patch:
 *     summary: Update an event
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event updated successfully
 */
/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     summary: Delete an event
 *     tags:
 *       - Events
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
 *         description: Event deleted successfully
 */
router
    .route("/:eventId")
    .get(
        getEventById
    )
    .patch(
        updateEvent
    )
    .delete(
        deleteEvent
    );
/**
 * @swagger
 * /events/{eventId}/publish:
 *   patch:
 *     summary: Publish an event
 *     tags:
 *       - Events
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
 *         description: Event published successfully
 */
router.patch("/:eventId/publish", publishEvent);
/**
 * @swagger
 * /events/{eventId}/unpublish:
 *   patch:
 *     summary: Unpublish an event
 *     tags:
 *       - Events
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
 *         description: Event unpublished successfully
 */
router.patch("/:eventId/unpublish", unpublishEvent);
export default router;