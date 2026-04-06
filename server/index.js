require('dotenv').config();

const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const rateLimit     = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB     = require('./config/db');

// Routes
const authRoutes      = require('./routes/auth');
const quizRoutes      = require('./routes/quiz');
const analysisRoutes  = require('./routes/analysis');
const journalRoutes   = require('./routes/journal');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes        = require('./routes/ai');

const app = express();
connectDB();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [
  'https://personapath-mirror.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

app.use(mongoSanitize());

// Rate limiters
const globalLimiter = rateLimit({ windowMs: 15*60*1000, max: 200, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests.' } });
const aiLimiter     = rateLimit({ windowMs: 60*1000,    max: 15,  message: { error: 'AI limit reached. Wait a minute.' } });
const authLimiter   = rateLimit({ windowMs: 15*60*1000, max: 20,  message: { error: 'Too many auth attempts.' } });

app.use('/api/', globalLimiter);
app.use('/api/ai/', aiLimiter);
app.use('/api/auth/', authLimiter);

app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// All routes
app.use('/api/auth',      authRoutes);
app.use('/api/quiz',      quizRoutes);
app.use('/api/analysis',  analysisRoutes);
app.use('/api/journal',   journalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai',        aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', aiEnabled: !!process.env.OPENAI_API_KEY, ts: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  if (err.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
  if (err.name === 'CastError')       return res.status(400).json({ error: 'Invalid ID.' });
  if (err.code === 11000)             return res.status(409).json({ error: 'Duplicate entry.' });
  res.status(err.status || 500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 AI features: ${process.env.OPENAI_API_KEY ? 'ENABLED' : '❌ MISSING OPENAI_API_KEY'}`);
});
