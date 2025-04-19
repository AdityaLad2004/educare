const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password, role, wardName, wardAge, wardGender } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserData = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    // Add ward details only if role is 'user'
    if (role === 'user') {
      newUserData.wardName = wardName;
      newUserData.wardAge = wardAge;
      newUserData.wardGender = wardGender;
    }

    const newUser = new User(newUserData);

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
      quizScores: user.quizScores,
    }));
    res.status(200).json({ userPerformance });
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch user data', details: err });
  }
});

router.get('/detail-score', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Parent name is required in query' });
    }

    // Find users where parentName (or similar field) matches
    const users = await User.find({ parentName: name });

    const userPerformance = users.map(user => ({
      name: user.name,
      quizScores: user.quizScores,
    }));

    res.status(200).json({ userPerformance });
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch user data', details: err });
  }
});

router.get('/patients', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });
    const userStats = users.map(user => ({
      name: user.wardName,
      age: user.wardAge,
      gender: user.wardGender,
    }));
    res.status(200).json({ userStats });
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch user data', details: err });
  }
});

router.get('/parent', async (req, res) => {
  const { name } = req.query; // Assuming the name is passed as a query parameter

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    // Find the user by their name
    const user = await User.findOne({ name });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user role is 'user' and return their parent and ward details
    if (user.role === 'user') {
      const parentData = {
        name: user.name,
        wardName: user.wardName,
        wardAge: user.wardAge,
        wardGender: user.wardGender,
      };

      return res.status(200).json(parentData);
    }

    // If the role is not 'user', deny access to this route
    return res.status(403).json({ error: 'Access denied' });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/score', async (req, res) => {
  const { name, score, game } = req.body;  // Accept 'game' and 'score' in the request body

  if (!name || score === undefined || !game) {
    return res.status(400).json({ error: 'Name, score, and game are required' });
  }

  try {
    // Find the user by their name
    const user = await User.findOne({ name });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user role is 'user' (you can modify this check if needed)
    if (user.role === 'user') {
      // Push the new score for the specific game into the quizScores array
      user.quizScores.push({ game, score });

      // Save the updated user document
      await user.save();

      return res.status(200).json({ message: 'Score saved successfully' });
    }

    // If the role is not 'user', deny access to this route
    return res.status(403).json({ error: 'Access denied' });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/scores', async (req, res) => {
  const { wardName } = req.query;

  if (!wardName) {
    return res.status(400).json({ error: 'wardName is required' });
  }

  try {
    const user = await User.findOne({ wardName }, 'quizScores');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ quizScores: user.quizScores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/ward/:wardName', async (req, res) => {
  try {
    const user = await User.findOne({ wardName: req.params.wardName, role: 'user' });
    if (!user) return res.status(404).json({ message: 'Patient not found' });

    res.json({ quizScores: user.quizScores });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/scoresbyparent', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'wardName is required' });
  }

  try {
    const user = await User.findOne({ name }, 'quizScores');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ quizScores: user.quizScores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
