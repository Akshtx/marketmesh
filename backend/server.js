const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

// CORS configuration for production and development
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:3001',
  process.env.FRONTEND_URL // Will be set in Render environment variables
].filter(Boolean);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? allowedOrigins 
    : '*', // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// MongoDB connection with better error handling
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/marketmesh';
console.log('Connecting to MongoDB...');
mongoose.connect(MONGO)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit if database connection fails
  });

// simple routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const promoRoutes = require('./routes/promos');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/promos', promoRoutes);

app.get('/', (req,res)=> res.json({ ok: true, msg: 'MarketMesh API', endpoints: { auth: '/api/auth', products: '/api/products', orders: '/api/orders' } }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=> {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
