const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep the original filename
  },
});
const upload = multer({ storage });

// Ensure the uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const dataFilePath = path.join(__dirname, 'data.json');
const messagesFilePath = path.join(__dirname, 'chat.json');

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  fs.readFile(dataFilePath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Could not read data' });

    const users = JSON.parse(data);
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false });
    }
  });
});

// Get all users (for admin)
app.get('/api/users', (req, res) => {
  fs.readFile(dataFilePath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Could not read data' });
    res.json(JSON.parse(data));
  });
});

// Create new user (for admin)
app.post('/api/users/create', (req, res) => {
  const { username, password } = req.body;

  fs.readFile(dataFilePath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Could not read data' });

    const users = JSON.parse(data);
    const userExists = users.some(user => user.username === username);

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    users.push({ username, password });
    fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Could not save data' });
      res.json({ success: true });
    });
  });
});

// Update user credentials (for admin)
app.post('/api/users/update', (req, res) => {
  const { username, newUsername, newPassword } = req.body;

  fs.readFile(dataFilePath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Could not read data' });

    let users = JSON.parse(data);
    const userIndex = users.findIndex(user => user.username === username);

    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    if (newUsername) users[userIndex].username = newUsername;
    if (newPassword) users[userIndex].password = newPassword;

    fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Could not save data' });
      res.json({ success: true });
    });
  });
});

// Handle incoming messages with optional file upload
app.post('/api/messages', upload.single('file'), (req, res) => {
  const { username, message } = req.body;

  if (!username || (!message && !req.file)) {
    return res.status(400).json({ error: 'Username and message or file are required' });
  }

  const newMessage = {
    username,
    message: message || '',
    timestamp: new Date().toISOString(),
    file: req.file ? `/uploads/${req.file.filename}` : null,
  };

  fs.readFile(messagesFilePath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Could not read messages' });

    const messages = JSON.parse(data);
    messages.messages.push(newMessage);

    fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Could not save message' });
      res.json({ success: true, message: newMessage });
    });
  });
});

// Fetch all messages
app.get('/api/messages', (req, res) => {
  fs.readFile(messagesFilePath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Could not read messages' });
    res.json(JSON.parse(data));
  });
});

// Delete a message
app.post('/api/messages/delete', (req, res) => {
  const { timestamp, username } = req.body;

  fs.readFile(messagesFilePath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Could not read messages' });

    let messages = JSON.parse(data);
    messages.messages = messages.messages.filter(msg => msg.timestamp !== timestamp || msg.username !== username);

    fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Could not save messages' });
      res.json({ success: true });
    });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
