const mongoose = require('mongoose');
const PromoCode = require('../models/PromoCode');
require('dotenv').config();

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/marketmesh';

const promos = [
  {
    code: 'WELCOME5',
    discountPercent: 5,
    description: 'Welcome offer! Get 5% off on your purchase',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    usageLimit: 100
  },
  {
    code: 'SAVE10',
    discountPercent: 10,
    description: 'Limited time offer! Save 10% on all products',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    usageLimit: 50
  },
  {
    code: 'FLASH15',
    discountPercent: 15,
    description: 'Flash sale! Get 15% off - Hurry, expires soon!',
    expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    usageLimit: 25
  }
];

async function seedPromos() {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    
    // Clear existing promos
    await PromoCode.deleteMany({});
    console.log('Cleared existing promo codes');
    
    // Insert new promos
    await PromoCode.insertMany(promos);
    console.log(`✅ Successfully seeded ${promos.length} promo codes:`);
    promos.forEach(p => {
      console.log(`   - ${p.code}: ${p.discountPercent}% off (expires: ${p.expiresAt.toLocaleDateString()})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding promos:', err);
    process.exit(1);
  }
}

seedPromos();
