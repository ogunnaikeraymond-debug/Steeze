const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files from the root folder (like your downloads/ folder)
app.use(express.static(path.join(__dirname)));

// Root route so visiting the URL doesn't show "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Prime Chat Update Server is Live & Running!');
});

// Explicit route for version.json check
app.get('/version.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'version.json'));
});

app.listen(PORT, () => {
  console.log(`Prime Chat update server running on port ${PORT}`);
});
