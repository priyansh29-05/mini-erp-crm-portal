const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');

app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);

// Health-check endpoint
// This verifies that the server is running and can connect to the database.
app.get('/health', async (req, res) => {
  try {
    // Simple query to verify database connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'UP',
      message: 'Server is healthy and database is connected.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({
      status: 'DOWN',
      message: 'Server is running, but database connection failed.',
      error: error.message,
    });
  }
});

// Start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
