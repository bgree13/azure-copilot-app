require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 80;

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(express.json());

// Route for the homepage — loads MCG landing page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/mcg.html');
});

// Optional separate route (still accessible if needed)
app.get('/mcg', (req, res) => {
  res.sendFile(__dirname + '/public/mcg.html');
});

// Azure OpenAI chat API route
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`,
      {
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'api-key': process.env.AZURE_OPENAI_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Something went wrong.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
