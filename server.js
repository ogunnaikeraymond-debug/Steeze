const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 👉 ADD THIS ROOT ROUTE
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        name: 'Prime API', 
        message: 'Backend is running successfully!' 
    });
});

// Your existing download API endpoint
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
    console.log(`Prime backend is running on port ${PORT}`);
});
