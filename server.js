const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Allow public access to everything in this repo (version.json and downloads folder)
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Prime Chat update server running on port ${PORT}`);
});
