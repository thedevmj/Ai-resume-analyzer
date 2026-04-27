const axios = require('axios');

const response = await axios.post('http://localhost:11434/api/generate', {
  model: 'llama3',
  prompt: prompt,
  stream: false
});

const results = response.data.response;