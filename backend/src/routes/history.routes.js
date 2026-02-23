import { Router } from 'express';
import { historyController } from '../controllers/history.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/history', asyncHandler(historyController.saveSearch));
router.get('/history', asyncHandler(historyController.getHistory));
router.get('/history/:id', asyncHandler(historyController.getSearchById));
router.delete('/history/:id', asyncHandler(historyController.deleteSearch));

export default router;
