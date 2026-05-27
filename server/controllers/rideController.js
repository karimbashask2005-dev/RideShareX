import { Ride } from '../models/Ride.js';
import { User } from '../models/User.js';

// @desc    Publish a new ride listing
// @route   POST /api/rides
// @access  Private (Driver/Admin)
export const createRide = async (req, res, next) => {
  try {
    const { 
      sourceCity, destinationCity, pickupPoint, dropPoint, intermediateStops,
      date, departureTime, estimatedArrivalTime, totalSeats, pricePerSeat,
      vehicleType, vehicleModel, vehicleNumber, luggageAllowed, womenOnly,
      smokingAllowed, petsAllowed, description, instantBooking,
      sourceState, sourceDistrict, sourceLandmark,
      destState, destDistrict, destLandmark, isTownOrVillage,
      sourceLat, sourceLon, destLat, destLon
    } = req.body;
    // Verify driver status
    const user = await User.findById(req.user._id);
    if (!user.isIdentityVerified || !user.isDriverVerified) {
      return res.status(400).json({ message: 'Identity and driver verification is required to publish a ride.' });
    }

    const ride = new Ride({
      driver: req.user._id,
      sourceCity,
      destinationCity,
      pickupPoint,
      dropPoint,
      intermediateStops: intermediateStops ? (Array.isArray(intermediateStops) ? intermediateStops : intermediateStops.split(',').map(s => s.trim())) : [],
      date,
      departureTime,
      estimatedArrivalTime,
      availableSeats: totalSeats,
      totalSeats,
      pricePerSeat,
      vehicleType,
      vehicleModel,
      vehicleNumber,
      luggageAllowed,
      womenOnly,
      smokingAllowed,
      petsAllowed,
      description,
      instantBooking,
      sourceState: sourceState || '',
      sourceDistrict: sourceDistrict || '',
      sourceLandmark: sourceLandmark || '',
      destState: destState || '',
      destDistrict: destDistrict || '',
      destLandmark: destLandmark || '',
      isTownOrVillage: !!isTownOrVillage,
      sourceLat: sourceLat || 17.3850,
      sourceLon: sourceLon || 78.4867,
      destLat: destLat || 16.3067,
      destLon: destLon || 80.4365
    });

    const createdRide = await ride.save();
    res.status(201).json(createdRide);
  } catch (error) {
    next(error);
  }
};

// @desc    Search ride listings with filters
// @route   GET /api/rides
// @access  Public
export const searchRides = async (req, res, next) => {
  try {
    const { source, destination, date, seats, maxPrice, womenOnly, instant, sort } = req.query;

    const query = { status: 'active' };

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
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }
    if (date) {
      query.date = date;
    }
    
    const requiredSeats = Number(seats) || 1;
    query.availableSeats = { $gte: requiredSeats };

    if (womenOnly === 'true') {
      query.womenOnly = true;
    }
    if (instant === 'true') {
      query.instantBooking = true;
    }
    if (maxPrice) {
      query.pricePerSeat = { $lte: Number(maxPrice) };
    }

    let searchResult = Ride.find(query).populate('driver', 'name avatar averageRating isPhoneVerified');

    // Sorting
    if (sort === 'price_low') {
      searchResult = searchResult.sort({ pricePerSeat: 1 });
    } else if (sort === 'price_high') {
      searchResult = searchResult.sort({ pricePerSeat: -1 });
    } else if (sort === 'departure') {
      searchResult = searchResult.sort({ departureTime: 1 });
    }

    const rides = await searchResult;
    
    // Format response to match frontend expects
    const formattedRides = rides.map(r => ({
      id: r._id,
      driverId: r.driver._id,
      driverName: r.driver.name,
      driverAvatar: r.driver.avatar,
      driverRating: r.driver.averageRating,
      driverVerified: r.driver.isPhoneVerified,
      sourceCity: r.sourceCity,
      destinationCity: r.destinationCity,
      pickupPoint: r.pickupPoint,
      dropPoint: r.dropPoint,
      intermediateStops: r.intermediateStops,
      date: r.date,
      departureTime: r.departureTime,
      estimatedArrivalTime: r.estimatedArrivalTime,
      availableSeats: r.availableSeats,
      totalSeats: r.totalSeats,
      pricePerSeat: r.pricePerSeat,
      vehicleType: r.vehicleType,
      vehicleModel: r.vehicleModel,
      vehicleNumber: r.vehicleNumber,
      luggageAllowed: r.luggageAllowed,
      womenOnly: r.womenOnly,
      smokingAllowed: r.smokingAllowed,
      petsAllowed: r.petsAllowed,
      description: r.description,
      instantBooking: r.instantBooking,
      status: r.status
    }));

    res.json(formattedRides);
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed ride information
// @route   GET /api/rides/:id
// @access  Public
export const getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driver', 'name avatar averageRating completedRidesCount isPhoneVerified bio phone');
    if (!ride) {
      return res.status(404).json({ message: 'Ride listing not found' });
    }
    
    res.json({
      id: ride._id,
      driverId: ride.driver._id,
      driverName: ride.driver.name,
      driverAvatar: ride.driver.avatar,
      driverRating: ride.driver.averageRating,
      driverVerified: ride.driver.isPhoneVerified,
      completedRidesCount: ride.driver.completedRidesCount,
      sourceCity: ride.sourceCity,
      destinationCity: ride.destinationCity,
      pickupPoint: ride.pickupPoint,
      dropPoint: ride.dropPoint,
      intermediateStops: ride.intermediateStops,
      date: ride.date,
      departureTime: ride.departureTime,
      estimatedArrivalTime: ride.estimatedArrivalTime,
      availableSeats: ride.availableSeats,
      totalSeats: ride.totalSeats,
      pricePerSeat: ride.pricePerSeat,
      vehicleType: ride.vehicleType,
      vehicleModel: ride.vehicleModel,
      vehicleNumber: ride.vehicleNumber,
      luggageAllowed: ride.luggageAllowed,
      womenOnly: ride.womenOnly,
      smokingAllowed: ride.smokingAllowed,
      petsAllowed: ride.petsAllowed,
      description: ride.description,
      instantBooking: ride.instantBooking,
      status: ride.status,
      driverProfile: ride.driver,
      reviews: [] // Testimonials fetched dynamically if reviews are stored separately
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active ride offerings for logged in driver
// @route   GET /api/rides/driver/my-rides
// @access  Private
export const getMyRides = async (req, res, next) => {
  try {
    const rides = await Ride.find({ driver: req.user._id });
    const formatted = rides.map(r => ({
      id: r._id,
      driverId: req.user._id,
      sourceCity: r.sourceCity,
      destinationCity: r.destinationCity,
      pickupPoint: r.pickupPoint,
      dropPoint: r.dropPoint,
      date: r.date,
      departureTime: r.departureTime,
      pricePerSeat: r.pricePerSeat,
      availableSeats: r.availableSeats,
      totalSeats: r.totalSeats,
      status: r.status
    }));
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a ride listing
// @route   DELETE /api/rides/:id
// @access  Private
export const cancelRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    
    if (ride.driver.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(451).json({ message: 'Not authorized to modify this ride' });
    }

    ride.status = 'cancelled';
    await ride.save();
    res.json({ message: 'Ride cancelled successfully' });
  } catch (error) {
    next(error);
  }
};
