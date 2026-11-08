const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to fetch TikTok data via TikWM
app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'TikTok URL is required.' });
    }

    try {
        const tikwmUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
        const response = await axios.get(tikwmUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        if (response.data && response.data.code === 0) {
            return res.json(response.data);
        } else {
            return res.status(400).json({ error: 'Failed to fetch video. Please check if the TikTok link is valid.' });
        }
    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(500).json({ error: 'Internal server error while communicating with TikWM.' });
    }
});

app.listen(PORT, () => {
    console.log(`Prime server is running on port ${PORT}`);
});
