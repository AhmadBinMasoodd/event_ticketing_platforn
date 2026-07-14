
import e, { Router } from "express";
import {
    
}  from "../controllers/organizer.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
