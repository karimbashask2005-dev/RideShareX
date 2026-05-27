import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingRef: { type: String, required: true, unique: true },
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seatsBooked: { type: Number, required: true },
  pickupPoint: { type: String, required: true },
  dropPoint: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  fareAmount: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  notes: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'success', 'failed', 'refunded'], 
    default: 'pending' 
  }
}, {
  timestamps: true
});

export const Booking = mongoose.model('Booking', bookingSchema);
