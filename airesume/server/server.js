require('dotenv').config({ path: './config/config.env' });
const uploadRoutes = require('./routes/upLoadRoutes');
const authroutes=require('./routes/auth-routes');
const connectDb = require('./db');
const express = require('express');
const app = express();
const cors = require('cors');

connectDb();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
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