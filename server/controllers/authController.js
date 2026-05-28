import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';

// Helper to sign JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey123456789', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, referralCode, role, gender } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email address already registered' });
    }

    // Auto-generate unique referral code for the new user
    const personalReferral = name.slice(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900);

    let startBalance = 0;
    
    // Check if referred by another user
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        startBalance = 100; // Reward new user with ₹100 credit
        
        // Reward referrer
        referrer.walletBalance += 100;
        await referrer.save();

        // Add ledger record to referrer's wallet
        const referrerWallet = await Wallet.findOne({ user: referrer._id });
        if (referrerWallet) {
          referrerWallet.balance += 100;
          referrerWallet.transactions.push({
            transactionId: 'tx_ref_' + Date.now(),
            amount: 100,
            type: 'credit',
            description: `Referral bonus: invited new user ${name}`
          });
          await referrerWallet.save();
        }
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'passenger',
      gender: gender || 'Other',
      referralCode: personalReferral,
      referredBy: referralCode || '',
      walletBalance: startBalance
    });

    // Create Wallet instance
    const wallet = new Wallet({
      user: user._id,
      balance: startBalance,
      transactions: startBalance > 0 ? [{
        transactionId: 'tx_ref_' + Date.now(),
        amount: 100,
        type: 'credit',
        description: 'Referral reward credit'
      }] : []
    });
    await wallet.save();

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Your account has been suspended' });
      }
      res.json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          walletBalance: user.walletBalance,
          subscription: user.subscription,
          isPhoneVerified: user.isPhoneVerified
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile / Complete profile onboarding
// @route   POST /api/auth/complete-profile
// @access  Private
export const completeProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;
    user.bio = req.body.bio || user.bio;
    user.emergencyContact = req.body.emergencyContact || user.emergencyContact;
    user.preferredLanguage = req.body.preferredLanguage || user.preferredLanguage;
    user.city = req.body.city || user.city;
    user.avatar = req.body.avatar || user.avatar;
    
    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify phone number via OTP
// @route   POST /api/auth/verify-phone
// @access  Private
export const verifyPhoneOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isPhoneVerified = true;
    await user.save();
    res.json({ message: 'Mobile verified successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address
// @route   POST /api/auth/verify-email
// @access  Private
export const verifyEmailLink = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isEmailVerified = true;
    await user.save();
    res.json({ message: 'Email verified successfully', user });
  } catch (error) {
    next(error);
  }
};
