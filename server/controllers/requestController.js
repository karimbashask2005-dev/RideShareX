import { TravelRequest } from '../models/TravelRequest.js';
import { Ride } from '../models/Ride.js';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';

// @desc    Create a new travel request (Pre-book)
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res, next) => {
  try {
    const { 
      sourceCity, destinationCity, pickupPoint, dropPoint,
      date, preferredTime, seatsNeeded, budget, notes,
      sourceState, sourceDistrict, sourceLandmark,
      destState, destDistrict, destLandmark,
      sourceLat, sourceLon, destLat, destLon
    } = req.body;

    const travelRequest = new TravelRequest({
      passenger: req.user._id,
      sourceCity,
      destinationCity,
      pickupPoint,
      dropPoint,
      date,
      preferredTime,
      seatsNeeded: Number(seatsNeeded),
      budget: Number(budget),
      notes,
      sourceState: sourceState || '',
      sourceDistrict: sourceDistrict || '',
      sourceLandmark: sourceLandmark || '',
      destState: destState || '',
      destDistrict: destDistrict || '',
      destLandmark: destLandmark || '',
      sourceLat: Number(sourceLat) || 17.3850,
      sourceLon: Number(sourceLon) || 78.4867,
      destLat: Number(destLat) || 16.3067,
      destLon: Number(destLon) || 80.4365
    });

    const savedRequest = await travelRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    next(error);
  }
};

// @desc    Get passenger travel requests for drivers to browse
// @route   GET /api/requests
// @access  Private
export const getRequests = async (req, res, next) => {
  try {
    const { source, destination, date } = req.query;
    const query = { status: 'open' };

    const andConditions = [];
    if (source) {
      andConditions.push({
        $or: [
          { sourceCity: { $regex: source, $options: 'i' } },
          { sourceState: { $regex: source, $options: 'i' } },
          { sourceDistrict: { $regex: source, $options: 'i' } },
          { sourceLandmark: { $regex: source, $options: 'i' } }
        ]
      });
    }
    if (destination) {
      andConditions.push({
        $or: [
          { destinationCity: { $regex: destination, $options: 'i' } },
          { destState: { $regex: destination, $options: 'i' } },
          { destDistrict: { $regex: destination, $options: 'i' } },
          { destLandmark: { $regex: destination, $options: 'i' } }
        ]
      });
    }
    if (date) {
      query.date = date;
    }
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const requests = await TravelRequest.find(query)
      .populate('passenger', 'name avatar averageRating')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Get passenger's own requests
// @route   GET /api/requests/passenger/my-requests
// @access  Private
export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await TravelRequest.find({ passenger: req.user._id })
      .populate('passenger', 'name avatar')
      .populate('offers.driver', 'name avatar averageRating phone');
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Driver submits an offer to passenger request
// @route   POST /api/requests/:id/offer
// @access  Private
export const submitOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vehicleType, vehicleModel, vehicleNumber, fare, notes } = req.body;

    const request = await TravelRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Travel request not found' });
    if (request.status !== 'open') return res.status(400).json({ message: 'Request is no longer open' });

    // Check if driver already made an offer
    const alreadyOffered = request.offers.some(o => o.driver.toString() === req.user._id.toString());
    if (alreadyOffered) return res.status(400).json({ message: 'You have already submitted an offer for this request' });

    request.offers.push({
      driver: req.user._id,
      vehicleType,
      vehicleModel,
      vehicleNumber,
      fare: Number(fare),
      notes
    });

    await request.save();
    res.json({ message: 'Commute offer sent to passenger successfully', request });
  } catch (error) {
    next(error);
  }
};

