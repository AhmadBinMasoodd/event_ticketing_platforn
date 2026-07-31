
import e, { Router } from "express";
import {
    createOrganizer,
    getMyOrganizers,
    getOrganizerById,
    updateOrganizer,
    deleteOrganizer
}  from "../controllers/organizer.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
/**
 * @swagger
 * /organizers:
 *   post:
 *     summary: Create a new organizer
 *     tags:
 *       - Organizers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - businessEmail
 *               - businessPhone
 *               - address
 *               - city
 *             properties:
 *               businessName:
 *                 type: string
 *               businessEmail:
 *                 type: string
 *               businessPhone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organizer created successfully
 *
 *   get:
 *     summary: Get all organizers of current user
 *     tags:
 *       - Organizers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organizers retrieved successfully
 */
router.route("/").post(createOrganizer).get(getMyOrganizers);

/**
 * @swagger
 * /organizers/{organizerId}:
 *   get:
 *     summary: Get organizer by ID
 *     tags:
 *       - Organizers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organizer retrieved successfully
 *       404:
 *         description: Organizer not found
 */
/**
 * @swagger
 * /organizers/{organizerId}:
 *   patch:
 *     summary: Update organizer
 *     tags:
 *       - Organizers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Organizer updated successfully
 */
/**
 * @swagger
 * /organizers/{organizerId}:
 *   delete:
 *     summary: Delete organizer
 *     tags:
 *       - Organizers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organizer deleted successfully
 */
router.route("/:organizerId").get(getOrganizerById).patch(updateOrganizer).delete(deleteOrganizer);

export default router;
