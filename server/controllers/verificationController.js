import { User } from '../models/User.js';
import { VerificationDocument } from '../models/VerificationDocument.js';
import { DriverVerification } from '../models/DriverVerification.js';
import { Vehicle } from '../models/Vehicle.js';

// @desc    Submit government ID proof (Aadhaar/PAN/Passport)
// @route   POST /api/verification/document
// @access  Private
export const uploadIdDocument = async (req, res, next) => {
  try {
    const { docType, docNumber, docImage } = req.body;

    const existingDoc = await VerificationDocument.findOne({ user: req.user._id, docType });
    if (existingDoc && existingDoc.status === 'verified') {
      return res.status(400).json({ message: `Your ${docType} ID is already verified.` });
    }

    // Save or update document
    let doc = await VerificationDocument.findOne({ user: req.user._id, docType });
    if (doc) {
      doc.docNumber = docNumber;
      doc.docImage = docImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200';
      doc.status = 'pending';
      doc.rejectionReason = '';
      await doc.save();
    } else {
      doc = new VerificationDocument({
        user: req.user._id,
        docType,
        docNumber,
        docImage: docImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200',
        status: 'pending'
      });
      await doc.save();
    }

    // Update user verification status to pending
    const user = await User.findById(req.user._id);
    user.verificationStatus = 'pending';
    await user.save();

    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit driver license & vehicle proofs
// @route   POST /api/verification/driver
// @access  Private
export const uploadDriverProof = async (req, res, next) => {
  try {
    const { licenseNumber, licenseImage, rcNumber, rcImage, insuranceImage, pollutionImage, vehicleType, vehicleModel, vehicleNumber, seatsAvailable } = req.body;

    // 1. Save Driver Verification proofs
    let driverProof = await DriverVerification.findOne({ user: req.user._id });
    if (driverProof) {
      driverProof.licenseNumber = licenseNumber;
      driverProof.licenseImage = licenseImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200';
      driverProof.rcNumber = rcNumber;
      driverProof.rcImage = rcImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200';
      driverProof.insuranceImage = insuranceImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200';
      driverProof.pollutionImage = pollutionImage || '';
      driverProof.status = 'pending';
      driverProof.rejectionReason = '';
      await driverProof.save();
    } else {
      driverProof = new DriverVerification({
        user: req.user._id,
        licenseNumber,
        licenseImage: licenseImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200',
        rcNumber,
        rcImage: rcImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200',
        insuranceImage: insuranceImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200',
        pollutionImage: pollutionImage || '',
        status: 'pending'
      });
      await driverProof.save();
    }

    // 2. Save Vehicle profile
    let vehicle = await Vehicle.findOne({ driver: req.user._id });
    if (vehicle) {
      vehicle.vehicleType = vehicleType;
      vehicle.vehicleModel = vehicleModel;
      vehicle.vehicleNumber = vehicleNumber;
      vehicle.seatsAvailable = seatsAvailable;
      vehicle.status = 'pending';
      await vehicle.save();
    } else {
      vehicle = new Vehicle({
        driver: req.user._id,
        vehicleType,
        vehicleModel,
        vehicleNumber,
        seatsAvailable,
        status: 'pending'
      });
      await vehicle.save();
    }

    // 3. Update User status
    const user = await User.findById(req.user._id);
    user.verificationStatus = 'pending';
    await user.save();

    res.status(201).json({ driverProof, vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user verification documents and status
// @route   GET /api/verification/status
// @access  Private
export const getVerificationStatus = async (req, res, next) => {
  try {
    const documents = await VerificationDocument.find({ user: req.user._id });
    const driverProof = await DriverVerification.findOne({ user: req.user._id });
    const vehicle = await Vehicle.findOne({ driver: req.user._id });

    res.json({
      verificationStatus: req.user.verificationStatus,
      isIdentityVerified: req.user.isIdentityVerified,
      isDriverVerified: req.user.isDriverVerified,
      isVehicleVerified: req.user.isVehicleVerified,
      trustScore: req.user.trustScore,
      documents,
      driverProof,
      vehicle
    });
  } catch (error) {
    next(error);
  }
};
