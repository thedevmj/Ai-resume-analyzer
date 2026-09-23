require('dotenv').config({ path: './config/config.env' });
const uploadRoutes = require('./routes/upLoadRoutes');
const authroutes=require('./routes/auth-routes');
const connectDb = require('./db');
const express = require('express');
const app = express();
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
app.use((req, res, next) => {
  const devOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];
  const extraOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean);
  const allowedOrigins = [...devOrigins, ...extraOrigins];
  const origin = req.headers.origin;

  res.setHeader("Vary", "Origin");

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ message: "Not allowed by CORS" });
  }

  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});
app.use('/upload', uploadRoutes);
app.use('/auth',authroutes);
console.log("Server file loaded");

app.get('/', (req, res) => {

  res.send('Main server working');
});

// Global error handler - always respond with JSON
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const PORT = parseInt(process.env.PORT, 10) || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Main server running on ${PORT}`);
});