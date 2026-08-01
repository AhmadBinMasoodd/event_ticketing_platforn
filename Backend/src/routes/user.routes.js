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
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email or phone number already registered
 */
router.route("/register").post(registerUser);
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Users
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ahmad@gmail.com
 *               password:
 *                 type: string
 *                 example: Ahmad123@
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Email and password are required
 *       404:
 *         description: User not found
 *       401:
 *         description: Invalid credentials
 */
router.route("/login").post(loginUser);
/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout current user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: Unauthorized access
 */
router.route("/logout").post(verifyJWT, logoutUser);
/**
 * @swagger
 * /users/current-user:
 *   get:
 *     summary: Get current logged in user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user fetched successfully
 *       401:
 *         description: Unauthorized access
 */
router.route("/current-user").get(verifyJWT, getCurrentUser);
/**
 * @swagger
 * /users/refresh-access-token:
 *   get:
 *     summary: Refresh access token
 *     description: Reads the refresh token from the refreshToken cookie and returns a new access token.
 *     tags:
 *       - Users
 *     security: []
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       401:
 *         description: Unauthorized, refresh token missing or invalid
 */
router.route("/refresh-access-token").get(refreshAccessToken);
/**
 * @swagger
 * /users/update-password:
 *   patch:
 *     summary: Update user password
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: All fields are required, passwords do not match, or new password is same as current password
 *       401:
 *         description: Current password is incorrect or unauthorized access
 *       404:
 *         description: User not found
 *       500:
 *         description: Error while updating password
 */
router.route("/update-password").patch(verifyJWT, updatePassword);
/**
 * @swagger
 * /users/update-user:
 *   patch:
 *     summary: Update user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: At least one field is required to update
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: User not found
 *       409:
 *         description: Email or phone already exists
 *       500:
 *         description: Error while updating user
 */
router.route("/update-user").patch(verifyJWT, updateUser);
/**
 * @swagger
 * /users/delete-user:
 *   delete:
 *     summary: Delete user account
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: User not found
 */
router.route("/delete-user").delete(verifyJWT, deleteUser);
export default router;
