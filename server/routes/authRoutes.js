import express from 'express';
import { 
  registerUser, authUser, getMyProfile, 
  completeProfile, verifyPhoneOtp, verifyEmailLink 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => res.json({ status: 'OK' }));

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getMyProfile);
router.post('/complete-profile', protect, completeProfile);
router.post('/verify-phone', protect, verifyPhoneOtp);
router.post('/verify-email', protect, verifyEmailLink);

export default router;
