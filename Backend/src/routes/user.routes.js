import e, { Router } from "express";


import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    updatePassword,
    updateUser,
    deleteUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/refresh-access-token").get(refreshAccessToken);
router.route("/update-password").patch(verifyJWT, updatePassword);
router.route("/update-user").patch(verifyJWT, updateUser);
router.route("/delete-user").delete(verifyJWT, deleteUser);
export default router;
