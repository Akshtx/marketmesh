const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(cors({
  origin: '*', // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// connect
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/marketmesh';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error', err));

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

const PORT = process.env.PORT || 3001; // Changed default from 5000 to 3001 to match frontend expectations
app.listen(PORT, ()=> console.log('Server running on', PORT));
