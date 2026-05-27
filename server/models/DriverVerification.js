import mongoose from 'mongoose';

const driverVerificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  licenseNumber: { type: String, required: true },
  licenseImage: { type: String, required: true }, // Cloudinary URL or mock base64
  rcNumber: { type: String, required: true },
  rcImage: { type: String, required: true },
  insuranceImage: { type: String, required: true },
  pollutionImage: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  rejectionReason: { type: String, default: '' }
}, {
  timestamps: true
});

export const DriverVerification = mongoose.model('DriverVerification', driverVerificationSchema);
