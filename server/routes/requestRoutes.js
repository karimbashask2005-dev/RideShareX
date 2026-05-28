import express from 'express';
import {
  createRequest,
  getRequests,
  getMyRequests,
  submitOffer,
  acceptOffer,
  rejectOffer
} from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All travel request routes require authentication
router.use(protect);

router.route('/')
  .post(createRequest)
  .get(getRequests);

router.get('/passenger/my-requests', getMyRequests);
router.post('/:id/offer', submitOffer);
router.put('/:id/offers/:offerId/accept', acceptOffer);
router.put('/:id/offers/:offerId/reject', rejectOffer);

export default router;
