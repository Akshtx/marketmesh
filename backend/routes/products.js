const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// List & search
router.get('/', async (req,res)=>{
  try{
    const q = req.query.q || '';
    const filter = q ? { $text: { $search: q } } : {};
    const products = await Product.find(filter).limit(100);
    res.json(products);
  }catch(err){ console.error(err); res.status(500).json({ msg: 'Server error' }) }
});

// Get by id
router.get('/:id', async (req,res)=>{
  try{
    const p = await Product.findById(req.params.id);
    if(!p) return res.status(404).json({ msg: 'Not found' });
    res.json(p);
  }catch(err){ console.error(err); res.status(500).json({ msg: 'Server error' }) }
});

module.exports = router;
