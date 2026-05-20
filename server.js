const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files (no-cache in dev so JS changes are instant)
app.use(express.static(path.join(__dirname, 'FrontEnd'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store');
  },
}));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/workers', require('./routes/worker.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'WorkersConnect API is running' });
});

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'FrontEnd', 'index.html'));
  }
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`WorkersConnect server running on http://localhost:${PORT}`);
});
