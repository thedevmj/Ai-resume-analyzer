require('dotenv').config({ path: './config/config.env' });
const uploadRoutes = require('./routes/upLoadRoutes');

const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());
app.use('/upload', uploadRoutes);
console.log("Server file loaded");

app.get('/', (req, res) => {
  res.send('Main server working');
});

app.listen(5000, () => {
  console.log("Main server running on 5000");
});