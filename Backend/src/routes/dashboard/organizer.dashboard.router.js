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
 *     description: Returns dashboard information for the logged-in organizer, including events, ticket sales, orders, and revenue.
 *     tags: [Organizer Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organizer dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Organizer role required)
 */
router
    .route("/")
    .get(
        verifyJWT,
        authorizeRoles(Roles.ORGANIZER),
        getOrganizerDashboard
    );

export default router;