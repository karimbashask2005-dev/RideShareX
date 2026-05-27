import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
  bio: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  preferredLanguage: { type: String, default: 'English' },
  city: { type: String, default: '' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' },
  role: { type: String, enum: ['passenger', 'driver', 'admin'], default: 'passenger' },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  subscription: {
    plan: { type: String, enum: ['free', 'plus', 'premium'], default: 'free' },
    expiresAt: { type: Date, default: null }
  },
  referralCode: { type: String, unique: true },
  referredBy: { type: String, default: '' },
  walletBalance: { type: Number, default: 0 },
  completedRidesCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 5.0 },
  ratingCount: { type: Number, default: 0 },
  trustScore: { type: Number, default: 20 },
  isIdentityVerified: { type: Boolean, default: false },
  isDriverVerified: { type: Boolean, default: false },
  isVehicleVerified: { type: Boolean, default: false },
  verificationStatus: { 
    type: String, 
    enum: ['none', 'pending', 'verified', 'rejected'], 
    default: 'none' 
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
