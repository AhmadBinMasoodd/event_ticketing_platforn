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
 *     security: []
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
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Published events fetched successfully with pagination
 */
router.get("/public", getPublishedEvents);

router.use(verifyJWT);
router.use(authorizeRoles(Roles.ORGANIZER));
/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     description: Requires organizer role.
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
 *         description: All fields are required
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Organizer role required
 *       404:
 *         description: Organizer not found
 *   get:
 *     summary: Get all events of logged-in organizer
 *     description: Requires organizer role. Returns events with populated organizer.
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, ongoing, completed, cancelled]
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Events fetched successfully with pagination
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Organizer role required
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
 *     description: Requires organizer role. Returns event with populated organizer.
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
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not authorized to view this event or organizer role required
 *       404:
 *         description: Event not found
 *   patch:
 *     summary: Update an event
 *     description: Requires organizer role.
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               venue:
 *                 type: string
 *               city:
 *                 type: string
 *               eventDate:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [upcoming, ongoing, completed, cancelled]
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Capacity cannot be less than tickets sold
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not authorized to update this event or organizer role required
 *       404:
 *         description: Event not found
 *   delete:
 *     summary: Delete an event
 *     description: Requires organizer role.
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
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not authorized to delete this event or organizer role required
 *       404:
 *         description: Event not found
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
 *     description: Requires organizer role.
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
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not authorized to publish this event or organizer role required
 *       404:
 *         description: Event not found
 */
router.patch("/:eventId/publish", publishEvent);
/**
 * @swagger
 * /events/{eventId}/unpublish:
 *   patch:
 *     summary: Unpublish an event
 *     description: Requires organizer role.
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
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Not authorized to unpublish this event or organizer role required
 *       404:
 *         description: Event not found
 */
router.patch("/:eventId/unpublish", unpublishEvent);
export default router;
