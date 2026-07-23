import {Router} from "express";
import {verifyJWT, authorizeRoles} from "../middlewares/auth.middleware.js";
import {Roles} from "../models/user.model.js";
import {
    getOrganizerDashboard,
    getOrganizerDashboardStats
} from "../controllers/organizer.dashboard.controller.js";

const router = Router();

router.route("/").get(verifyJWT, authorizeRoles(Roles.ORGANIZER), getOrganizerDashboard);
router.route("/stats").get(verifyJWT, authorizeRoles(Roles.ORGANIZER), getOrganizerDashboardStats);

export default router;