const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authenticateToken = require('./middleware/auth');
require('dotenv').config();

const app = express();

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: [
    'http://15.223.69.158:3000',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Wrap connection in promise for better error handling
const connectDB = () => {
  return new Promise((resolve, reject) => {
    db.connect((err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        reject(err);
        return;
      }
      console.log('Connected to MySQL database');
      resolve();
    });
  });
};

// Initialize server only after DB connection
const initializeServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
      }
    });

  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

// Routes will be added here

// Admin login route
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const query = 'SELECT * FROM admins WHERE username = ?';
    db.query(query, [username], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      try {
        const validPassword = await bcrypt.compare(password, results[0].password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      } catch (bcryptError) {
        console.error('Bcrypt error:', bcryptError);
        res.status(500).json({ error: 'Authentication error', details: bcryptError.message });
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Protected routes
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    console.log('Fetching users...');
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      console.log('Users fetched:', results);
      res.json(results);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const query = 'INSERT INTO users (name, email, phone, address) VALUES (?, ?, ?, ?)';
    
    db.query(query, [name, email, phone, address], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.status(201).json({ message: 'User created successfully' });
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Verify token endpoint
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({ valid: true });
});

// Add delete user endpoint
app.delete('/api/users/:id', authenticateToken, (req, res) => {
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Add update user endpoint
app.put('/api/users/:id', authenticateToken, (req, res) => {
  const { name, email, phone, address } = req.body;
  const query = 'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?';
  
  db.query(query, [name, email, phone, address, req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User updated successfully' });
  });
});

// Add global error handler at the end of all routes
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const PORT = process.env.PORT || 5000;
initializeServer(); 
