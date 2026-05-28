import mongoose from 'mongoose';

const travelRequestSchema = new mongoose.Schema({
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sourceCity: { type: String, required: true },
  sourceState: { type: String, default: '' },
  sourceDistrict: { type: String, default: '' },
  sourceLandmark: { type: String, default: '' },
  destinationCity: { type: String, required: true },
  destState: { type: String, default: '' },
  destDistrict: { type: String, default: '' },
  destLandmark: { type: String, default: '' },
  sourceLat: { type: Number, default: 17.3850 },
  sourceLon: { type: Number, default: 78.4867 },
  destLat: { type: Number, default: 16.3067 },
  destLon: { type: Number, default: 80.4365 },
  pickupPoint: { type: String, required: true },
  dropPoint: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  preferredTime: { type: String, required: true },
  seatsNeeded: { type: Number, required: true },
  budget: { type: Number, required: true },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['open', 'accepted', 'confirmed', 'cancelled', 'completed'], default: 'open' },
  offers: [{
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleType: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    vehicleNumber: { type: String, default: '' },
    fare: { type: Number, required: true },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export const TravelRequest = mongoose.model('TravelRequest', travelRequestSchema);
