import { Router } from "express";

import {
    createOrder,
} from "../controllers/order.controller.js";

import {
    verifyJWT,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";

import { Roles } from "../models/user.model.js";

const router = Router();
router.use(verifyJWT);
// Create Order
router.post("/",authorizeRoles(Roles.CUSTOMER), createOrder);

export default router;