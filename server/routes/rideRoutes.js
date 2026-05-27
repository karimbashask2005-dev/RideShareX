import express from 'express';
import { 
  createRide, searchRides, getRideById, 
  getMyRides, cancelRide 
} from '../controllers/rideController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createRide)
  .get(searchRides);

router.get('/driver/my-rides', protect, getMyRides);

router.route('/:id')
  .get(getRideById)
  .delete(protect, cancelRide);

export default router;
