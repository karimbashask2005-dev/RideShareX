import { User } from '../models/User.js';
import { Ride } from '../models/Ride.js';
import { Booking } from '../models/Booking.js';
import { Ad } from '../models/Ad.js';
import { Wallet } from '../models/Wallet.js';
import { VerificationDocument } from '../models/VerificationDocument.js';
import { DriverVerification } from '../models/DriverVerification.js';
import { Vehicle } from '../models/Vehicle.js';

// Global system configs store in memory for simplicity fallback
let systemSettings = {
  commissionRate: 12,
  referralReward: 100
};

// @desc    Get dashboard analytics numbers
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRides = await Ride.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalPassengers = await User.countDocuments({ role: 'passenger' });

    const bookings = await Booking.find({ status: 'confirmed' });
    const totalGrossBookingAmount = bookings.reduce((sum, b) => sum + b.fareAmount, 0);
    const totalCommissionEarned = bookings.reduce((sum, b) => sum + b.platformFee, 0);
    const totalDriverPayouts = totalGrossBookingAmount; // Driver earns fare amount

    const ads = await Ad.find();
    const adRevenue = ads.reduce((sum, ad) => sum + (ad.clicks * 5), 0);

    const subscriptionRevenue = await User.countDocuments({ 'subscription.plan': { $ne: 'free' } }) * 199;
    const referralBonusesIssued = await User.countDocuments({ referredBy: { $ne: '' } }) * 100;

    const monthlyRevenue = [
      { month: 'Dec', bookings: 12000, commission: 1440, subscriptions: 800 },
      { month: 'Jan', bookings: 18000, commission: 2160, subscriptions: 1200 },
      { month: 'Feb', bookings: 25000, commission: 3000, subscriptions: 1500 },
      { month: 'Mar', bookings: 32000, commission: 3840, subscriptions: 2000 },
      { month: 'Apr', bookings: 40000, commission: 4800, subscriptions: 2400 },
      { month: 'May', bookings: totalGrossBookingAmount, commission: totalCommissionEarned, subscriptions: subscriptionRevenue }
    ];

    res.json({
      stats: {
        totalUsers,
        totalDrivers,
        totalPassengers,
        totalRides,
        totalBookings,
        totalGrossBookingAmount,
        totalCommissionEarned,
        totalDriverPayouts,
        subscriptionRevenue,
        adRevenue,
        referralBonusesIssued,
        commissionRate: systemSettings.commissionRate
      },
      monthlyRevenue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (suspend/activate)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin only)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'System administrators cannot be suspended' });
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update system configuration settings
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
export const updateSettings = async (req, res, next) => {
  try {
    const { commissionRate, referralReward } = req.body;
    
    systemSettings.commissionRate = Number(commissionRate) || systemSettings.commissionRate;
    systemSettings.referralReward = Number(referralReward) || systemSettings.referralReward;

    res.json({
      commissionRate: systemSettings.commissionRate,
      referralReward: systemSettings.referralReward
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create advertisement campaign
// @route   POST /api/admin/ads
// @access  Private (Admin only)
export const createAd = async (req, res, next) => {
  try {
    const { title, imageUrl, linkUrl, position } = req.body;
    const ad = new Ad({
      title,
      imageUrl,
      linkUrl,
      position,
      status: 'active',
      clicks: 0
    });
    const createdAd = await ad.save();
    res.status(201).json(createdAd);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all ad campaigns
// @route   GET /api/admin/ads
// @access  Private (Admin only)
export const getAdminAds = async (req, res, next) => {
  try {
    const ads = await Ad.find();
    res.json(ads);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending verification document requests
// @route   GET /api/admin/verifications/pending
// @access  Private (Admin only)
export const getPendingVerifications = async (req, res, next) => {
  try {
    const idDocs = await VerificationDocument.find({ status: 'pending' }).populate('user', 'name email');
    const driverDocs = await DriverVerification.find({ status: 'pending' }).populate('user', 'name email');
    const vehicleDocs = await Vehicle.find({ status: 'pending' }).populate('driver', 'name email');

    res.json({
      idDocuments: idDocs,
      driverDocuments: driverDocs,
      vehicleDocuments: vehicleDocs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a specific user document
// @route   PUT /api/admin/verifications/:id/approve
// @access  Private (Admin only)
export const approveVerification = async (req, res, next) => {
  try {
    const { docType } = req.body; // 'identity' | 'driver' | 'vehicle'
    const id = req.params.id;

    if (docType === 'identity') {
      const doc = await VerificationDocument.findById(id);
      if (!doc) return res.status(404).json({ message: 'Document not found' });
      doc.status = 'verified';
      await doc.save();

      const user = await User.findById(doc.user);
      user.isIdentityVerified = true;
      user.trustScore = Math.min(100, user.trustScore + 30);
      user.verificationStatus = 'verified';
      await user.save();
      res.json({ message: 'Identity document approved', doc, user });
    } 
    
    else if (docType === 'driver') {
      const doc = await DriverVerification.findById(id);
      if (!doc) return res.status(404).json({ message: 'License document not found' });
      doc.status = 'verified';
      await doc.save();

      const user = await User.findById(doc.user);
      user.isDriverVerified = true;
      user.trustScore = Math.min(100, user.trustScore + 30);
      user.role = 'driver'; // Upgrade user role to driver
      await user.save();
      res.json({ message: 'Driver license approved', doc, user });
    } 
    
    else if (docType === 'vehicle') {
      const doc = await Vehicle.findById(id);
      if (!doc) return res.status(404).json({ message: 'Vehicle profile not found' });
      doc.status = 'verified';
      await doc.save();

      const user = await User.findById(doc.driver);
      user.isVehicleVerified = true;
      user.trustScore = Math.min(100, user.trustScore + 20);
      await user.save();
      res.json({ message: 'Vehicle RC approved', doc, user });
    } else {
      res.status(400).json({ message: 'Invalid verification type' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a specific user verification document
// @route   PUT /api/admin/verifications/:id/reject
// @access  Private (Admin only)
export const rejectVerification = async (req, res, next) => {
  try {
    const { docType, reason } = req.body; // 'identity' | 'driver' | 'vehicle'
    const id = req.params.id;

    if (docType === 'identity') {
      const doc = await VerificationDocument.findById(id);
      if (!doc) return res.status(404).json({ message: 'Document not found' });
      doc.status = 'rejected';
      doc.rejectionReason = reason || 'Document image unclear or number mismatch.';
      await doc.save();

      const user = await User.findById(doc.user);
      user.isIdentityVerified = false;
      user.verificationStatus = 'rejected';
      await user.save();
      res.json({ message: 'Identity document rejected', doc, user });
    } 
    
    else if (docType === 'driver') {
      const doc = await DriverVerification.findById(id);
      if (!doc) return res.status(404).json({ message: 'License document not found' });
      doc.status = 'rejected';
      doc.rejectionReason = reason || 'License expired or name mismatch.';
      await doc.save();

      const user = await User.findById(doc.user);
      user.isDriverVerified = false;
      user.verificationStatus = 'rejected';
      await user.save();
      res.json({ message: 'Driver license rejected', doc, user });
    } 
    
    else if (docType === 'vehicle') {
      const doc = await Vehicle.findById(id);
      if (!doc) return res.status(404).json({ message: 'Vehicle RC profile not found' });
      doc.status = 'rejected';
      await doc.save();

      const user = await User.findById(doc.driver);
      user.isVehicleVerified = false;
      await user.save();
      res.json({ message: 'Vehicle RC rejected', doc, user });
    } else {
      res.status(400).json({ message: 'Invalid verification type' });
    }
  } catch (error) {
    next(error);
  }
};
