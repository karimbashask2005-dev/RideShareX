import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, required: true },
  position: { type: String, enum: ['dashboard', 'homepage', 'search'], default: 'dashboard' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  clicks: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Ad = mongoose.model('Ad', adSchema);
