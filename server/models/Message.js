import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatRoom: { type: String, required: true }, // e.g. room_rideId_passengerId
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Message = mongoose.model('Message', messageSchema);
