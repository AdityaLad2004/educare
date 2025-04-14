const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'doctor'], default: 'user' },
  quizResults: [
    {
      questionId: Number,
      answer: String,
      correct: Boolean,
    },
  ],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
