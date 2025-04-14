const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ name, email, password: hashedPassword, role });
  try {
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed', details: err });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  res.status(200).json({ message: 'Login successful', user });
});

// Save quiz results
router.post('/quiz', async (req, res) => {
  const { userId, results } = req.body;

  try {
    const user = await User.findById(userId);
    user.quizResults = results;
    await user.save();
    res.status(200).json({ message: 'Quiz results saved successfully!' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to save quiz results', details: err });
  }
});

// Get all users and their performance for doctor
router.get('/doctor-dashboard', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });
    const userPerformance = users.map(user => ({
      name: user.name,
      quizResults: user.quizResults,
    }));
    res.status(200).json({ userPerformance });
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch user data', details: err });
  }
});

module.exports = router;
