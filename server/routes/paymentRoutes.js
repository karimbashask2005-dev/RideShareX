import express from 'express';
import { getMyWallet, addMoneyWallet, subscribePlan } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/wallet', protect, getMyWallet);
router.post('/wallet/add-money', protect, addMoneyWallet);
router.post('/subscriptions/subscribe', protect, subscribePlan);

export default router;
