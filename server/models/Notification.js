import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['booking_request', 'booking_approval', 'booking_rejection', 'ride_cancellation', 'trip_reminder', 'message_received', 'payment_success', 'refund_processed', 'dispute', 'general'], 
    default: 'general' 
  },
  read: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema);
