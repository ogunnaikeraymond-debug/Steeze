const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve all static files (HTML, CSS, JS, APKs, version.json) from the root folder
app.use(express.static(path.join(__dirname)));

// Fallback to index.html if a route isn't found (useful for single-page style apps)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Prime Chat server is running on port ${PORT}`);
});
  
