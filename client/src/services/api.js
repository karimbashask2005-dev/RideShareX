/**
 * RideShareX API Client & Mock Database
 * Automatically falls back to LocalStorage Mock Database when backend server is offline.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Check if we should use the backend. Default to true, but fallback if server fails
let useBackend = true;

// Helper to check backend health
export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/auth/health`, { method: 'GET' });
    useBackend = res.ok;
    console.log(`[RideShareX API] Backend health check: ${useBackend ? 'ONLINE' : 'OFFLINE (Using Client Mock DB)'}`);
  } catch (err) {
    useBackend = false;
    console.warn('[RideShareX API] Server offline. Falling back to LocalStorage Mock DB.');
  }
};

// Seed Indian Cities Dataset
export const CITIES = [
  'Hyderabad', 'Guntur', 'Vijayawada', 'Warangal', 'Bengaluru', 
  'Chennai', 'Visakhapatnam', 'Tirupati', 'Ongole', 'Nellore',
  'Delhi', 'Mumbai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur'
];

// Initialize Mock DB in LocalStorage
const initMockDB = () => {
  if (!localStorage.getItem('rx_users')) {
    localStorage.setItem('rx_users', JSON.stringify([
      {
        id: 'user_driver_1',
        name: 'Arjun Reddy',
        email: 'arjun@driver.com',
        password: 'password123',
        phone: '+91 9876543210',
        gender: 'Male',
        bio: 'Regular traveler between Guntur and Hyderabad. Friendly and punctual.',
        emergencyContact: '+91 9876543219',
        preferredLanguage: 'Telugu, English',
        city: 'Guntur',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        role: 'driver',
        isEmailVerified: true,
        isPhoneVerified: true,
        status: 'active',
        subscription: { plan: 'premium', expiresAt: '2026-12-31' },
        referralCode: 'ARJ100',
        referredBy: '',
        walletBalance: 2500,
        completedRidesCount: 24,
        averageRating: 4.8,
        ratingCount: 15
      },
      {
        id: 'user_passenger_1',
        name: 'Priya Sharma',
        email: 'priya@passenger.com',
        password: 'password123',
        phone: '+91 8765432109',
        gender: 'Female',
        bio: 'Tech professional commuting weekly.',
        emergencyContact: '+91 8765432100',
        preferredLanguage: 'Hindi, English',
        city: 'Hyderabad',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        role: 'passenger',
        isEmailVerified: true,
        isPhoneVerified: true,
        status: 'active',
        subscription: { plan: 'free', expiresAt: null },
        referralCode: 'PRY100',
        referredBy: 'ARJ100',
        walletBalance: 800,
        completedRidesCount: 6,
        averageRating: 4.9,
        ratingCount: 5
      },
      {
        id: 'user_admin_1',
        name: 'Super Admin',
        email: 'admin@ridesharex.com',
        password: 'adminpassword',
        phone: '+91 9000000001',
        gender: 'Other',
        bio: 'RideShareX Chief Moderator.',
        role: 'admin',
        isEmailVerified: true,
        isPhoneVerified: true,
        status: 'active',
        walletBalance: 15400,
        completedRidesCount: 0,
        averageRating: 5.0,
        ratingCount: 0
      }
    ]));
  }

  if (!localStorage.getItem('rx_rides')) {
    localStorage.setItem('rx_rides', JSON.stringify([
      {
        id: 'ride_1',
        driverId: 'user_driver_1',
        driverName: 'Arjun Reddy',
        driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        driverRating: 4.8,
        driverVerified: true,
        sourceCity: 'Guntur',
        destinationCity: 'Hyderabad',
        pickupPoint: 'Guntur RTC Bus Stand',
        dropPoint: 'LB Nagar Metro Station',
        intermediateStops: ['Vijayawada Highway', 'Suryapet bypass'],
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days later
        departureTime: '06:00 AM',
        estimatedArrivalTime: '11:30 AM',
        availableSeats: 4,
        totalSeats: 4,
        pricePerSeat: 450,
        vehicleType: 'Sedan',
        vehicleModel: 'Honda City',
        vehicleNumber: 'AP 07 CR 4321',
        luggageAllowed: true,
        womenOnly: false,
        smokingAllowed: false,
        petsAllowed: true,
        description: 'Driving back to Hyderabad for work. Clean car, high-speed AC, safe driving ensured. Will stop once for tea.',
        instantBooking: true,
        status: 'active'
      },
      {
        id: 'ride_2',
        driverId: 'user_driver_1',
        driverName: 'Arjun Reddy',
        driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        driverRating: 4.8,
        driverVerified: true,
        sourceCity: 'Hyderabad',
        destinationCity: 'Bengaluru',
        pickupPoint: 'Gachibowli Outer Ring Road',
        dropPoint: 'Hebbal Flyover',
        intermediateStops: ['Kurnool bypass', 'Anantapur'],
        date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], // 4 days later
        departureTime: '10:00 PM',
        estimatedArrivalTime: '07:30 AM',
        availableSeats: 3,
        totalSeats: 3,
        pricePerSeat: 1200,
        vehicleType: 'SUV',
        vehicleModel: 'Mahindra XUV700',
        vehicleNumber: 'TS 09 EX 8888',
        luggageAllowed: true,
        womenOnly: false,
        smokingAllowed: false,
        petsAllowed: false,
        description: 'Night drive to Bangalore. Comfortable seats, dynamic music, sleeping passengers welcome!',
        instantBooking: false,
        status: 'active'
      },
      {
        id: 'ride_3',
        driverId: 'user_driver_1',
        driverName: 'Arjun Reddy',
        driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        driverRating: 4.8,
        driverVerified: true,
        sourceCity: 'Vijayawada',
        destinationCity: 'Guntur',
        pickupPoint: 'Benz Circle',
        dropPoint: 'Guntur RTC Bus Stand',
        intermediateStops: ['Mangalagiri'],
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        departureTime: '09:00 AM',
        estimatedArrivalTime: '10:00 AM',
        availableSeats: 1,
        totalSeats: 1,
        pricePerSeat: 120,
        vehicleType: 'Motorcycle',
        vehicleModel: 'Royal Enfield Classic 350',
        vehicleNumber: 'AP 07 RE 3500',
        luggageAllowed: false,
        womenOnly: false,
        smokingAllowed: false,
        petsAllowed: false,
        description: 'Daily commute to office. Travelling alone on Enfield. Can carry one passenger with a small backpack.',
        instantBooking: true,
        status: 'active'
      }
    ]));
  }

  if (!localStorage.getItem('rx_bookings')) {
    localStorage.setItem('rx_bookings', JSON.stringify([]));
  }

  if (!localStorage.getItem('rx_messages')) {
    localStorage.setItem('rx_messages', JSON.stringify([]));
  }

  if (!localStorage.getItem('rx_notifications')) {
    localStorage.setItem('rx_notifications', JSON.stringify([]));
  }

  if (!localStorage.getItem('rx_settings')) {
    localStorage.setItem('rx_settings', JSON.stringify({
      commissionRate: 12, // 12%
      referralReward: 100, // ₹100
    }));
  }

  if (!localStorage.getItem('rx_ads')) {
    localStorage.setItem('rx_ads', JSON.stringify([
      {
        id: 'ad_1',
        title: 'Upgrade to Plus - Save Booking Fees!',
        imageUrl: 'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&q=80&w=600',
        linkUrl: '/subscription',
        position: 'dashboard',
        clicks: 12,
        status: 'active'
      },
      {
        id: 'ad_2',
        title: 'Ad: Rent Self-Drive Luxury Cars in Hyderabad',
        imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
        linkUrl: 'https://zoomcar.com',
        position: 'search',
        clicks: 8,
        status: 'active'
      }
    ]));
  }

  if (!localStorage.getItem('rx_verification_documents')) {
    localStorage.setItem('rx_verification_documents', JSON.stringify([]));
  }
  if (!localStorage.getItem('rx_driver_verifications')) {
    localStorage.setItem('rx_driver_verifications', JSON.stringify([]));
  }
  if (!localStorage.getItem('rx_vehicles')) {
    localStorage.setItem('rx_vehicles', JSON.stringify([]));
  }

  if (!localStorage.getItem('rx_travel_requests')) {
    localStorage.setItem('rx_travel_requests', JSON.stringify([
      {
        id: 'req_1',
        passengerId: 'user_passenger_1',
        sourceCity: 'Guntur',
        sourceState: 'Andhra Pradesh',
        sourceDistrict: 'Guntur',
        sourceLandmark: 'Guntur RTC Bus Stand',
        destinationCity: 'Hyderabad',
        destState: 'Telangana',
        destDistrict: 'Hyderabad',
        destLandmark: 'JNTU College',
        pickupPoint: 'Guntur RTC Bus Stand',
        dropPoint: 'JNTU College, Hyderabad',
        date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days later
        preferredTime: '10:00 AM',
        seatsNeeded: 2,
        budget: 500,
        notes: 'Travelling with family. Small bags only.',
        status: 'open',
        offers: [],
        createdAt: new Date().toISOString()
      }
    ]));
  }
};

initMockDB();

// Mock database helpers
const getFromStorage = (key) => JSON.parse(localStorage.getItem(key));
const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Unified Fetch API Wrapper
const request = async (url, options = {}) => {
  if (useBackend) {
    let response;
    try {
      const headers = { 'Content-Type': 'application/json', ...options.headers };
      const token = localStorage.getItem('rx_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      response = await fetch(`${API_BASE}${url}`, { ...options, headers });
    } catch (error) {
      console.warn(`[API] Network connection to ${url} failed. Falling back to mock.`, error);
      return handleMockRequest(url, options);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Request failed');
    }
    return await response.json();
  }

  // Handle in Mock DB
  return handleMockRequest(url, options);
};

// Route matching for Mock Database
const handleMockRequest = (url, options) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const users = getFromStorage('rx_users');
        const rides = getFromStorage('rx_rides');
        const bookings = getFromStorage('rx_bookings');
        const notifications = getFromStorage('rx_notifications');
        const ads = getFromStorage('rx_ads');
        const settings = getFromStorage('rx_settings');
        const currentUser = JSON.parse(localStorage.getItem('rx_current_user'));

        // 1. AUTH ROUTES
        if (url === '/auth/login' && options.method === 'POST') {
          const body = JSON.parse(options.body);
          const user = users.find(u => u.email === body.email && u.password === body.password);
          if (!user) return reject(new Error('Invalid email or password'));
          if (user.status === 'suspended') return reject(new Error('Your account has been suspended'));
          localStorage.setItem('rx_current_user', JSON.stringify(user));
          localStorage.setItem('rx_token', 'mock_jwt_token_' + user.id);
          return resolve({ token: 'mock_jwt_token_' + user.id, user });
        }

        if (url === '/auth/register' && options.method === 'POST') {
          const body = JSON.parse(options.body);
          if (users.find(u => u.email === body.email)) return reject(new Error('Email already registered'));
          const newUser = {
            id: 'user_' + Date.now(),
            name: body.name,
            email: body.email,
            password: body.password,
            phone: body.phone,
            role: body.role || 'passenger',
            gender: body.gender || 'Other',
            bio: '',
            city: '',
            walletBalance: body.referralCode ? 100 : 0, // ₹100 referral bonus if code used
            isEmailVerified: false,
            isPhoneVerified: false,
            status: 'active',
            subscription: { plan: 'free', expiresAt: null },
            referralCode: body.name.slice(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900),
            referredBy: body.referralCode || '',
            completedRidesCount: 0,
            averageRating: 0.0,
            ratingCount: 0
          };
          users.push(newUser);
          saveToStorage('rx_users', users);

          // Add transaction record if referred
          if (body.referralCode) {
            createMockTransaction(newUser.id, 100, 'credit', `Referral bonus using code: ${body.referralCode}`);
            // Also award the owner of the referral code (when first booking completes, but let's give it now for demo simplicity)
            const referrer = users.find(u => u.referralCode === body.referralCode);
            if (referrer) {
              referrer.walletBalance += 100;
              saveToStorage('rx_users', users);
              createMockTransaction(referrer.id, 100, 'credit', `Referral bonus for inviting ${newUser.name}`);
              createMockNotification(referrer.id, 'Referral Bonus Received!', `Your friend ${newUser.name} joined. ₹100 added to your wallet!`, 'general');
            }
          }

          localStorage.setItem('rx_current_user', JSON.stringify(newUser));
          localStorage.setItem('rx_token', 'mock_jwt_token_' + newUser.id);
          return resolve({ token: 'mock_jwt_token_' + newUser.id, user: newUser });
        }

        if (url === '/auth/me') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const user = users.find(u => u.id === currentUser.id);
          return resolve(user);
        }

        if (url === '/auth/complete-profile' && options.method === 'POST') {
          const body = JSON.parse(options.body);
          const index = users.findIndex(u => u.id === currentUser.id);
          if (index === -1) return reject(new Error('User not found'));
          users[index] = { ...users[index], ...body, isProfileCompleted: true };
          saveToStorage('rx_users', users);
          localStorage.setItem('rx_current_user', JSON.stringify(users[index]));
          return resolve(users[index]);
        }

        if (url === '/auth/verify-phone' && options.method === 'POST') {
          const index = users.findIndex(u => u.id === currentUser.id);
          if (index === -1) return reject(new Error('User not found'));
          users[index].isPhoneVerified = true;
          saveToStorage('rx_users', users);
          localStorage.setItem('rx_current_user', JSON.stringify(users[index]));
          return resolve({ message: 'Phone verified successfully', user: users[index] });
        }

        if (url === '/auth/verify-email' && options.method === 'POST') {
          const index = users.findIndex(u => u.id === currentUser.id);
          if (index === -1) return reject(new Error('User not found'));
          users[index].isEmailVerified = true;
          saveToStorage('rx_users', users);
          localStorage.setItem('rx_current_user', JSON.stringify(users[index]));
          return resolve({ message: 'Email verified successfully', user: users[index] });
        }

        // 2. RIDES
        if (url.startsWith('/rides') && options.method === 'GET') {
          // Check query parameters
          const uObj = new URL(url, 'http://localhost');
          const source = uObj.searchParams.get('source');
          const dest = uObj.searchParams.get('destination');
          const date = uObj.searchParams.get('date');
          const seats = parseInt(uObj.searchParams.get('seats')) || 1;
          const womenOnly = uObj.searchParams.get('womenOnly') === 'true';
          const instantOnly = uObj.searchParams.get('instant') === 'true';
          const maxPrice = parseInt(uObj.searchParams.get('maxPrice'));
          const sort = uObj.searchParams.get('sort');

          let filtered = rides.filter(r => r.status === 'active' && r.availableSeats >= seats);

          if (source) {
            filtered = filtered.filter(r => 
              (r.sourceCity || '').toLowerCase().includes(source.toLowerCase()) ||
              (r.sourceState || '').toLowerCase().includes(source.toLowerCase()) ||
              (r.sourceDistrict || '').toLowerCase().includes(source.toLowerCase()) ||
              (r.sourceLandmark || '').toLowerCase().includes(source.toLowerCase())
            );
          }
          if (dest) {
            filtered = filtered.filter(r => 
              (r.destinationCity || '').toLowerCase().includes(dest.toLowerCase()) ||
              (r.destState || '').toLowerCase().includes(dest.toLowerCase()) ||
              (r.destDistrict || '').toLowerCase().includes(dest.toLowerCase()) ||
              (r.destLandmark || '').toLowerCase().includes(dest.toLowerCase())
            );
          }
          if (date) {
            filtered = filtered.filter(r => r.date === date);
          }
          if (womenOnly) {
            filtered = filtered.filter(r => r.womenOnly);
          }
          if (instantOnly) {
            filtered = filtered.filter(r => r.instantBooking);
          }
          if (maxPrice) {
            filtered = filtered.filter(r => r.pricePerSeat <= maxPrice);
          }

          // Sorts
          if (sort === 'price_low') {
            filtered.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
          } else if (sort === 'price_high') {
            filtered.sort((a, b) => b.pricePerSeat - a.pricePerSeat);
          } else if (sort === 'departure') {
            filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
          } else if (sort === 'rating') {
            filtered.sort((a, b) => b.driverRating - a.driverRating);
          }

          return resolve(filtered);
        }

        if (url === '/rides' && options.method === 'POST') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          
          // Check verification status
          const userIndex = users.findIndex(u => u.id === currentUser.id);
          const userObj = users[userIndex];
          if (!userObj.isIdentityVerified || !userObj.isDriverVerified) {
            return reject(new Error('Identity and driver verification is required to publish a ride. Please complete onboarding in the Verification Center.'));
          }

          const body = JSON.parse(options.body);
          const newRide = {
            id: 'ride_' + Date.now(),
            driverId: currentUser.id,
            driverName: currentUser.name,
            driverAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            driverRating: currentUser.averageRating || 5.0,
            driverVerified: currentUser.isPhoneVerified,
            status: 'active',
            ...body,
            sourceLat: Number(body.sourceLat) || 17.3850,
            sourceLon: Number(body.sourceLon) || 78.4867,
            destLat: Number(body.destLat) || 16.3067,
            destLon: Number(body.destLon) || 80.4365,
            availableSeats: Number(body.totalSeats),
            intermediateStops: body.intermediateStops ? (Array.isArray(body.intermediateStops) ? body.intermediateStops : body.intermediateStops.split(',').map(s => s.trim())) : []
          };
          rides.push(newRide);
          saveToStorage('rx_rides', rides);
          return resolve(newRide);
        }

        if (url.startsWith('/rides/') && options.method === 'GET') {
          const id = url.split('/').pop().split('?')[0];
          const ride = rides.find(r => r.id === id);
          if (!ride) return reject(new Error('Ride not found'));
          const driver = users.find(u => u.id === ride.driverId);
          // Pull reviews
          const allReviews = getFromStorage('rx_reviews') || [];
          const driverReviews = allReviews.filter(rev => rev.revieweeId === ride.driverId);
          return resolve({ ...ride, driverProfile: driver, reviews: driverReviews });
        }

        if (url.startsWith('/rides/') && options.method === 'DELETE') {
          const id = url.split('/').pop();
          const rideIndex = rides.findIndex(r => r.id === id);
          if (rideIndex === -1) return reject(new Error('Ride not found'));

          // Check if there are active bookings
          const hasBookings = bookings.some(b => b.rideId === id && ['pending', 'confirmed'].includes(b.status));
          if (hasBookings) {
            return reject(new Error('Cannot delete a ride with active bookings. Please cancel bookings first.'));
          }

          rides[rideIndex].status = 'cancelled';
          saveToStorage('rx_rides', rides);
          return resolve({ message: 'Ride cancelled successfully' });
        }

        // 3. BOOKINGS
        if (url === '/bookings' && options.method === 'POST') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          
          const userIndex = users.findIndex(u => u.id === currentUser.id);

          const body = JSON.parse(options.body);
          const ride = rides.find(r => r.id === body.rideId);
          if (!ride) return reject(new Error('Ride not found'));
          if (ride.availableSeats < body.seatsBooked) {
            return reject(new Error('Insufficient seats available'));
          }

          const platformFeePercent = settings.commissionRate || 12;
          const fare = ride.pricePerSeat * body.seatsBooked;
          const platformFee = Math.round(fare * (platformFeePercent / 100));
          const totalCost = fare + platformFee;

          // Check wallet balance
          if (users[userIndex].walletBalance < totalCost) {
            return reject(new Error('Insufficient wallet balance. Please add funds.'));
          }

          // Deduct from wallet
          users[userIndex].walletBalance -= totalCost;
          saveToStorage('rx_users', users);
          localStorage.setItem('rx_current_user', JSON.stringify(users[userIndex]));

          const isInstant = ride.instantBooking;
          const bookingStatus = isInstant ? 'confirmed' : 'pending';

          const newBooking = {
            id: 'bk_' + Math.floor(100000 + Math.random() * 900000),
            bookingRef: 'RSX' + Math.floor(100000 + Math.random() * 900000),
            rideId: ride.id,
            rideSource: ride.sourceCity,
            rideDestination: ride.destinationCity,
            rideDate: ride.date,
            rideTime: ride.departureTime,
            passengerId: currentUser.id,
            passengerName: currentUser.name,
            passengerAvatar: currentUser.avatar,
            driverId: ride.driverId,
            driverName: ride.driverName,
            driverPhone: users.find(u => u.id === ride.driverId)?.phone || '',
            seatsBooked: body.seatsBooked,
            pickupPoint: body.pickupPoint || ride.pickupPoint,
            dropPoint: body.dropPoint || ride.dropPoint,
            totalPrice: totalCost,
            fareAmount: fare,
            platformFee: platformFee,
            notes: body.notes || '',
            status: bookingStatus,
            paymentStatus: 'success',
            createdAt: new Date().toISOString(),
            rideSourceCoords: { lat: ride.sourceLat || 17.3850, lon: ride.sourceLon || 78.4867 },
            rideDestCoords: { lat: ride.destLat || 16.3067, lon: ride.destLon || 80.4365 },
            vehicleType: ride.vehicleType || 'Car',
            vehicleModel: ride.vehicleModel || '',
            vehicleNumber: ride.vehicleNumber || ''
          };

          bookings.push(newBooking);
          saveToStorage('rx_bookings', bookings);

          // Record Transaction
          createMockTransaction(currentUser.id, totalCost, 'debit', `Booking payment for trip ${ride.sourceCity} to ${ride.destinationCity}`, newBooking.id);

          // Update seat count if confirmed
          if (isInstant) {
            const rideIndex = rides.findIndex(r => r.id === ride.id);
            rides[rideIndex].availableSeats -= body.seatsBooked;
            saveToStorage('rx_rides', rides);

            // Notify driver
            createMockNotification(ride.driverId, 'New Instant Booking!', `${currentUser.name} booked ${body.seatsBooked} seat(s) on your trip.`, 'booking_approval');
          } else {
            // Notify driver of booking request
            createMockNotification(ride.driverId, 'Booking Request Received', `${currentUser.name} requested ${body.seatsBooked} seat(s) on your trip.`, 'booking_request');
          }

          return resolve(newBooking);
        }

        if (url.startsWith('/bookings/passenger/my-bookings')) {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const passengerBookings = bookings.filter(b => b.passengerId === currentUser.id);
          return resolve(passengerBookings);
        }

        if (url.startsWith('/bookings/driver/requests')) {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const driverRequests = bookings.filter(b => b.driverId === currentUser.id);
          return resolve(driverRequests);
        }

        if (url.startsWith('/bookings/') && url.endsWith('/status') && options.method === 'PUT') {
          const id = url.split('/')[2];
          const body = JSON.parse(options.body);
          const bookingIndex = bookings.findIndex(b => b.id === id || b.bookingRef === id);
          if (bookingIndex === -1) return reject(new Error('Booking not found'));

          const booking = bookings[bookingIndex];
          const rideIndex = rides.findIndex(r => r.id === booking.rideId);
          const ride = rides[rideIndex];

          const oldStatus = booking.status;
          const newStatus = body.status; // 'confirmed', 'rejected', 'cancelled'

          if (newStatus === 'confirmed') {
            if (ride.availableSeats < booking.seatsBooked) {
              return reject(new Error('Not enough seats left on this ride'));
            }
            bookings[bookingIndex].status = 'confirmed';
            rides[rideIndex].availableSeats -= booking.seatsBooked;
            saveToStorage('rx_rides', rides);
            saveToStorage('rx_bookings', bookings);

            createMockNotification(booking.passengerId, 'Booking Confirmed!', `Your booking to ${booking.rideDestination} has been approved by ${booking.driverName}.`, 'booking_approval');
          } 
          
          else if (newStatus === 'rejected') {
            bookings[bookingIndex].status = 'rejected';
            bookings[bookingIndex].paymentStatus = 'refunded';
            saveToStorage('rx_bookings', bookings);

            // Refund passenger
            const passIndex = users.findIndex(u => u.id === booking.passengerId);
            users[passIndex].walletBalance += booking.totalPrice;
            saveToStorage('rx_users', users);
            createMockTransaction(booking.passengerId, booking.totalPrice, 'credit', `Refund for rejected ride booking`, booking.id);

            createMockNotification(booking.passengerId, 'Booking Declined', `Your booking request to ${booking.rideDestination} was declined. Refund processed.`, 'booking_rejection');
          } 
          
          else if (newStatus === 'cancelled') {
            bookings[bookingIndex].status = 'cancelled';
            bookings[bookingIndex].paymentStatus = 'refunded';
            
            // Adjust seats if the cancelled booking was already confirmed
            if (oldStatus === 'confirmed') {
              rides[rideIndex].availableSeats += booking.seatsBooked;
              saveToStorage('rx_rides', rides);
            }
            saveToStorage('rx_bookings', bookings);

            // Refund logic based on cancellation window
            let refundAmount = booking.totalPrice;
            let explanation = '100% refund processed.';
            
            if (currentUser.role === 'passenger') {
              // Passenger cancellation: 12% admin fee retained if passenger cancels last minute
              // Let's assume full refund for simplicity in demo or retain fee
              refundAmount = booking.fareAmount + (booking.platformFee / 2); // 50% platform fee refund
              explanation = 'Refund processed (50% platform fee retained).';
            }

            const passIndex = users.findIndex(u => u.id === booking.passengerId);
            users[passIndex].walletBalance += refundAmount;
            saveToStorage('rx_users', users);
            createMockTransaction(booking.passengerId, refundAmount, 'credit', `Refund for cancelled booking. ${explanation}`, booking.id);

            if (currentUser.role === 'passenger') {
              createMockNotification(booking.driverId, 'Booking Cancelled', `${booking.passengerName} cancelled their booking for your ride.`, 'ride_cancellation');
            } else {
              createMockNotification(booking.passengerId, 'Ride Cancelled by Driver', `Driver ${booking.driverName} cancelled your booking. 100% refund processed.`, 'ride_cancellation');
            }
          }

          return resolve(bookings[bookingIndex]);
        }

        // 4. WALLET & PAYMENTS
        if (url === '/wallet/add-money' && options.method === 'POST') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const body = JSON.parse(options.body);
          const amount = Number(body.amount);

          const index = users.findIndex(u => u.id === currentUser.id);
          users[index].walletBalance += amount;
          saveToStorage('rx_users', users);
          localStorage.setItem('rx_current_user', JSON.stringify(users[index]));

          // Record Transaction
          createMockTransaction(currentUser.id, amount, 'credit', `Added funds via Razorpay`);
          createMockNotification(currentUser.id, 'Wallet Recharged', `₹${amount} successfully added to your wallet.`, 'payment_success');

          return resolve({ balance: users[index].walletBalance });
        }

        if (url === '/wallet' && options.method === 'GET') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const txs = getFromStorage('rx_transactions') || [];
          const userTxs = txs.filter(t => t.userId === currentUser.id);
          return resolve({ balance: currentUser.walletBalance, transactions: userTxs });
        }

        // 5. SUBSCRIPTION
        if (url === '/subscriptions/subscribe' && options.method === 'POST') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const body = JSON.parse(options.body); // { plan: 'plus' | 'premium', price: 199 | 499 }
          
          const index = users.findIndex(u => u.id === currentUser.id);
          if (users[index].walletBalance < body.price) {
            return reject(new Error('Insufficient wallet balance to buy subscription.'));
          }

          users[index].walletBalance -= body.price;
          users[index].subscription = {
            plan: body.plan,
            expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() // 30 days
          };
          saveToStorage('rx_users', users);
          localStorage.setItem('rx_current_user', JSON.stringify(users[index]));

          createMockTransaction(currentUser.id, body.price, 'debit', `Subscribed to ${body.plan.toUpperCase()} Plan`);
          createMockNotification(currentUser.id, 'Subscription Activated', `Welcome to ${body.plan.toUpperCase()}! Premium benefits active.`, 'payment_success');

          return resolve(users[index]);
        }

        // 6. ADS
        if (url === '/ads' && options.method === 'GET') {
          return resolve(ads.filter(a => a.status === 'active'));
        }

        // 7. NOTIFICATIONS
        if (url === '/notifications' && options.method === 'GET') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const list = notifications.filter(n => n.userId === currentUser.id);
          return resolve(list);
        }

        if (url === '/notifications/mark-read' && options.method === 'PUT') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const updated = notifications.map(n => {
            if (n.userId === currentUser.id) n.read = true;
            return n;
          });
          saveToStorage('rx_notifications', updated);
          return resolve({ success: true });
        }

        // 8. ADMIN ACTIONS
        if (url === '/admin/dashboard' && options.method === 'GET') {
          // Gross Stats
          const totalUsers = users.length;
          const totalDrivers = users.filter(u => u.role === 'driver' || u.completedRidesCount > 0).length;
          const totalPassengers = users.filter(u => u.role === 'passenger').length;
          const totalRides = rides.length;
          const totalBookingsCount = bookings.length;

          // Revenue Calculation
          const totalGrossBookingAmount = bookings.reduce((sum, b) => sum + (b.fareAmount || 0), 0);
          const totalCommissionEarned = bookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);
          const totalDriverPayouts = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.fareAmount || 0), 0);
          
          // Ad revenue & Subscription simulated values
          const subscriptionRevenue = users.filter(u => u.subscription?.plan !== 'free').length * 199;
          const adRevenue = ads.reduce((sum, ad) => sum + (ad.clicks * 5), 0); // ₹5 per click
          const referralBonusesIssued = users.filter(u => u.referredBy).length * 100;

          // Chart data (Simulating last 6 months)
          const monthlyRevenue = [
            { month: 'Dec', bookings: 12000, commission: 1440, subscriptions: 800 },
            { month: 'Jan', bookings: 18000, commission: 2160, subscriptions: 1200 },
            { month: 'Feb', bookings: 25000, commission: 3000, subscriptions: 1500 },
            { month: 'Mar', bookings: 32000, commission: 3840, subscriptions: 2000 },
            { month: 'Apr', bookings: 40000, commission: 4800, subscriptions: 2400 },
            { month: 'May', bookings: totalGrossBookingAmount, commission: totalCommissionEarned, subscriptions: subscriptionRevenue }
          ];

          return resolve({
            stats: {
              totalUsers,
              totalDrivers,
              totalPassengers,
              totalRides,
              totalBookings: totalBookingsCount,
              totalGrossBookingAmount,
              totalCommissionEarned,
              totalDriverPayouts,
              subscriptionRevenue,
              adRevenue,
              referralBonusesIssued,
              commissionRate: settings.commissionRate || 12
            },
            monthlyRevenue
          });
        }

        if (url === '/admin/users' && options.method === 'GET') {
          return resolve(users);
        }

        if (url.startsWith('/admin/users/') && url.endsWith('/toggle-status') && options.method === 'PUT') {
          const uId = url.split('/')[3];
          const index = users.findIndex(u => u.id === uId);
          if (index === -1) return reject(new Error('User not found'));
          users[index].status = users[index].status === 'active' ? 'suspended' : 'active';
          saveToStorage('rx_users', users);
          return resolve(users[index]);
        }

        if (url === '/admin/settings' && options.method === 'PUT') {
          const body = JSON.parse(options.body);
          const currentSettings = getFromStorage('rx_settings');
          const updated = { ...currentSettings, ...body };
          saveToStorage('rx_settings', updated);
          return resolve(updated);
        }

        if (url === '/admin/ads' && options.method === 'POST') {
          const body = JSON.parse(options.body);
          const newAd = {
            id: 'ad_' + Date.now(),
            clicks: 0,
            status: 'active',
            ...body
          };
          ads.push(newAd);
          saveToStorage('rx_ads', ads);
          return resolve(newAd);
        }

        if (url === '/admin/ads' && options.method === 'GET') {
          return resolve(ads);
        }

        // --- NEW VERIFICATION AND ADMIN VERIFICATION ENDPOINTS ---
        if (url === '/verification/document' && options.method === 'POST') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const { docType, docNumber, docImage } = JSON.parse(options.body);

          const docs = getFromStorage('rx_verification_documents') || [];
          const existingDoc = docs.find(d => d.user === currentUser.id && d.docType === docType);
          if (existingDoc && existingDoc.status === 'verified') {
            return reject(new Error(`Your ${docType} ID is already verified.`));
          }

          let doc;
          if (existingDoc) {
            existingDoc.docNumber = docNumber;
            existingDoc.docImage = docImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200';
            existingDoc.status = 'pending';
            existingDoc.rejectionReason = '';
            doc = existingDoc;
          } else {
            doc = {
              id: 'doc_' + Date.now(),
              user: currentUser.id,
              docType,
              docNumber,
              docImage: docImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200',
              status: 'pending',
              rejectionReason: ''
            };
            docs.push(doc);
          }
          saveToStorage('rx_verification_documents', docs);

          // Update user
          const index = users.findIndex(u => u.id === currentUser.id);
          users[index].verificationStatus = 'pending';
          saveToStorage('rx_users', users);
          localStorage.setItem('rx_current_user', JSON.stringify(users[index]));

          return resolve(doc);
        }

        if (url === '/verification/driver' && options.method === 'POST') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const body = JSON.parse(options.body);

          // Update/create driver verification docs
          const driverDocs = getFromStorage('rx_driver_verifications') || [];
          let driverProofIndex = driverDocs.findIndex(d => d.user === currentUser.id);
          let driverProof;
          
          if (driverProofIndex !== -1) {
            driverDocs[driverProofIndex] = {
              ...driverDocs[driverProofIndex],
              licenseNumber: body.licenseNumber,
              licenseImage: body.licenseImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200',
              rcNumber: body.rcNumber,
              rcImage: body.rcImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200',
              insuranceImage: body.insuranceImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200',
              pollutionImage: body.pollutionImage || '',
              status: 'pending',
              rejectionReason: ''
            };
            driverProof = driverDocs[driverProofIndex];
          } else {
            driverProof = {
              id: 'driver_doc_' + Date.now(),
              user: currentUser.id,
              licenseNumber: body.licenseNumber,
              licenseImage: body.licenseImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200',
              rcNumber: body.rcNumber,
              rcImage: body.rcImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200',
              insuranceImage: body.insuranceImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=200',
              pollutionImage: body.pollutionImage || '',
              status: 'pending',
              rejectionReason: ''
            };
            driverDocs.push(driverProof);
          }
          saveToStorage('rx_driver_verifications', driverDocs);

          // Update/create vehicle
          const vehicles = getFromStorage('rx_vehicles') || [];
          let vehicleIndex = vehicles.findIndex(v => v.driver === currentUser.id);
          let vehicle;

          if (vehicleIndex !== -1) {
            vehicles[vehicleIndex] = {
              ...vehicles[vehicleIndex],
              vehicleType: body.vehicleType,
              vehicleModel: body.vehicleModel,
              vehicleNumber: body.vehicleNumber,
              seatsAvailable: Number(body.seatsAvailable),
              status: 'pending'
            };
            vehicle = vehicles[vehicleIndex];
          } else {
            vehicle = {
              id: 'veh_' + Date.now(),
              driver: currentUser.id,
              vehicleType: body.vehicleType,
              vehicleModel: body.vehicleModel,
              vehicleNumber: body.vehicleNumber,
              seatsAvailable: Number(body.seatsAvailable),
              status: 'pending'
            };
            vehicles.push(vehicle);
          }
          saveToStorage('rx_vehicles', vehicles);

          // Update user
          const index = users.findIndex(u => u.id === currentUser.id);
          users[index].verificationStatus = 'pending';
          saveToStorage('rx_users', users);
          localStorage.setItem('rx_current_user', JSON.stringify(users[index]));

          return resolve({ driverProof, vehicle });
        }

        if (url === '/verification/status' && options.method === 'GET') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const docs = getFromStorage('rx_verification_documents') || [];
          const driverDocs = getFromStorage('rx_driver_verifications') || [];
          const vehicles = getFromStorage('rx_vehicles') || [];

          const userDocs = docs.filter(d => d.user === currentUser.id);
          const driverProof = driverDocs.find(d => d.user === currentUser.id) || null;
          const vehicle = vehicles.find(v => v.driver === currentUser.id) || null;
          const user = users.find(u => u.id === currentUser.id);

          return resolve({
            verificationStatus: user.verificationStatus || 'none',
            isIdentityVerified: user.isIdentityVerified || false,
            isDriverVerified: user.isDriverVerified || false,
            isVehicleVerified: user.isVehicleVerified || false,
            trustScore: user.trustScore || 20,
            documents: userDocs,
            driverProof,
            vehicle
          });
        }

        if (url === '/admin/verifications/pending' && options.method === 'GET') {
          const docs = getFromStorage('rx_verification_documents') || [];
          const driverDocs = getFromStorage('rx_driver_verifications') || [];
          const vehicles = getFromStorage('rx_vehicles') || [];

          const pendingIdDocs = docs.filter(d => d.status === 'pending').map(d => {
            const u = users.find(user => user.id === d.user) || { name: 'Unknown', email: '' };
            return { ...d, user: { id: u.id, _id: u.id, name: u.name, email: u.email } };
          });

          const pendingDriverDocs = driverDocs.filter(d => d.status === 'pending').map(d => {
            const u = users.find(user => user.id === d.user) || { name: 'Unknown', email: '' };
            return { ...d, user: { id: u.id, _id: u.id, name: u.name, email: u.email } };
          });

          const pendingVehicles = vehicles.filter(v => v.status === 'pending').map(v => {
            const u = users.find(user => user.id === v.driver) || { name: 'Unknown', email: '' };
            return { ...v, driver: { id: u.id, _id: u.id, name: u.name, email: u.email } };
          });

          return resolve({
            idDocuments: pendingIdDocs,
            driverDocuments: pendingDriverDocs,
            vehicleDocuments: pendingVehicles
          });
        }

        if (url.startsWith('/admin/verifications/') && url.endsWith('/approve') && options.method === 'PUT') {
          const docId = url.split('/')[3];
          const { docType } = JSON.parse(options.body);

          const docs = getFromStorage('rx_verification_documents') || [];
          const driverDocs = getFromStorage('rx_driver_verifications') || [];
          const vehicles = getFromStorage('rx_vehicles') || [];

          if (docType === 'identity') {
            const idx = docs.findIndex(d => d.id === docId);
            if (idx === -1) return reject(new Error('Document not found'));
            docs[idx].status = 'verified';
            saveToStorage('rx_verification_documents', docs);

            const userId = docs[idx].user;
            const uIdx = users.findIndex(u => u.id === userId);
            if (uIdx !== -1) {
              users[uIdx].isIdentityVerified = true;
              users[uIdx].trustScore = Math.min(100, (users[uIdx].trustScore || 20) + 30);
              users[uIdx].verificationStatus = 'verified';
              saveToStorage('rx_users', users);
              if (currentUser && currentUser.id === userId) {
                localStorage.setItem('rx_current_user', JSON.stringify(users[uIdx]));
              }
            }
            return resolve({ message: 'Identity document approved', doc: docs[idx] });
          }

          if (docType === 'driver') {
            const idx = driverDocs.findIndex(d => d.id === docId);
            if (idx === -1) return reject(new Error('Driver proof not found'));
            driverDocs[idx].status = 'verified';
            saveToStorage('rx_driver_verifications', driverDocs);

            const userId = driverDocs[idx].user;
            const uIdx = users.findIndex(u => u.id === userId);
            if (uIdx !== -1) {
              users[uIdx].isDriverVerified = true;
              users[uIdx].trustScore = Math.min(100, (users[uIdx].trustScore || 20) + 30);
              users[uIdx].role = 'driver';
              saveToStorage('rx_users', users);
              if (currentUser && currentUser.id === userId) {
                localStorage.setItem('rx_current_user', JSON.stringify(users[uIdx]));
              }
            }
            return resolve({ message: 'Driver license approved', doc: driverDocs[idx] });
          }

          if (docType === 'vehicle') {
            const idx = vehicles.findIndex(v => v.id === docId);
            if (idx === -1) return reject(new Error('Vehicle profile not found'));
            vehicles[idx].status = 'verified';
            saveToStorage('rx_vehicles', vehicles);

            const userId = vehicles[idx].driver;
            const uIdx = users.findIndex(u => u.id === userId);
            if (uIdx !== -1) {
              users[uIdx].isVehicleVerified = true;
              users[uIdx].trustScore = Math.min(100, (users[uIdx].trustScore || 20) + 20);
              saveToStorage('rx_users', users);
              if (currentUser && currentUser.id === userId) {
                localStorage.setItem('rx_current_user', JSON.stringify(users[uIdx]));
              }
            }
            return resolve({ message: 'Vehicle RC approved', doc: vehicles[idx] });
          }

          return reject(new Error('Invalid verification type'));
        }

        if (url.startsWith('/admin/verifications/') && url.endsWith('/reject') && options.method === 'PUT') {
          const docId = url.split('/')[3];
          const { docType, reason } = JSON.parse(options.body);

          const docs = getFromStorage('rx_verification_documents') || [];
          const driverDocs = getFromStorage('rx_driver_verifications') || [];
          const vehicles = getFromStorage('rx_vehicles') || [];

          if (docType === 'identity') {
            const idx = docs.findIndex(d => d.id === docId);
            if (idx === -1) return reject(new Error('Document not found'));
            docs[idx].status = 'rejected';
            docs[idx].rejectionReason = reason || 'Document image unclear or number mismatch.';
            saveToStorage('rx_verification_documents', docs);

            const userId = docs[idx].user;
            const uIdx = users.findIndex(u => u.id === userId);
            if (uIdx !== -1) {
              users[uIdx].isIdentityVerified = false;
              users[uIdx].verificationStatus = 'rejected';
              saveToStorage('rx_users', users);
              if (currentUser && currentUser.id === userId) {
                localStorage.setItem('rx_current_user', JSON.stringify(users[uIdx]));
              }
            }
            return resolve({ message: 'Identity document rejected', doc: docs[idx] });
          }

          if (docType === 'driver') {
            const idx = driverDocs.findIndex(d => d.id === docId);
            if (idx === -1) return reject(new Error('Driver proof not found'));
            driverDocs[idx].status = 'rejected';
            driverDocs[idx].rejectionReason = reason || 'License expired or name mismatch.';
            saveToStorage('rx_driver_verifications', driverDocs);

            const userId = driverDocs[idx].user;
            const uIdx = users.findIndex(u => u.id === userId);
            if (uIdx !== -1) {
              users[uIdx].isDriverVerified = false;
              users[uIdx].verificationStatus = 'rejected';
              saveToStorage('rx_users', users);
              if (currentUser && currentUser.id === userId) {
                localStorage.setItem('rx_current_user', JSON.stringify(users[uIdx]));
              }
            }
            return resolve({ message: 'Driver license rejected', doc: driverDocs[idx] });
          }

          if (docType === 'vehicle') {
            const idx = vehicles.findIndex(v => v.id === docId);
            if (idx === -1) return reject(new Error('Vehicle profile not found'));
            vehicles[idx].status = 'rejected';
            saveToStorage('rx_vehicles', vehicles);

            const userId = vehicles[idx].driver;
            const uIdx = users.findIndex(u => u.id === userId);
            if (uIdx !== -1) {
              users[uIdx].isVehicleVerified = false;
              saveToStorage('rx_users', users);
              if (currentUser && currentUser.id === userId) {
                localStorage.setItem('rx_current_user', JSON.stringify(users[uIdx]));
              }
            }
            return resolve({ message: 'Vehicle RC rejected', doc: vehicles[idx] });
          }

          return reject(new Error('Invalid verification type'));
        }

        // 9. TRAVEL REQUESTS (PRE-BOOKING)
        if (url === '/requests' && options.method === 'POST') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const body = JSON.parse(options.body);
          
          const travelRequests = getFromStorage('rx_travel_requests') || [];
          const newRequest = {
            id: 'req_' + Date.now(),
            passengerId: currentUser.id,
            sourceCity: body.sourceCity,
            sourceState: body.sourceState || '',
            sourceDistrict: body.sourceDistrict || '',
            sourceLandmark: body.sourceLandmark || '',
            destinationCity: body.destinationCity,
            destState: body.destState || '',
            destDistrict: body.destDistrict || '',
            destLandmark: body.destLandmark || '',
            sourceLat: Number(body.sourceLat) || 17.3850,
            sourceLon: Number(body.sourceLon) || 78.4867,
            destLat: Number(body.destLat) || 16.3067,
            destLon: Number(body.destLon) || 80.4365,
            pickupPoint: body.pickupPoint,
            dropPoint: body.dropPoint,
            date: body.date,
            preferredTime: body.preferredTime,
            seatsNeeded: Number(body.seatsNeeded),
            budget: Number(body.budget),
            notes: body.notes || '',
            status: 'open',
            offers: [],
            createdAt: new Date().toISOString()
          };

          travelRequests.push(newRequest);
          saveToStorage('rx_travel_requests', travelRequests);
          
          const userObj = users.find(u => u.id === currentUser.id);
          const populated = {
            ...newRequest,
            passenger: { id: userObj.id, _id: userObj.id, name: userObj.name, avatar: userObj.avatar, averageRating: userObj.averageRating }
          };
          return resolve(populated);
        }

        if (url.startsWith('/requests') && options.method === 'GET' && !url.includes('/passenger/my-requests')) {
          const uObj = new URL(url, 'http://localhost');
          const source = uObj.searchParams.get('source');
          const destination = uObj.searchParams.get('destination');
          const date = uObj.searchParams.get('date');

          const travelRequests = getFromStorage('rx_travel_requests') || [];
          let filtered = travelRequests.filter(r => r.status === 'open');

          if (source) {
            filtered = filtered.filter(r => 
              (r.sourceCity || '').toLowerCase().includes(source.toLowerCase()) ||
              (r.sourceState || '').toLowerCase().includes(source.toLowerCase()) ||
              (r.sourceDistrict || '').toLowerCase().includes(source.toLowerCase()) ||
              (r.sourceLandmark || '').toLowerCase().includes(source.toLowerCase())
            );
          }
          if (destination) {
            filtered = filtered.filter(r => 
              (r.destinationCity || '').toLowerCase().includes(destination.toLowerCase()) ||
              (r.destState || '').toLowerCase().includes(destination.toLowerCase()) ||
              (r.destDistrict || '').toLowerCase().includes(destination.toLowerCase()) ||
              (r.destLandmark || '').toLowerCase().includes(destination.toLowerCase())
            );
          }
          if (date) {
            filtered = filtered.filter(r => r.date === date);
          }

          const populated = filtered.map(r => {
            const passengerUser = users.find(u => u.id === r.passengerId) || { name: 'Passenger', avatar: '', averageRating: 5.0 };
            return {
              ...r,
              passenger: {
                id: passengerUser.id,
                _id: passengerUser.id,
                name: passengerUser.name,
                avatar: passengerUser.avatar,
                averageRating: passengerUser.averageRating
              }
            };
          });

          return resolve(populated);
        }

        if (url === '/requests/passenger/my-requests' && options.method === 'GET') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const travelRequests = getFromStorage('rx_travel_requests') || [];
          const myReqs = travelRequests.filter(r => r.passengerId === currentUser.id);

          const populated = myReqs.map(r => {
            const passengerUser = users.find(u => u.id === r.passengerId) || { name: 'Passenger', avatar: '' };
            const populatedOffers = (r.offers || []).map(o => {
              const driverUser = users.find(u => u.id === o.driverId) || { name: 'Driver', avatar: '', averageRating: 5.0, phone: '' };
              return {
                ...o,
                driver: {
                  id: driverUser.id,
                  _id: driverUser.id,
                  name: driverUser.name,
                  avatar: driverUser.avatar,
                  averageRating: driverUser.averageRating,
                  phone: driverUser.phone
                }
              };
            });
            return {
              ...r,
              passenger: {
                id: passengerUser.id,
                _id: passengerUser.id,
                name: passengerUser.name,
                avatar: passengerUser.avatar
              },
              offers: populatedOffers
            };
          });

          return resolve(populated);
        }

        if (url.startsWith('/requests/') && url.endsWith('/offer') && options.method === 'POST') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const id = url.split('/')[2];
          const body = JSON.parse(options.body);

          const travelRequests = getFromStorage('rx_travel_requests') || [];
          const reqIndex = travelRequests.findIndex(r => r.id === id);
          if (reqIndex === -1) return reject(new Error('Travel request not found'));

          const request = travelRequests[reqIndex];
          if (request.status !== 'open') return reject(new Error('Request is no longer open'));

          const alreadyOffered = (request.offers || []).some(o => o.driverId === currentUser.id);
          if (alreadyOffered) return reject(new Error('You have already submitted an offer for this request'));

          if (!request.offers) request.offers = [];
          
          const newOffer = {
            id: 'off_' + Date.now(),
            _id: 'off_' + Date.now(),
            driverId: currentUser.id,
            vehicleType: body.vehicleType,
            vehicleModel: body.vehicleModel,
            vehicleNumber: body.vehicleNumber || '',
            fare: Number(body.fare),
            notes: body.notes || '',
            status: 'pending',
            createdAt: new Date().toISOString()
          };

          request.offers.push(newOffer);
          saveToStorage('rx_travel_requests', travelRequests);

          createMockNotification(request.passengerId, 'New Commute Offer!', `${currentUser.name} offered to drive you for ₹${body.fare}.`, 'general');

          return resolve({ message: 'Commute offer sent to passenger successfully', request });
        }

        if (url.startsWith('/requests/') && url.includes('/offers/') && url.endsWith('/accept') && options.method === 'PUT') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const parts = url.split('/');
          const id = parts[2];
          const offerId = parts[4];

          const travelRequests = getFromStorage('rx_travel_requests') || [];
          const reqIndex = travelRequests.findIndex(r => r.id === id);
          if (reqIndex === -1) return reject(new Error('Travel request not found'));

          const request = travelRequests[reqIndex];
          if (request.passengerId !== currentUser.id) {
            return reject(new Error('Not authorized to manage this request'));
          }
          if (request.status !== 'open') return reject(new Error('Request is already processed'));

          const offer = (request.offers || []).find(o => o.id === offerId || o._id === offerId);
          if (!offer) return reject(new Error('Commute offer not found'));

          const passengerUserIndex = users.findIndex(u => u.id === currentUser.id);
          const passengerUser = users[passengerUserIndex];

          const totalFare = offer.fare * request.seatsNeeded;
          const platformFee = Math.round(totalFare * 0.12);
          const totalPrice = totalFare + platformFee;

          if (passengerUser.walletBalance < totalPrice) {
            return reject(new Error('Insufficient wallet balance. Please add funds.'));
          }

          passengerUser.walletBalance -= totalPrice;
          saveToStorage('rx_users', users);
          localStorage.setItem('rx_current_user', JSON.stringify(passengerUser));

          createMockTransaction(currentUser.id, totalPrice, 'debit', `Pre-booked travel request booking to ${request.destinationCity}`);

          const rideId = 'ride_req_' + Date.now();
          const newRide = {
            id: rideId,
            driverId: offer.driverId,
            driverName: users.find(u => u.id === offer.driverId)?.name || 'Driver',
            driverAvatar: users.find(u => u.id === offer.driverId)?.avatar || '',
            driverRating: users.find(u => u.id === offer.driverId)?.averageRating || 5.0,
            driverVerified: true,
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
          };
          rides.push(newRide);
          saveToStorage('rx_rides', rides);

          const bookingRef = 'RSX' + Math.floor(100000 + Math.random() * 900000);
          const newBooking = {
            id: 'bk_' + Math.floor(100000 + Math.random() * 900000),
            bookingRef,
            rideId: newRide.id,
            rideSource: newRide.sourceCity,
            rideDestination: newRide.destinationCity,
            rideDate: newRide.date,
            rideTime: newRide.departureTime,
            passengerId: currentUser.id,
            passengerName: currentUser.name,
            passengerAvatar: currentUser.avatar,
            driverId: offer.driverId,
            driverName: newRide.driverName,
            driverPhone: users.find(u => u.id === offer.driverId)?.phone || '',
            seatsBooked: request.seatsNeeded,
            pickupPoint: request.pickupPoint,
            dropPoint: request.dropPoint,
            totalPrice,
            fareAmount: totalFare,
            platformFee,
            notes: offer.notes,
            status: 'confirmed',
            paymentStatus: 'success',
            createdAt: new Date().toISOString(),
            rideSourceCoords: { lat: newRide.sourceLat || 17.3850, lon: newRide.sourceLon || 78.4867 },
            rideDestCoords: { lat: newRide.destLat || 16.3067, lon: newRide.destLon || 80.4365 },
            vehicleType: newRide.vehicleType,
            vehicleModel: newRide.vehicleModel,
            vehicleNumber: newRide.vehicleNumber
          };
          bookings.push(newBooking);
          saveToStorage('rx_bookings', bookings);

          request.status = 'confirmed';
          request.offers.forEach(o => {
            if (o.id === offerId || o._id === offerId) {
              o.status = 'accepted';
            } else {
              o.status = 'rejected';
            }
          });
          saveToStorage('rx_travel_requests', travelRequests);

          createMockNotification(offer.driverId, 'Offer Accepted!', `${currentUser.name} accepted your offer of ₹${offer.fare}. Ride confirmed!`, 'booking_approval');

          return resolve({ message: 'Offer accepted! Ride pre-booking confirmed.', booking: newBooking, request });
        }

        if (url.startsWith('/requests/') && url.includes('/offers/') && url.endsWith('/reject') && options.method === 'PUT') {
          if (!currentUser) return reject(new Error('Unauthorized'));
          const parts = url.split('/');
          const id = parts[2];
          const offerId = parts[4];

          const travelRequests = getFromStorage('rx_travel_requests') || [];
          const reqIndex = travelRequests.findIndex(r => r.id === id);
          if (reqIndex === -1) return reject(new Error('Travel request not found'));

          const request = travelRequests[reqIndex];
          if (request.passengerId !== currentUser.id) {
            return reject(new Error('Not authorized to manage this request'));
          }

          const offer = (request.offers || []).find(o => o.id === offerId || o._id === offerId);
          if (!offer) return reject(new Error('Commute offer not found'));

          offer.status = 'rejected';
          saveToStorage('rx_travel_requests', travelRequests);

          return resolve({ message: 'Driver offer declined', request });
        }

        // Default 404
        return reject(new Error(`API Path ${url} not found (Mock DB Mode)`));
      } catch (err) {
        return reject(err);
      }
    }, 300);
  });
};

// Helper mock creation functions
const createMockTransaction = (userId, amount, type, description, referenceId = '') => {
  const txs = getFromStorage('rx_transactions') || [];
  txs.push({
    id: 'tx_' + Math.floor(100000 + Math.random() * 900000),
    userId,
    amount,
    type,
    description,
    referenceId,
    createdAt: new Date().toISOString()
  });
  saveToStorage('rx_transactions', txs);
};

const createMockNotification = (userId, title, message, type) => {
  const notifs = getFromStorage('rx_notifications') || [];
  notifs.push({
    id: 'notif_' + Math.floor(100000 + Math.random() * 900000),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  });
  saveToStorage('rx_notifications', notifs);
};

// EXPORTED SERVICES
export const authService = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password, phone, referralCode, gender) => request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, phone, referralCode, gender }) }),
  me: () => request('/auth/me', { method: 'GET' }),
  completeProfile: (profileData) => request('/auth/complete-profile', { method: 'POST', body: JSON.stringify(profileData) }),
  verifyPhone: () => request('/auth/verify-phone', { method: 'POST' }),
  verifyEmail: () => request('/auth/verify-email', { method: 'POST' }),
  logout: () => {
    localStorage.removeItem('rx_token');
    localStorage.removeItem('rx_current_user');
    return Promise.resolve({ success: true });
  }
};

export const rideService = {
  create: (rideData) => request('/rides', { method: 'POST', body: JSON.stringify(rideData) }),
  search: (params) => {
    const q = new URLSearchParams(params).toString();
    return request(`/rides?${q}`, { method: 'GET' });
  },
  getById: (id) => request(`/rides/${id}`, { method: 'GET' }),
  cancel: (id) => request(`/rides/${id}`, { method: 'DELETE' }),
  getMyRides: () => request('/rides/driver/my-rides', { method: 'GET' })
};

export const bookingService = {
  create: (bookingData) => request('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
  getMyBookings: () => request('/bookings/passenger/my-bookings', { method: 'GET' }),
  getRequests: () => request('/bookings/driver/requests', { method: 'GET' }),
  updateStatus: (bookingId, status) => request(`/bookings/${bookingId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
};

export const walletService = {
  getWallet: () => request('/wallet', { method: 'GET' }),
  addMoney: (amount) => request('/wallet/add-money', { method: 'POST', body: JSON.stringify({ amount }) }),
  subscribe: (plan, price) => request('/subscriptions/subscribe', { method: 'POST', body: JSON.stringify({ plan, price }) })
};

export const adService = {
  getAds: () => request('/ads', { method: 'GET' })
};

export const verificationService = {
  uploadIdDocument: (docData) => request('/verification/document', { method: 'POST', body: JSON.stringify(docData) }),
  uploadDriverProof: (driverData) => request('/verification/driver', { method: 'POST', body: JSON.stringify(driverData) }),
  getVerificationStatus: () => request('/verification/status', { method: 'GET' })
};

export const adminService = {
  getDashboard: () => request('/admin/dashboard', { method: 'GET' }),
  getUsers: () => request('/admin/users', { method: 'GET' }),
  toggleUserStatus: (id) => request(`/admin/users/${id}/toggle-status`, { method: 'PUT' }),
  updateSettings: (settingsData) => request('/admin/settings', { method: 'PUT', body: JSON.stringify(settingsData) }),
  getAds: () => request('/admin/ads', { method: 'GET' }),
  createAd: (adData) => request('/admin/ads', { method: 'POST', body: JSON.stringify(adData) }),
  getPendingVerifications: () => request('/admin/verifications/pending', { method: 'GET' }),
  approveVerification: (id, docType) => request(`/admin/verifications/${id}/approve`, { method: 'PUT', body: JSON.stringify({ docType }) }),
  rejectVerification: (id, docType, reason) => request(`/admin/verifications/${id}/reject`, { method: 'PUT', body: JSON.stringify({ docType, reason }) })
};

export const requestService = {
  create: (requestData) => request('/requests', { method: 'POST', body: JSON.stringify(requestData) }),
  search: (params) => {
    const q = new URLSearchParams(params).toString();
    return request(`/requests?${q}`, { method: 'GET' });
  },
  getMyRequests: () => request('/requests/passenger/my-requests', { method: 'GET' }),
  submitOffer: (id, offerData) => request(`/requests/${id}/offer`, { method: 'POST', body: JSON.stringify(offerData) }),
  acceptOffer: (id, offerId) => request(`/requests/${id}/offers/${offerId}/accept`, { method: 'PUT' }),
  rejectOffer: (id, offerId) => request(`/requests/${id}/offers/${offerId}/reject`, { method: 'PUT' })
};
