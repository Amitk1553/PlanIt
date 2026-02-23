import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/users/signup', asyncHandler(userController.signup));

export default router;
