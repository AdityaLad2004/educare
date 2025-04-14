import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/register', { name, email, password, role });
      alert('Registration successful!');
    } catch (error) {
      console.error('Registration error', error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', background: '#f4f4f4', borderRadius: '10px' }}>
      <h2>Register</h2>
      <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0' }} />
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
      <select onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
        <option value="user">User</option>
        <option value="doctor">Doctor</option>
      </select>
      <button onClick={handleRegister} style={{ width: '100%', padding: '10px', background: '#4a90e2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Register</button>
    </div>
  );
}

export default Register;
