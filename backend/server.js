const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const userRoutes = require('./routes/userRoutes');
const prescriptionRoutes = require('./routes/prescriptions');
const Appointment = require('./models/Appointment');
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Load environment variables from the .env file
dotenv.config();
const app = express();

const s3 = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });




// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB using the URI from the environment variable
mongoose.connect(process.env.MONGO_URI, {
  
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.log("MongoDB connection failed", err);
});

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'radhas-bucket',
      key: function (req, file, cb) {
        cb(null, `uploads/${Date.now()}_${file.originalname}`);
      }
    })
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Create Appointment Route
app.post('/api/appointments', async (req, res) => {
  try {
    const { patientName, date, time } = req.body;

    const appointment = new Appointment({
      patientName,
      date,
      time
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment created successfully' });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch Appointment Route
app.get('/api/appointments', async (req, res) => {
  try {
    const { patientName } = req.query;
    const filter = patientName ? { patientName } : {};

    const appointments = await Appointment.find(filter).sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.status(200).json({
      message: 'File uploaded successfully!',
      fileUrl: req.file.location // S3 URL of the uploaded file
    });
  } else {
    res.status(400).json({ message: 'Failed to upload file.' });
  }
});

app.get('/list-documents', async (req, res) => {
    try {
      const command = new ListObjectsV2Command({
        Bucket: 'radhas-bucket',
      });
  
      const data = await s3.send(command);
  
      const documents = (data.Contents || []).map(doc => ({
        key: doc.Key,
        lastModified: doc.LastModified,
        size: doc.Size,
      }));
  
      res.json({ documents });
    } catch (err) {
      console.error('Error fetching S3 documents:', err);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
