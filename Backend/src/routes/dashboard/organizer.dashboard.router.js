import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../../middlewares/auth.middleware.js";
import { Roles } from "../../models/user.model.js";
import {
    getOrganizerDashboard,
} from "../../controllers/dashboard/organizer.dashboard.controller.js";

const router = Router();
/**
 * @swagger
 * /dashboard/organizer:
 *   get:
 *     summary: Get organizer dashboard statistics
 *     description: Requires organizer role. Returns event, ticket, order, and revenue counts for the logged-in organizer.
 *     tags:
 *       - Organizer Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organizer dashboard fetched successfully
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Organizer role required
 *       404:
 *         description: Organizer profile not found
 */
router
    .route("/")
    .get(
        verifyJWT,
        authorizeRoles(Roles.ORGANIZER),
        getOrganizerDashboard
    );

export default router;
