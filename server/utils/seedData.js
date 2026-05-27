import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Ride } from '../models/Ride.js';
import { Ad } from '../models/Ad.js';
import { Wallet } from '../models/Wallet.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ridesharex');
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Ride.deleteMany();
    await Ad.deleteMany();
    await Wallet.deleteMany();
    console.log('[Seed] Cleared existing data...');

    // 1. Create Users
    const users = [
      {
        name: 'Arjun Reddy',
        email: 'arjun@driver.com',
        password: 'password123', // Pre-save hooks will encrypt this password
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
        subscription: { plan: 'premium', expiresAt: new Date(Date.now() + 30 * 86400000) },
        referralCode: 'ARJ100',
        walletBalance: 2500,
        completedRidesCount: 24,
        averageRating: 4.8,
        ratingCount: 15
      },
      {
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
    ];

    const createdUsers = [];
    for (const u of users) {
      const newUser = new User(u);
      await newUser.save();
      createdUsers.push(newUser);

      // Initialize Wallet ledger
      const newWallet = new Wallet({
        user: newUser._id,
        balance: newUser.walletBalance,
        transactions: [{
          transactionId: 'tx_seed_' + Math.floor(1000 + Math.random() * 9000),
          amount: newUser.walletBalance,
          type: 'credit',
          description: 'Opening wallet seed balance'
        }]
      });
      await newWallet.save();
    }
    console.log('[Seed] Users and Wallets registered...');

    const driver = createdUsers.find(u => u.role === 'driver');

    // 2. Create Rides
    const rides = [
      {
        driver: driver._id,
        sourceCity: 'Guntur',
        destinationCity: 'Hyderabad',
        pickupPoint: 'Guntur RTC Bus Stand',
        dropPoint: 'LB Nagar Metro Station',
        intermediateStops: ['Vijayawada Highway', 'Suryapet bypass'],
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
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
        driver: driver._id,
        sourceCity: 'Hyderabad',
        destinationCity: 'Bengaluru',
        pickupPoint: 'Gachibowli Outer Ring Road',
        dropPoint: 'Hebbal Flyover',
        intermediateStops: ['Kurnool bypass', 'Anantapur'],
        date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
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
      }
    ];

    for (const r of rides) {
      await new Ride(r).save();
    }
    console.log('[Seed] Ride Listings registered...');

    // 3. Create Sponsored Ads
    const ads = [
      {
        title: 'Upgrade to Plus - Save Booking Fees!',
        imageUrl: 'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&q=80&w=600',
        linkUrl: '/subscription',
        position: 'dashboard',
        clicks: 12,
        status: 'active'
      },
      {
        title: 'Ad: Rent Self-Drive Luxury Cars in Hyderabad',
        imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
        linkUrl: 'https://zoomcar.com',
        position: 'search',
        clicks: 8,
        status: 'active'
      }
    ];

    for (const ad of ads) {
      await new Ad(ad).save();
    }
    console.log('[Seed] Ad campaigns loaded...');

    console.log('[Seed] Database populated successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error(`[Seed] Error populating database: ${error.message}`);
    process.exit(1);
  }
};

seed();
