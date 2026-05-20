import dotenv from 'dotenv';
dotenv.config({ path: process.cwd() + '/.env' });

import express from 'express';
import passport from 'passport';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import log from './utils/logger.js';

// --- Middleware Imports ---
import errorHandler from './middlewares/error.middleware.js';

// --- Passport Config ---
import './config/google.passport.js';
import './config/github.passport.js';

// --- Route Imports ---
// Core Platform Routes
import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import hackathonRoutes from './routes/hackathon.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import evaluationRoutes from './routes/evaluation.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import otpRoutes from './routes/otp.routes.js';

// Search & Recommendation Routes
import searchRoutes from './routes/search.routes.js';
import problemRoutes from './routes/problem.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';
import judgeRoutes from './routes/judge.routes.js';

// Additional Routes
import adminRoutes from './routes/admin.routes.js';
import profileRoutes from './routes/profile.routes.js';
import organizerRoutes from './routes/organizer.routes.js';
import participantRoutes from './routes/participant.routes.js';

// Resolve paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ================= CORS ================= */
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173').split(',');
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes('*')) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
);

/* ================= RATE LIMITER ================= */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000000, // requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

/* ================= MIDDLEWARES ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);
app.use(passport.initialize());

/* ================= REQUEST LOGGER ================= */
app.use((req, res, next) => {
  log.request(req.method, req.originalUrl);
  next();
});

// Middleware: Static Files (Resolve 'public' relative to 'src')
app.use(express.static(path.join(__dirname, '../public')));

/* ================= ROUTES ================= */
// Core API Routes
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/auth', otpRoutes);

// Search & Recommendation Routes
app.use('/api/search', searchRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Additional Routes
app.use('/api/judge', judgeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/participant', participantRoutes);

/* ================= HEALTH CHECK ================= */
app.get('/test', (req, res) => {
  res.status(200).json({ success: true, message: 'API is working fine' });
});

// Root Endpoint (Serve React/HTML frontend)
// This MUST be the last route to handle SPA routing (client-side routes)
app.get('*path', (req, res) => {
  // If the request starts with /api, it's a 404 (handled by the next middleware)
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Route not found' });
  }
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// 404 Handler (This will now only be hit for /api routes not caught above)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

/* ================= ERROR HANDLER ================= */
app.use(errorHandler);

export default app;