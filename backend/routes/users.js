const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Simple JWT auth middleware
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

// Return current user's profile
router.get('/me', requireAuth, async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		if (!user) return res.status(404).json({ msg: 'User not found' });
		res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, createdAt: user.createdAt });
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: 'Server error' });
	}
});

// Update current user's profile (phone, address)
router.put('/me', requireAuth, async (req, res) => {
	try {
		const { phone, address } = req.body;
		const user = await User.findById(req.userId);
		if (!user) return res.status(404).json({ msg: 'User not found' });
		
		if (phone !== undefined) user.phone = phone;
		if (address !== undefined) user.address = address;
		
		await user.save();
		res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, createdAt: user.createdAt });
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: 'Server error' });
	}
});

module.exports = router;

