require('dotenv').config({ path: './config/config.env' });
const uploadRoutes = require('./routes/upLoadRoutes');
const authroutes=require('./routes/auth-routes');
const connectDb = require('./db');
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { apiLimiter } = require('./middleware/rateLimiter');

// Trust the first proxy so rate limits are applied per real client IP
// (required when deployed behind a reverse proxy / platform like Render)
app.set('trust proxy', 1);

connectDb();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);

// Enhanced CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const devOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];
    const extraOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean);
    const allowedOrigins = [...devOrigins, ...extraOrigins];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600
}));
app.use('/upload', uploadRoutes);
app.use('/auth',authroutes);
console.log("Server file loaded");

app.get('/', (req, res) => {

  res.send('Main server working');
});

const PORT = parseInt(process.env.PORT, 10) || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Main server running on ${PORT}`);
});