// @desc    Passenger accepts driver's offer and pays fare (creating confirmed booking)
// @route   PUT /api/requests/:id/offers/:offerId/accept
// @access  Private
export const acceptOffer = async (req, res, next) => {
  try {
    const { id, offerId } = req.params;

    const request = await TravelRequest.findById(id).populate('passenger');
    if (!request) return res.status(404).json({ message: 'Travel request not found' });
    if (request.passenger._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to manage this request' });
    }
    if (request.status !== 'open') return res.status(400).json({ message: 'Request is already processed' });

    const offer = request.offers.id(offerId);
    if (!offer) return res.status(404).json({ message: 'Commute offer not found' });

    // Calculate totals
    const totalFare = offer.fare * request.seatsNeeded;
    const platformFee = Math.round(totalFare * 0.12);
    const totalPrice = totalFare + platformFee;

    // Check wallet balance
    const user = await User.findById(req.user._id);
    if (user.walletBalance < totalPrice) {
      return res.status(400).json({ message: 'Insufficient wallet balance. Please add funds.' });
    }

    // Deduct from wallet
    user.walletBalance -= totalPrice;
    await user.save();

    // Log transaction
    const wallet = await Wallet.findOne({ user: user._id });
    if (wallet) {
      wallet.balance = user.walletBalance;
      wallet.transactions.push({
        transactionId: 'tx_req_' + Date.now(),
        amount: totalPrice,
        type: 'debit',
        description: `Pre-booked travel request booking to ${request.destinationCity}`
      });
      await wallet.save();
    }

    // Create virtual Ride document
    const ride = new Ride({
      driver: offer.driver,
      sourceCity: request.sourceCity,
      sourceState: request.sourceState,
      sourceDistrict: request.sourceDistrict,
      sourceLandmark: request.sourceLandmark,
      destinationCity: request.destinationCity,
      destState: request.destState,
      destDistrict: request.destDistrict,
      destLandmark: request.destLandmark,
      isTownOrVillage: !!(request.sourceLandmark || request.destLandmark),
      sourceLat: request.sourceLat,
      sourceLon: request.sourceLon,
      destLat: request.destLat,
      destLon: request.destLon,
      pickupPoint: request.pickupPoint,
      dropPoint: request.dropPoint,
      date: request.date,
      departureTime: request.preferredTime,
      estimatedArrivalTime: 'TBD',
      availableSeats: 0,
      totalSeats: request.seatsNeeded,
      pricePerSeat: offer.fare,
      vehicleType: offer.vehicleType,
      vehicleModel: offer.vehicleModel,
      vehicleNumber: offer.vehicleNumber,
      status: 'active'
    });
    await ride.save();

    // Create confirmed booking reference
    const bookingRef = 'RSX' + Math.floor(100000 + Math.random() * 900000);
    const booking = new Booking({
      bookingRef,
      ride: ride._id,
      passenger: request.passenger._id,
      seatsBooked: request.seatsNeeded,
      pickupPoint: request.pickupPoint,
      dropPoint: request.dropPoint,
      totalPrice,
      fareAmount: totalFare,
      platformFee,
      notes: offer.notes,
      status: 'confirmed',
      paymentStatus: 'success'
    });
    await booking.save();

    // Update statuses on request and offers
    request.status = 'confirmed';
    request.offers.forEach(o => {
      if (o._id.toString() === offerId) {
        o.status = 'accepted';
      } else {
        o.status = 'rejected';
      }
    });

    await request.save();

    res.json({ message: 'Offer accepted! Ride pre-booking confirmed.', booking, request });
  } catch (error) {
    next(error);
  }
};

// @desc    Passenger rejects driver's offer
// @route   PUT /api/requests/:id/offers/:offerId/reject
// @access  Private
export const rejectOffer = async (req, res, next) => {
  try {
    const { id, offerId } = req.params;

    const request = await TravelRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Travel request not found' });
    if (request.passenger.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to manage this request' });
    }

    const offer = request.offers.id(offerId);
    if (!offer) return res.status(404).json({ message: 'Commute offer not found' });

    offer.status = 'rejected';
    await request.save();

    res.json({ message: 'Driver offer declined', request });
  } catch (error) {
    next(error);
  }
};
