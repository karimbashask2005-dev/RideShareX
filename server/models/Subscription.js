import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'plus', 'premium'], required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active', 'expired'], default: 'active' },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
