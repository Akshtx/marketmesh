const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode');

// GET /api/promos/active - Get all active promo codes
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const promos = await PromoCode.find({
      isActive: true,
      expiresAt: { $gt: now }
    }).sort({ createdAt: -1 });
    
    // Filter out promos that exceeded usage limit
    const validPromos = promos.filter(promo => {
      return !promo.usageLimit || promo.usageCount < promo.usageLimit;
    });
    
    res.json(validPromos);
  } catch (err) {
    console.error('Error fetching active promos:', err);
    res.status(500).json({ msg: 'Server error fetching promos' });
  }
});

// POST /api/promos/validate - Validate a promo code
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ msg: 'Promo code is required' });
    }
    
    const promo = await PromoCode.findOne({ 
      code: code.toUpperCase() 
    });
    
    if (!promo) {
      return res.status(404).json({ msg: 'Invalid promo code' });
    }
    
    if (!promo.isValid()) {
      return res.status(400).json({ msg: 'This promo code has expired or is no longer valid' });
    }
    
    res.json({
      valid: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
      description: promo.description
    });
  } catch (err) {
    console.error('Error validating promo:', err);
    res.status(500).json({ msg: 'Server error validating promo' });
  }
});

// POST /api/promos/apply - Apply promo code (increment usage)
router.post('/apply', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ msg: 'Promo code is required' });
    }
    
    const promo = await PromoCode.findOne({ 
      code: code.toUpperCase() 
    });
    
    if (!promo) {
      return res.status(404).json({ msg: 'Invalid promo code' });
    }
    
    if (!promo.isValid()) {
      return res.status(400).json({ msg: 'This promo code has expired or is no longer valid' });
    }
    
    // Increment usage count
    promo.usageCount += 1;
    await promo.save();
    
    res.json({
      success: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
      description: promo.description
    });
  } catch (err) {
    console.error('Error applying promo:', err);
    res.status(500).json({ msg: 'Server error applying promo' });
  }
});

// POST /api/promos - Create new promo code (admin only - no auth for demo)
router.post('/', async (req, res) => {
  try {
    const { code, discountPercent, description, expiresAt, usageLimit } = req.body;
    
    if (!code || !discountPercent || !description || !expiresAt) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }
    
    const promo = new PromoCode({
      code: code.toUpperCase(),
      discountPercent,
      description,
      expiresAt: new Date(expiresAt),
      usageLimit
    });
    
    await promo.save();
    res.status(201).json(promo);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Promo code already exists' });
    }
    console.error('Error creating promo:', err);
    res.status(500).json({ msg: 'Server error creating promo' });
  }
});

module.exports = router;
