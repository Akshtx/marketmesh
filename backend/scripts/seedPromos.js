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
  },
  {
    code: 'MEGA20',
    discountPercent: 20,
    description: 'Mega deal! Save big with 20% discount on electronics',
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    usageLimit: 75
  },
  {
    code: 'NEWYEAR25',
    discountPercent: 25,
    description: 'New Year Special! Get 25% off on all categories',
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    usageLimit: 200
  },
  {
    code: 'SUPER30',
    discountPercent: 30,
    description: 'Super Saver! Massive 30% discount - Don\'t miss out!',
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    usageLimit: 30
  },
  {
    code: 'VIP40',
    discountPercent: 40,
    description: 'VIP Exclusive! Get 40% off on premium products',
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    usageLimit: 150
  },
  {
    code: 'FESTIVE50',
    discountPercent: 50,
    description: 'Festive Bonanza! Unbelievable 50% off on selected items',
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    usageLimit: 100
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
