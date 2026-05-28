import { Booking } from '../models/Booking.js';
import { Ride } from '../models/Ride.js';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';

// @desc    Book seat(s) on a ride
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { rideId, seatsBooked, pickupPoint, dropPoint, notes } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride listing not found' });
    
    if (ride.availableSeats < seatsBooked) {
      return res.status(400).json({ message: 'Requested seats exceed available seat limit' });
    }

    const fare = ride.pricePerSeat * seatsBooked;
    const platformFee = Math.round(fare * 0.12);
    const totalPrice = fare + platformFee;

    // Check user wallet
    const user = await User.findById(req.user._id);

    if (user.walletBalance < totalPrice) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct from wallet
    user.walletBalance -= totalPrice;
    await user.save();

    // Update Wallet ledger
    const wallet = await Wallet.findOne({ user: user._id });
    if (wallet) {
      wallet.balance = user.walletBalance;
      wallet.transactions.push({
        transactionId: 'tx_bk_' + Date.now(),
        amount: totalPrice,
        type: 'debit',
        description: `Booking reservation for ride ${ride.sourceCity} to ${ride.destinationCity}`
      });
      await wallet.save();
    }

    const isInstant = ride.instantBooking;
    const bookingStatus = isInstant ? 'confirmed' : 'pending';

    const bookingRef = 'RSX' + Math.floor(100000 + Math.random() * 900000);

    const booking = new Booking({
      bookingRef,
      ride: ride._id,
      passenger: user._id,
      seatsBooked,
      pickupPoint: pickupPoint || ride.pickupPoint,
      dropPoint: dropPoint || ride.dropPoint,
      totalPrice,
      fareAmount: fare,
      platformFee,
      notes,
      status: bookingStatus,
      paymentStatus: 'success'
    });

    const savedBooking = await booking.save();

    // Deduct seats immediately if confirmed
    if (isInstant) {
      ride.availableSeats -= seatsBooked;
      await ride.save();
    }

    res.status(201).json(savedBooking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get passenger booked history
// @route   GET /api/bookings/passenger/my-bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate({
        path: 'ride',
        populate: { path: 'driver', select: 'name avatar phone' }
      });
    
    // Format to matches frontend expect
    const formatted = bookings.map(b => ({
      id: b._id,
      bookingRef: b.bookingRef,
      rideId: b.ride._id,
      rideSource: b.ride.sourceCity,
      rideDestination: b.ride.destinationCity,
      rideDate: b.ride.date,
      rideTime: b.ride.departureTime,
      passengerId: b.passenger,
      seatsBooked: b.seatsBooked,
      pickupPoint: b.pickupPoint,
      dropPoint: b.dropPoint,
      totalPrice: b.totalPrice,
      fareAmount: b.fareAmount,
      platformFee: b.platformFee,
      notes: b.notes,
      status: b.status,
      rideSourceCoords: { lat: b.ride.sourceLat || 17.3850, lon: b.ride.sourceLon || 78.4867 },
      rideDestCoords: { lat: b.ride.destLat || 16.3067, lon: b.ride.destLon || 80.4365 },
      vehicleType: b.ride.vehicleType || 'Car',
      vehicleModel: b.ride.vehicleModel || '',
      vehicleNumber: b.ride.vehicleNumber || '',
      driverName: b.ride.driver.name,
      driverAvatar: b.ride.driver.avatar,
      driverPhone: b.ride.driver.phone
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending booking requests for driver's active rides
// @route   GET /api/bookings/driver/requests
// @access  Private
export const getDriverRequests = async (req, res, next) => {
  try {
    const rides = await Ride.find({ driver: req.user._id });
    const rideIds = rides.map(r => r._id);

    const bookings = await Booking.find({ ride: { $in: rideIds } }).populate('passenger', 'name avatar');
    
    const formatted = bookings.map(b => {
      const ride = rides.find(r => r._id.toString() === b.ride.toString());
      return {
        id: b._id,
        bookingRef: b.bookingRef,
        rideId: b.ride,
        rideSource: ride.sourceCity,
        rideDestination: ride.destinationCity,
        rideDate: ride.date,
        driverId: req.user._id,
        passengerId: b.passenger._id,
        passengerName: b.passenger.name,
        passengerAvatar: b.passenger.avatar,
        seatsBooked: b.seatsBooked,
        pickupPoint: b.pickupPoint,
        dropPoint: b.dropPoint,
        notes: b.notes,
        status: b.status
      };
    });

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject or Cancel booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'confirmed', 'rejected', 'cancelled'
    const booking = await Booking.findById(req.params.id).populate('ride');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const ride = await Ride.findById(booking.ride._id);
    const passenger = await User.findById(booking.passenger);

    const oldStatus = booking.status;

    if (status === 'confirmed') {
      if (ride.availableSeats < booking.seatsBooked) {
        return res.status(400).json({ message: 'Not enough seats available' });
      }
      booking.status = 'confirmed';
      ride.availableSeats -= booking.seatsBooked;
      await ride.save();
      await booking.save();
    } 
    
    else if (status === 'rejected') {
      booking.status = 'rejected';
      booking.paymentStatus = 'refunded';
      await booking.save();

      // Refund passenger wallet
      passenger.walletBalance += booking.totalPrice;
      await passenger.save();

      const passWallet = await Wallet.findOne({ user: passenger._id });
      if (passWallet) {
        passWallet.balance = passenger.walletBalance;
        passWallet.transactions.push({
          transactionId: 'tx_ref_' + Date.now(),
          amount: booking.totalPrice,
          type: 'credit',
          description: `Refund for declined booking ${booking.bookingRef}`
        });
        await passWallet.save();
      }
    } 
    
    else if (status === 'cancelled') {
      booking.status = 'cancelled';
      booking.paymentStatus = 'refunded';
      await booking.save();

      // Put back seats if confirmed previously
      if (oldStatus === 'confirmed') {
        ride.availableSeats += booking.seatsBooked;
        await ride.save();
      }

      // 100% refund logic
      const refundAmount = booking.totalPrice;
      passenger.walletBalance += refundAmount;
      await passenger.save();

      const passWallet = await Wallet.findOne({ user: passenger._id });
      if (passWallet) {
        passWallet.balance = passenger.walletBalance;
        passWallet.transactions.push({
          transactionId: 'tx_ref_' + Date.now(),
          amount: refundAmount,
          type: 'credit',
          description: `Escrow refund for cancelled trip booking ${booking.bookingRef}`
        });
        await passWallet.save();
      }
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};
