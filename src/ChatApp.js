import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ChatApp = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/messages')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched messages:', data);
                if (Array.isArray(data)) {
                    setMessages(data);
                } else {
                    console.error('Expected an array, got:', data);
                }
            })
            .catch(error => console.error('Error fetching messages:', error));
    }, []);

    const sendMessage = () => {
        const message = { text: newMessage, id: uuidv4() }; // Generate a unique ID

        fetch('http://localhost:5000/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
        })
        .then(response => response.json())
        .then(data => {
            setMessages(prevMessages => [...prevMessages, data]);
            setNewMessage('');
        })
        .catch(error => console.error('Error sending message:', error));
    };

    return (
        <div>
            <h1>Chat</h1>
            <div>
                {messages.map(msg => (
                    <div key={msg.id}>{msg.text}</div> // Unique key prop
                ))}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default ChatApp;
