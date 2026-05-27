import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  reviewerRole: { type: String, enum: ['passenger', 'driver'], required: true }
}, {
  timestamps: true
});

export const Review = mongoose.model('Review', reviewSchema);
