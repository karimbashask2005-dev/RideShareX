import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['booking_payment', 'wallet_topup', 'wallet_refund', 'subscription_payment'], 
    required: true 
  },
  gateway: { type: String, enum: ['razorpay', 'stripe', 'wallet'], required: true },
  gatewayOrderId: { type: String, default: '' },
  gatewayPaymentId: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' }
}, {
  timestamps: true
});

export const Payment = mongoose.model('Payment', paymentSchema);
