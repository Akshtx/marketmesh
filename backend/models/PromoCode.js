const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if promo is valid
promoCodeSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (new Date() > this.expiresAt) return false;
  if (this.usageLimit && this.usageCount >= this.usageLimit) return false;
  return true;
};

module.exports = mongoose.model('PromoCode', promoCodeSchema);
