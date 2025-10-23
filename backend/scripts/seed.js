const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Product = require('../models/Product');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function run(){
  const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/marketmesh';
  await mongoose.connect(MONGO);
  console.log('Connected for seed');
  await Product.deleteMany({});
  await User.deleteMany({});

  const products = [
    { title: 'Wireless Headphones', description: 'Noise-cancelling over-ear headset', price: 2499, categories: ['electronics'], stock: 50, images: ['images/Wireless Headphones.webp'] },
    { title: 'Smartwatch Pro', description: 'Fitness and notification tracking', price: 5499, categories: ['wearables'], stock: 30, images: ['images/Smartwatch Pro.webp'] },
    { title: 'Bluetooth Speaker', description: 'Portable waterproof sound system', price: 1799, categories: ['audio'], stock: 80, images: ['images/Bluetooth Speaker.webp'] },
    { title: 'Gaming Mouse', description: 'RGB wired ergonomic mouse', price: 1299, categories: ['gaming'], stock: 150, images: ['images/Gaming Mouse.webp'] },
    { title: 'Mechanical Keyboard', description: 'Backlit gaming keyboard', price: 2999, categories: ['gaming'], stock: 70, images: ['images/Mechanical Keyboard.webp'] },
    { title: '4K Monitor 27-inch', description: 'Ultra HD display with HDR', price: 15999, categories: ['computers'], stock: 25, images: ['images/4K Monitor 27-inch.webp'] },
    { title: 'Wireless Charger Pad', description: 'Fast charging Qi-enabled pad', price: 999, categories: ['accessories'], stock: 200, images: ['images/Wireless Charger Pad.webp'] },
    { title: 'Smart LED Bulb', description: 'WiFi bulb controllable via app', price: 699, categories: ['home'], stock: 300, images: ['images/Smart LED Bulb.webp'] },
    { title: 'Capital Ideas Book', description: 'Essential business strategy guide', price: 799, categories: ['books'], stock: 120, images: ['images/CAPITAL IDEAS.webp'] },
    { title: 'Business Book Collection', description: 'Complete business book series', price: 1299, categories: ['books'], stock: 50, images: ['images/BOOK.webp'] },
    { title: 'Electronics Starter Kit', description: 'Complete electronics bundle for beginners', price: 3499, categories: ['electronics'], stock: 40, images: ['images/ELE1.webp'] },
    { title: 'Advanced Electronics Kit', description: 'Professional electronics components set', price: 4999, categories: ['electronics'], stock: 30, images: ['images/ELE2.webp'] }
  ];
  await Product.insertMany(products);
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('admin123', salt);
  await User.create({ name: 'Admin User', email: 'admin@local', passwordHash: hash, roles: ['admin'] });
  console.log('Seeded sample data');
  process.exit();
}
run().catch(err => { console.error(err); process.exit(1) });
