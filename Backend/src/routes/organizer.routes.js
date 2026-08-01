
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
 *       400:
 *         description: All fields are required
 *       401:
 *         description: Unauthorized access
 *       409:
 *         description: Organization with same details already exists
 *
 *   get:
 *     summary: Get all organizers of current user
 *     tags:
 *       - Organizers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organizers fetched successfully or no organizers found for this user
 *       401:
 *         description: Unauthorized access
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
 *         description: Organizer fetched successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Organizer not found
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
 *       200:
 *         description: Organizer updated successfully
 *       400:
 *         description: At least one field is required to update
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Organizer not found
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
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Organizer not found
 */
router.route("/:organizerId").get(getOrganizerById).patch(updateOrganizer).delete(deleteOrganizer);

export default router;
