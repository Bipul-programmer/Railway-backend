// backend/src/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import trainService from './services/train.service.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import trainRoutes from './routes/train.routes.js';
import pnrRoutes from './routes/pnr.routes.js';

// Middleware Imports
import { notFound, errorHandler } from './middleware/error.middleware.js';

// Load env vars
dotenv.config();

// Connect to Database and Seed Stations
connectDB().then(() => {
  console.log('🌱 Triggering Database Seeding...');
  trainService.seedStationsAndTrains();
}).catch(err => {
  console.error('❌ Failed to seed stations:', err.message);
});

const app = express();

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Allow localhost and local IP loopback on any port
        if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "Authorization"],
    maxAge: 600,
    optionsSuccessStatus: 200,
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/pnr', pnrRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.json({
      message: 'Railway Live Tracking API is running...',
      endpoints: {
        auth: '/api/auth',
        trains: '/api/trains',
        pnr: '/api/pnr'
      }
    });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});


