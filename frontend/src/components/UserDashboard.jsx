import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [prescriptions, setPrescriptions] = useState([]);  // Store multiple prescriptions

  const handleAnswerChange = (e, questionId) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionId] = e.target.value;
      return newAnswers;
    });
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

    const score = results.filter(result => result.correct).length;
    setResult(`You scored ${score} out of ${questions.length}`);
  };

  // Fetch patient-specific prescription data on component mount
  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/prescriptions?patientName=${user.name}`);
        setPrescriptions(response.data); // Set the prescription list for the patient
      } catch (error) {
        console.error('Error fetching prescription:', error);
      }
    };
    
    fetchPrescription();
  }, [user.name]); // Re-fetch if user name changes

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <h2>Welcome, {user.name}</h2>

      {/* Quiz Card */}
      <div
        onClick={() => setShowQuiz(!showQuiz)}
        style={{
          cursor: 'pointer',
          background: '#e3f2fd',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          textAlign: 'center'
        }}
      >
        <h3 style={{ margin: 0 }}>📝 Take Quiz</h3>
      </div>

      {/* View Prescription Card */}
      <div
        onClick={() => setShowPrescription(!showPrescription)}
        style={{
          cursor: 'pointer',
          background: '#e3f2fd',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          textAlign: 'center'
        }}
      >
        <h3 style={{ margin: 0 }}>📄 View Prescription</h3>
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
          {result && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{result}</p>}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
