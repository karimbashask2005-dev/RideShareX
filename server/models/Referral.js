import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rewardAmount: { type: Number, default: 100 },
  status: { type: String, enum: ['pending', 'credited'], default: 'pending' }
}, {
  timestamps: true
});

export const Referral = mongoose.model('Referral', referralSchema);
