const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Prime API is running' });
});

app.get('/api/download', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Missing url parameter'
      });
    }

    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.tikwm.com/'
      }
    });

    const contentType = response.headers.get('content-type') || '';

    // If TikWM returns HTML instead of JSON (rate limit / block)
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('TikWM returned non-JSON:', text.substring(0, 200));
      return res.status(502).json({
        success: false,
        message: 'TikWM is temporarily unavailable or rate-limited. Please try again in a few seconds.'
      });
    }

    const data = await response.json();

    if (data.code !== 0) {
      return res.status(400).json({
        success: false,
        message: data.msg || 'Failed to fetch video from TikWM'
      });
    }

    const video = data.data;
    const downloadUrl = video.hdplay || video.play || video.wmplay;

    if (!downloadUrl) {
      return res.status(404).json({
        success: false,
        message: 'No downloadable video found'
      });
    }

    res.json({
      success: true,
      data: {
        id: video.id,
        title: video.title,
        duration: video.duration,
        cover: video.cover || video.origin_cover,
        author: {
          unique_id: video.author?.unique_id,
          nickname: video.author?.nickname,
          avatar: video.author?.avatar
        },
        download: {
          hd: video.hdplay || null,
          no_watermark: video.play || null,
          with_watermark: video.wmplay || null,
          music: video.music || null,
          preferred: downloadUrl
        },
        stats: {
          play_count: video.play_count,
          digg_count: video.digg_count,
          comment_count: video.comment_count,
          share_count: video.share_count
        }
      }
    });

  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Prime API running on port ${PORT}`);
});