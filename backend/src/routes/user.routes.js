import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/users/signup', asyncHandler(userController.signup));
router.post('/users/login', asyncHandler(userController.login));
router.post('/users/logout', asyncHandler(userController.logout));
router.get('/users/me', authMiddleware, asyncHandler(userController.me));

export default router;
