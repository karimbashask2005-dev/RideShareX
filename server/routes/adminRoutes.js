import express from 'express';
import { 
  getAdminStats, getAdminUsers, toggleUserStatus, 
  updateSettings, createAd, getAdminAds,
  getPendingVerifications, approveVerification, rejectVerification
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/settings', updateSettings);
router.route('/ads')
  .get(getAdminAds)
  .post(createAd);

router.get('/verifications/pending', getPendingVerifications);
router.put('/verifications/:id/approve', approveVerification);
router.put('/verifications/:id/reject', rejectVerification);

export default router;
