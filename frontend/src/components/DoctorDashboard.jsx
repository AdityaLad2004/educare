import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DoctorDashboard() {
  const [performance, setPerformance] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [showPerformance, setShowPerformance] = useState(false);
  const [prescriptions, setPrescriptions] = useState({});
  const [showPrescriptionForm, setShowPrescriptionForm] = useState({});
  const [appointments, setAppointments] = useState([]);

  const [showDocuments, setShowDocuments] = useState(false);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/doctor-dashboard');
        const enriched = res.data.userPerformance.map((user) => {
          const total = user.quizResults.length;
          const correct = user.quizResults.filter(q => q.correct).length;
          const accuracy = total > 0 ? ((correct / total) * 100).toFixed(2) : 0;
          return { ...user, total, correct, accuracy };
        });
        setPerformance(enriched);
      } catch (err) {
        console.error('Failed to fetch performance:', err);
      }
    };
    fetchPerformance();

    const fetchPatients = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/patients');
        
      } catch (err) {
        console.error('Failed to fetch performance:', err);
      }
    };
    fetchPatients();

    const fetchAppointments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/appointments');
        setAppointments(res.data);
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      }
    };
    fetchAppointments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/list-documents');
      setDocuments(res.data.documents);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      alert('Error loading cloud documents.');
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePrescriptionChange = (id, value) => {
    setPrescriptions((prev) => ({ ...prev, [id]: value }));
  };

  const handlePrescriptionSubmit = async (id, name) => {
    try {
      await axios.post('http://localhost:5000/api/prescriptions', {
        patientName: name,
        prescription: prescriptions[id] || ''
      });
      alert('Prescription submitted successfully!');
      setPrescriptions((prev) => ({ ...prev, [id]: '' }));
      setShowPrescriptionForm((prev) => ({ ...prev, [id]: false }));
    } catch (err) {
      console.error('Failed to submit prescription:', err);
      alert('Failed to submit prescription.');
    }
  };

  const sortedPerformance = [...performance].sort((a, b) => {
    if (sortBy === 'accuracy') return b.accuracy - a.accuracy;
    if (sortBy === 'total') return b.total - a.total;
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Doctor Dashboard</h1>

      {/* View Patients */}
      <div
        onClick={() => setShowPerformance(!showPerformance)}
        style={{
          cursor: 'pointer',
          background: '#e0f7fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          width: 'fit-content'
        }}
      >
        <h3 style={{ margin: 0 }}>👨‍⚕️ View Patients</h3>
      </div>

      {/* View Cloud Documents */}
      <div
        onClick={() => {
          setShowDocuments(!showDocuments);
          if (!showDocuments) fetchDocuments();
        }}
        style={{
          cursor: 'pointer',
          background: '#e0f7fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          width: 'fit-content'
        }}
      >
        <h3 style={{ margin: 0 }}>☁️ View Cloud Documents</h3>
      </div>

      {showDocuments && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Cloud Documents</h2>
          {documents.length === 0 ? (
            <p>No documents found in S3 bucket.</p>
          ) : (
            <ul>
              {documents.map((doc, i) => (
                <li key={i}>
                  <strong>{doc.key}</strong> — {Math.round(doc.size / 1024)} KB,
                  Last Modified: {new Date(doc.lastModified).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showPerformance && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label>Sort By: </label>
            <select onChange={handleSortChange} value={sortBy}>
              <option value="name">Name</option>
              <option value="accuracy">Accuracy (%)</option>
              <option value="total">Total Attempts</option>
            </select>
          </div>

          {sortedPerformance.length === 0 ? (
            <p>No data available</p>
          ) : (
            sortedPerformance.map((user, index) => (
              <div key={index} style={{
                border: '1px solid #ccc',
                padding: '15px',
                marginBottom: '20px',
                borderRadius: '10px',
                background: '#f9f9f9'
              }}>
                <h3>{user.name}</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Total Attempts:</strong> {user.total}</p>
                <p><strong>Correct Answers:</strong> {user.correct}</p>
                <p><strong>Accuracy:</strong> {user.accuracy}%</p>

                <h4>Question-wise Breakdown:</h4>
                <table border="1" cellPadding="8" style={{ width: '100%', textAlign: 'left' }}>
                  <thead>
                    <tr>
                      <th>Question ID</th>
                      <th>Selected Answer</th>
                      <th>Correct?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.quizResults.map((result, i) => (
                      <tr key={i}>
                        <td>{result.questionId}</td>
                        <td>{result.selectedAnswer}</td>
                        <td>{result.correct ? '✅ Correct' : '❌ Incorrect'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  style={{ marginTop: '10px' }}
                  onClick={() => setShowPrescriptionForm((prev) => ({
                    ...prev,
                    [user._id]: !prev[user._id]
                  }))}
                >
                  📝 Give Prescription
                </button>

                {showPrescriptionForm[user._id] && (
                  <div style={{ marginTop: '10px' }}>
                    <textarea
                      rows="3"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px' }}
                      placeholder="Enter prescription here..."
                      value={prescriptions[user._id] || ''}
                      onChange={(e) => handlePrescriptionChange(user._id, e.target.value)}
                    />
                    <button
                      style={{ marginTop: '6px', padding: '8px 16px' }}
                      onClick={() => handlePrescriptionSubmit(user._id, user.name)}
                    >
                      Submit Prescription
                    </button>
                  </div>
                )}

                <h4>Appointments:</h4>
                {appointments.filter(app => app.patientName === user.name).length === 0 ? (
                  <p>No appointments scheduled.</p>
                ) : (
                  <ul>
                    {appointments
                      .filter(app => app.patientName === user.name)
                      .map((app, i) => (
                        <li key={i}>
                          📅 {new Date(app.date).toLocaleDateString()} at {app.time}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default DoctorDashboard;
