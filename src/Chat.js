import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';

const Chat = ({ username, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);

  const fetchMessages = async () => {
    const response = await axios.get('http://localhost:5000/api/messages');
    setMessages(response.data.messages);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    formData.append('message', newMessage);
    if (file) {
      formData.append('file', file);
    }

    try {
      await axios.post('http://localhost:5000/api/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setNewMessage('');
      setFile(null);
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const deleteMessage = async (timestamp) => {
    try {
      await axios.post('http://localhost:5000/api/messages/delete', {
        timestamp,
        username,
      });
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg) => (
          <div 
            key={msg.timestamp} 
            className={`chat-message ${msg.username === username ? 'sender' : 'receiver'}`}
          >
            <p><strong>{msg.username}:</strong> {msg.message}</p>
            {msg.file && (
              <div>
                {msg.file.endsWith('.mp4') ? (
                  <video src={`http://localhost:5000${msg.file}`} controls width="200" />
                ) : (
                  <img src={`http://localhost:5000${msg.file}`} alt="Uploaded" className="chat-image" />
                )}
              </div>
            )}
            {msg.username === username && (
              <button onClick={() => deleteMessage(msg.timestamp)}>Delete</button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="file-input"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
