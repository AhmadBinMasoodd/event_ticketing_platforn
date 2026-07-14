
import e, { Router } from "express";
import {
    createOrganizer
}  from "../controllers/organizer.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/create").post(createOrganizer);

export default router;
