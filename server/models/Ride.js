import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sourceCity: { type: String, required: true },
  sourceState: { type: String, default: '' },
  sourceDistrict: { type: String, default: '' },
  sourceLandmark: { type: String, default: '' },
  destinationCity: { type: String, required: true },
  destState: { type: String, default: '' },
  destDistrict: { type: String, default: '' },
  destLandmark: { type: String, default: '' },
  isTownOrVillage: { type: Boolean, default: false },
  sourceLat: { type: Number, default: 17.3850 },
  sourceLon: { type: Number, default: 78.4867 },
  destLat: { type: Number, default: 16.3067 },
  destLon: { type: Number, default: 80.4365 },
  pickupPoint: { type: String, required: true },
  dropPoint: { type: String, required: true },
  intermediateStops: [{ type: String }],
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  departureTime: { type: String, required: true },
  estimatedArrivalTime: { type: String, required: true },
  availableSeats: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  pricePerSeat: { type: Number, required: true },
  vehicleType: { type: String, enum: ['Sedan', 'SUV', 'Hatchback', 'Compact', 'Bike', 'Motorcycle', 'Scooter', 'Scooty', 'Other'], default: 'Sedan' },
  vehicleModel: { type: String, required: true },
  vehicleNumber: { type: String, default: '' },
  luggageAllowed: { type: Boolean, default: true },
  womenOnly: { type: Boolean, default: false },
  smokingAllowed: { type: Boolean, default: false },
  petsAllowed: { type: Boolean, default: false },
  description: { type: String, default: '' },
  instantBooking: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
}, {
  timestamps: true
});

export const Ride = mongoose.model('Ride', rideSchema);
