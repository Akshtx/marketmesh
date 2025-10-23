const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');

// Simple JWT auth middleware (expects Authorization: Bearer <token>)
function requireAuth(req, res, next) {
  try {
    const hdr = req.headers.authorization || req.headers.Authorization;
    if (!hdr) return res.status(401).json({ msg: 'No auth header' });
    const [type, token] = hdr.split(' ');
    if (type !== 'Bearer' || !token) return res.status(401).json({ msg: 'Bad auth header' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
}

// create order
router.post('/', async (req,res)=>{
  try{
    const order = new Order(req.body);
    await order.save();
    res.json(order);
  }catch(err){ console.error(err); res.status(500).json({ msg: 'Server error' }) }
});

// list (admin)
router.get('/', async (req,res)=>{
  try{
    const orders = await Order.find().limit(100);
    res.json(orders);
  }catch(err){ console.error(err); res.status(500).json({ msg: 'Server error' }) }
});

// list current user's orders
router.get('/user', requireAuth, async (req,res)=>{
  try{
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100);
    res.json(orders);
  }catch(err){ console.error(err); res.status(500).json({ msg: 'Server error' }) }
});

module.exports = router;
