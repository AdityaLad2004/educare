const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  prescription: { type: String, required: true },
  dateIssued: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
