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
 *     description: Requires customer role. Returns ticket counts, order counts, and total spent for the logged-in customer.
 *     tags:
 *       - Customer Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer dashboard fetched successfully
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Customer role required
 */
router.route("/")
    .get(
        verifyJWT,
        authorizeRoles(Roles.CUSTOMER),
        getCustomerDashboard
    );

export default router;
