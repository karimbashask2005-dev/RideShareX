import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleType: { 
    type: String, 
    enum: ['Sedan', 'SUV', 'Hatchback', 'Compact', 'Bike', 'Motorcycle', 'Scooter', 'Scooty', 'Other'], 
    required: true 
  },
  vehicleModel: { type: String, required: true }, // e.g. Honda City, Maruti Swift
  vehicleNumber: { type: String, required: true }, // e.g. TS 09 EX 8888
  vehicleImage: { type: String, default: '' },
  seatsAvailable: { type: Number, required: true, min: 1, max: 8 },
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  }
}, {
  timestamps: true
});

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
