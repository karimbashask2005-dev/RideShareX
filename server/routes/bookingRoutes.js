import express from 'express';
import { 
  createBooking, getMyBookings, 
  getDriverRequests, updateBookingStatus 
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/passenger/my-bookings', protect, getMyBookings);
router.get('/driver/requests', protect, getDriverRequests);
router.put('/:id/status', protect, updateBookingStatus);

export default router;
