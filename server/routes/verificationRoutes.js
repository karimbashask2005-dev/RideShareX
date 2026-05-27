import express from 'express';
import { uploadIdDocument, uploadDriverProof, getVerificationStatus } from '../controllers/verificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/document', uploadIdDocument);
router.post('/driver', uploadDriverProof);
router.get('/status', getVerificationStatus);

export default router;
