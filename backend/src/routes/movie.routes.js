import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { movieController } from '../controllers/movie.controller.js';

const router = Router();

router.post('/movies', asyncHandler(movieController.getMovieListing));

export default router;
