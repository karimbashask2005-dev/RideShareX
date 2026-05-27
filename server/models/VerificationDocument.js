import mongoose from 'mongoose';

const verificationDocumentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  docType: { 
    type: String, 
    enum: ['Aadhaar', 'PAN', 'Passport', 'VoterID', 'DrivingLicense'], 
    required: true 
  },
  docNumber: { type: String, required: true },
  docImage: { type: String, required: true }, // Cloudinary URL or mock base64
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  rejectionReason: { type: String, default: '' }
}, {
  timestamps: true
});

export const VerificationDocument = mongoose.model('VerificationDocument', verificationDocumentSchema);
