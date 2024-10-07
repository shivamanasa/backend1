import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Chat from './Chat';
import Admin from './Admin';
import './styles.css';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Initialize the navigate function

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.31.12:5000/api/login', { username, password });
      if (response.data.success) {
        setIsLoggedIn(true);
        setError('');
        navigate('/chat'); // Redirect to chat page
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="container">
      <Routes>
        <Route path="/admin" element={isLoggedIn && username === 'admin' ? <Admin /> : <div>Please log in to access the admin panel.</div>} />
        <Route path="/chat" element={
          isLoggedIn ? (
            <div className="chat-wrapper">
              <div className="chat-header">
                <span className="user-name">Welcome, {username}</span>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
              </div>
              <Chat username={username} />
            </div>
          ) : (
            <div>Please log in to access the chat.</div>
          )
        } />
        <Route path="/" element={
          !isLoggedIn ? (
            <div className="login-form">
              <h1>Login</h1>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button onClick={handleLogin}>Login</button>
              {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            </div>
          ) : null
        } />
      </Routes>
    </div>
  );
};

// Wrap the App component with Router
const WrappedApp = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;
