const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    sku: String,
    qty: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  subtotal: Number,
  shipping: Number,
  taxes: Number,
  discount: Number,
  promoCode: {
    code: String,
    discountPercent: Number
  },
  total: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', OrderSchema);
