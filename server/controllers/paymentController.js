import { Wallet } from '../models/Wallet.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';

// @desc    Get current wallet balance & ledger transaction logs
// @route   GET /api/wallet
// @access  Private
export const getMyWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 0, transactions: [] });
    }
    
    // Sort transactions reverse chronological
    const sortedTransactions = [...wallet.transactions].sort((a, b) => b.createdAt - a.createdAt);
    
    res.json({
      balance: wallet.balance,
      transactions: sortedTransactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add funds to wallet (simulated success)
// @route   POST /api/wallet/add-money
// @access  Private
export const addMoneyWallet = async (req, res, next) => {
  try {
    const { amount } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Profile not found' });

    user.walletBalance += Number(amount);
    await user.save();

    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      wallet = new Wallet({ user: user._id, balance: 0, transactions: [] });
    }

    wallet.balance = user.walletBalance;
    wallet.transactions.push({
      transactionId: 'tx_rzp_' + Math.floor(100000 + Math.random() * 900000),
      amount: Number(amount),
      type: 'credit',
      description: 'Funds loaded via Razorpay checkout signature verification'
    });
    await wallet.save();

    res.json({ balance: wallet.balance });
  } catch (error) {
    next(error);
  }
};

// @desc    Purchase Plus/Premium membership
// @route   POST /api/subscriptions/subscribe
// @access  Private
export const subscribePlan = async (req, res, next) => {
  try {
    const { plan, price } = req.body;

    const user = await User.findById(req.user._id);
    if (user.walletBalance < price) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct from wallet
    user.walletBalance -= price;
    user.subscription = {
      plan,
      expiresAt: new Date(Date.now() + 30 * 86400000) // 30 days expiry
    };
    await user.save();

    // Record subscription
    const subscription = new Subscription({
      user: user._id,
      plan,
      price,
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 86400000)
    });
    await subscription.save();

    // Record wallet ledger transaction
    const wallet = await Wallet.findOne({ user: user._id });
    if (wallet) {
      wallet.balance = user.walletBalance;
      wallet.transactions.push({
        transactionId: 'tx_sub_' + Date.now(),
        amount: price,
        type: 'debit',
        description: `Subscribed to ${plan.toUpperCase()} Club Plan`
      });
      await wallet.save();
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
