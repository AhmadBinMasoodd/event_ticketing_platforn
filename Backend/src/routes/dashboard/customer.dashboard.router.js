import {Router} from "express";
import {verifyJWT, authorizeRoles} from "../middlewares/auth.middleware.js";
import {Roles} from "../models/user.model.js";
import {
    getCustomerDashboard,
} from "../controllers/customer.dashboard.controller.js";

const router = Router();

router.route("/").get(verifyJWT, authorizeRoles(Roles.CUSTOMER), getCustomerDashboard);

export default router;