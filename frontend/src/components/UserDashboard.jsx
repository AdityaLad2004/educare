import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function UserDashboard({ user }) {
  const questions = [
    { id: 1, question: 'What is 2+2?', options: ['3', '4', '5'], correct: '4' },
    { id: 2, question: 'What color is the sky?', options: ['Blue', 'Green', 'Red'], correct: 'Blue' },
    { id: 3, question: 'What is 5+3?', options: ['7', '8', '9'], correct: '8' },
    { id: 4, question: 'What is the sound of a dog?', options: ['Meow', 'Woof', 'Moo'], correct: 'Woof' },
  ];

  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showAppointments, setShowAppointments] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({ date: '', time: '' });
  const [document, setDocument] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const cardStyle = {
    cursor: 'pointer',
    background: '#e3f2fd',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    textAlign: 'center'
  };

  const handleFileChange = (e) => {
    setDocument(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!document) {
      alert('Please select a document to upload!');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', document);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnswerChange = (e, questionId) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionId] = e.target.value;
      return newAnswers;
    });
  };

  const exportPrescriptionsToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Prescriptions for ${user.name}`, 14, 15);

    const tableData = prescriptions.map((p, index) => [
      index + 1,
      p.patientName,
      p.prescription,
      new Date(p.dateIssued).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 20,
      head: [['#', 'Patient Name', 'Prescription', 'Date Issued']],
      body: tableData,
      theme: 'grid',
    });

    doc.save(`prescriptions_${user.name.replace(/\s/g, '_')}.pdf`);
  };

  const handleSubmit = async () => {
    const results = questions.map((question, index) => ({
      questionId: question.id,
      selectedAnswer: answers[index],
      correct: answers[index] === question.correct,
    }));

    await axios.post('http://localhost:5000/api/users/quiz', {
      userId: user._id,
      results,
    });

    const correctAnswers = results.filter(result => result.correct).length;
    const totalQuestions = questions.length;
    const percentage = (correctAnswers / totalQuestions) * 100;

    let remark = '';
    if (percentage >= 90) remark = '🌟 Excellent';
    else if (percentage >= 70) remark = '👍 Good';
    else if (percentage >= 50) remark = '🙂 Average';
    else remark = '🚧 Needs Improvement';

    setResult({
      score: correctAnswers,
      total: totalQuestions,
      percentage: percentage.toFixed(2),
      remark,
    });
  };

  const fetchAppointmentData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/appointments?patientName=${user.name}`);
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const handleAppointmentChange = (e) => {
    setAppointmentForm({ ...appointmentForm, [e.target.name]: e.target.value });
  };

  const handleAppointmentSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/appointments', {
        patientName: user.name,
        date: appointmentForm.date,
        time: appointmentForm.time
      });
      alert('Appointment scheduled!');
      setAppointmentForm({ date: '', time: '' });
      setShowScheduleForm(false);
      setShowAppointments(true);
      fetchAppointmentData();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Failed to schedule appointment.');
    }
  };

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/prescriptions?patientName=${user.name}`);
        setPrescriptions(response.data);
      } catch (error) {
        console.error('Error fetching prescription:', error);
      }
    };

    fetchPrescription();
    fetchAppointmentData();
  }, [user.name]);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <h2>Welcome, {user.name}</h2>

      <div onClick={() => setShowQuiz(!showQuiz)} style={cardStyle}>
        <h3 style={{ margin: 0 }}>📝 Take Quiz</h3>
      </div>

      <div onClick={() => setShowPrescription(!showPrescription)} style={cardStyle}>
        <h3 style={{ margin: 0 }}>📄 View Prescription</h3>
      </div>

      <div onClick={() => setShowScheduleForm(!showScheduleForm)} style={cardStyle}>
        <h3 style={{ margin: 0 }}>📆 Schedule Appointment</h3>
      </div>

      <div onClick={() => setShowAppointments(!showAppointments)} style={cardStyle}>
        <h3 style={{ margin: 0 }}>📋 View Appointments</h3>
      </div>

      <div onClick={() => setShowDocumentUpload(!showDocumentUpload)} style={cardStyle}>
        <h3 style={{ margin: 0 }}>📑 Add Document</h3>
      </div>

      {showPrescription && prescriptions.length > 0 && (
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
          <h4>Prescription Details</h4>
          {prescriptions.map((prescription, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <p><strong>Patient Name:</strong> {prescription.patientName}</p>
              <p><strong>Prescription:</strong> {prescription.prescription}</p>
              <p><strong>Date Issued:</strong> {new Date(prescription.dateIssued).toLocaleDateString()}</p>
            </div>
          ))}
          <button onClick={exportPrescriptionsToPDF}>📄 Export to PDF</button>
        </div>
      )}

      {showDocumentUpload && (
        <div style={{ marginTop: '20px' }}>
          <input type="file" onChange={handleFileChange} />
          <button
            onClick={handleFileUpload}
            disabled={uploading}
            style={{
              padding: '10px 20px',
              background: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              marginTop: '10px',
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      )}

      {showScheduleForm && (
        <div style={{ marginTop: '10px' }}>
          <label>Date: </label>
          <input type="date" name="date" value={appointmentForm.date} onChange={handleAppointmentChange} />
          <label style={{ marginLeft: '10px' }}>Time: </label>
          <input type="time" name="time" value={appointmentForm.time} onChange={handleAppointmentChange} />
          <button onClick={handleAppointmentSubmit} style={{ marginLeft: '10px' }}>Book</button>
        </div>
      )}

      {showAppointments && (
        <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '10px' }}>
          <h4>Upcoming Appointments</h4>
          {appointments.length === 0 ? (
            <p>No appointments scheduled.</p>
          ) : (
            appointments.map((appt, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <p><strong>Date:</strong> {appt.date}</p>
                <p><strong>Time:</strong> {appt.time}</p>
              </div>
            ))
          )}
        </div>
      )}

      {showQuiz && (
        <div>
          {questions.map((question, index) => (
            <div key={question.id} style={{ marginBottom: '20px' }}>
              <p><strong>{question.question}</strong></p>
              {question.options.map((option, i) => (
                <label key={i} style={{ marginRight: '15px' }}>
                  <input
                    type="radio"
                    name={`q${index}`}
                    value={option}
                    checked={answers[index] === option}
                    onChange={(e) => handleAnswerChange(e, index)}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
          <button
            onClick={handleSubmit}
            style={{
              padding: '10px 20px',
              background: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            Submit
          </button>
          {result && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#e8f5e9',
              borderRadius: '8px',
              border: '1px solid #c8e6c9',
            }}>
              <h4>📊 Performance Summary</h4>
              <p><strong>Score:</strong> {result.score} / {result.total}</p>
              <p><strong>Percentage:</strong> {result.percentage}%</p>
              <p><strong>Remark:</strong> {result.remark}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
