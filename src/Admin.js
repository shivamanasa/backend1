import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    const response = await axios.get('http://192.168.31.12:5000/api/users');
    setUsers(response.data);
  };

  const updateUser = async () => {
    if (selectedUser) {
      await axios.post('http://192.168.31.12:5000/api/users/update', {
        username: selectedUser,
        newUsername,
        newPassword,
      });
      fetchUsers();
      setSelectedUser('');
      setNewUsername('');
      setNewPassword('');
    }
  };

  const createUser = async () => {
    const username = prompt("Enter new username:");
    const password = prompt("Enter new password:");
    if (username && password) {
      await axios.post('http://192.168.31.12:5000/api/users/create', {
        username,
        password,
      });
      fetchUsers();
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>
      <button onClick={createUser}>Create New User</button>
      <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
        <option value="">Select a user</option>
        {users.map((user, index) => (
          <option key={index} value={user.username}>{user.username}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="New Username"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={updateUser}>Update User</button>
    </div>
  );
};

export default Admin;
