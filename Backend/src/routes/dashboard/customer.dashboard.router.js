import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/auth.middleware.js";
import { Roles } from "../../models/user.model.js";
import { getCustomerDashboard } from "../../controllers/dashboard/customer.dashboard.controller.js";
const router = Router();

router.route("/")
    .get(
        verifyJWT,
        authorizeRoles(Roles.CUSTOMER),
        getCustomerDashboard
    );

export default router;