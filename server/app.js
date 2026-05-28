import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import requestRoutes from './routes/requestRoutes.js';

const app = express();

// Connect Mongoose Database
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/requests', requestRoutes);

// Serve static assets in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'RideShareX Indian Intercity Carpooling System API is active' });
  });
}

// Exception Fallbacks
app.use(notFound);
app.use(errorHandler);

export default app;
