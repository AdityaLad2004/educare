import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import DoctorDashboard from './components/DoctorDashboard';

function App() {
  const [user, setUser] = useState(null);

  const navStyle = {
    padding: '15px 30px',
    background: '#4a90e2',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
    fontFamily: 'Segoe UI, sans-serif',
  };

  const linkStyle = {
    marginLeft: '20px',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '500',
  };

  return (
    <Router>
      <div>
        <nav style={navStyle}>
          <h2 style={{ margin: 0 }}>EduCare </h2>
          <div>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
            {user?.role === 'doctor' && <Link to="/doctor-dashboard" style={linkStyle}>Doctor Dashboard</Link>}
            {user?.role === 'user' && <Link to="/user-dashboard" style={linkStyle}>User Dashboard</Link>}
          </div>
        </nav>
        <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/user-dashboard"
              element={
                user ? <UserDashboard user={user} /> : <Login setUser={setUser} />
              }
            />
            <Route
              path="/doctor-dashboard"
              element={
                user && user.role === 'doctor' ? (
                  <DoctorDashboard />
                ) : (
                  <Login setUser={setUser} />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
