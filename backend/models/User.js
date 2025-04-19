const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'doctor'], default: 'user' },
  wardName: { type: String, required: function() { return this.role === 'user'; } },
  wardAge: { type: Number, required: function() { return this.role === 'user'; } },
  wardGender: { type: String, enum: ['male', 'female', 'other'], required: function() { return this.role === 'user'; } },
  quizScores: [
    {
      game: String, 
      score: Number,
      date: { type: Date, default: Date.now }
    }
  ],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
