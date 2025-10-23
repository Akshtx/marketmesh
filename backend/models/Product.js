const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, text: true },
  description: { type: String, text: true },
  categories: [{ type: String }],
  price: { type: Number, required: true },
  sku: String,
  images: [String],
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Product', ProductSchema);
