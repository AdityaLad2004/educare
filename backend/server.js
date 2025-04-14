const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const prescriptionRoutes = require('./routes/prescriptions');

// Load environment variables from the .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB using the URI from the environment variable
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("MongoDB connection failed", err);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
