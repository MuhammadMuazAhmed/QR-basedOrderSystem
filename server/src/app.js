const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { allowedOrigins, nodeEnv } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const tableRoutes = require('./routes/tableRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

const allowedOriginSet = new Set(allowedOrigins);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOriginSet.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));
if (nodeEnv !== 'test') app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));

// Basic rate limiting on order/waiter-call creation to deter abuse from a
// single device (e.g. accidental double-submits, or someone spamming call-waiter).
const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please slow down.' },
});
app.use('/api/orders', orderLimiter);

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
