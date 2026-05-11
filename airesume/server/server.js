require('dotenv').config({ path: './config/config.env' });
const uploadRoutes = require('./routes/upLoadRoutes');
const authroutes=require('./routes/auth-routes');
const connectDb = require('./db');
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

connectDb();

app.use(express.json());
app.use(cookieParser());

// Enhanced CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];
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

app.listen(5000, () => {
  console.log("Main server running on 5000");
});