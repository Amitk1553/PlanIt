import { Router } from 'express';
import { planController } from '../controllers/plan.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/plan', asyncHandler(planController.createPlan));

export default router;
