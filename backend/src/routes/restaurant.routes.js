import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { restaurantController } from '../controllers/restaurant.controller.js';

const router = Router();

router.post('/restaurants', asyncHandler(restaurantController.getRestaurantSuggestion));

export default router;
