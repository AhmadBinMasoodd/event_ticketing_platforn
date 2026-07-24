import {Router} from "express";
import {verifyJWT, authorizeRoles} from "../middlewares/auth.middleware.js";
import {Roles} from "../models/user.model.js";
import {
    getOrganizerDashboard,
} from "../controllers/organizer.dashboard.controller.js";

const router = Router();

router.route("/").get(verifyJWT, authorizeRoles(Roles.ORGANIZER), getOrganizerDashboard);

export default router;