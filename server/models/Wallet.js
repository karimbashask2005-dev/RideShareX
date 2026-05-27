import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: [{
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    description: { type: String, required: true },
    referenceId: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export const Wallet = mongoose.model('Wallet', walletSchema);
