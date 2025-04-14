const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');

// POST create a prescription
router.post('/', async (req, res) => {
  const { patientName, prescription } = req.body;

  if (!patientName || !prescription) {
    return res.status(400).json({ message: 'Patient name and prescription are required' });
  }

  try {
    const newPrescription = new Prescription({ patientName, prescription });
    await newPrescription.save();
    res.status(201).json({ message: 'Prescription saved successfully' });
  } catch (error) {
    console.error('Failed to save prescription:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/', async (req, res) => {
    try {
      const { patientName } = req.query;
  
      if (!patientName) {
        return res.status(400).json({ message: 'Patient name is required' });
      }
  
      // Find prescriptions only for the specific patient
      const prescriptions = await Prescription.find({ patientName: patientName });
  
      if (prescriptions.length === 0) {
        return res.status(404).json({ message: 'No prescriptions found for this patient' });
      }
  
      res.status(200).json(prescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      res.status(500).json({ message: 'Server error, please try again later' });
    }
  });
module.exports = router;
