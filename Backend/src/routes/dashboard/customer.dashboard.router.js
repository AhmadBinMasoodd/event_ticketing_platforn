import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/auth.middleware.js";
import { Roles } from "../../models/user.model.js";
import { getCustomerDashboard } from "../../controllers/dashboard/customer.dashboard.controller.js";
const router = Router();
/**
 * @swagger
 * /dashboard/customer:
 *   get:
 *     summary: Get customer dashboard statistics
 *     description: Returns dashboard information for the logged-in customer, including orders, tickets, and recent activity.
 *     tags: [Customer Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Customer role required)
 */
router.route("/")
    .get(
        verifyJWT,
        authorizeRoles(Roles.CUSTOMER),
        getCustomerDashboard
    );

export default router;