const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'online', name: 'Prime API' });
});

app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'TikTok URL is required.' });
    }

    try {
        // TikWM expects a POST request with form-urlencoded data
        const params = new URLSearchParams();
        params.append('url', url);
        params.append('hd', '1'); // Request HD quality

        const response = await axios.post('https://www.tikwm.com/api/', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://www.tikwm.com/'
            }
        });

        if (response.data && response.data.code === 0) {
            return res.json(response.data);
        } else {
            console.error('TikWM rejected request:', response.data);
            return res.status(400).json({ error: response.data.msg || 'Failed to fetch video. Please check if the TikTok link is valid.' });
        }
    } catch (error) {
        console.error('API Error Details:', error.response?.data || error.message);
        return res.status(500).json({ error: `Server communication error: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`Prime backend is running on port ${PORT}`);
});
  
