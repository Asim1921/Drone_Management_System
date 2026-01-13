import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import licenseRoutes from './routes/licenseRoutes';
import operatorRoutes from './routes/operatorRoutes';
import vendorRoutes from './routes/vendorRoutes';
import flightRoutes from './routes/flightRoutes';
import violationRoutes from './routes/violationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/violations', violationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DMS API is running' });
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export default app;

