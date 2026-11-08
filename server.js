const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow your frontend domain later (or keep * for now)
app.use(cors({
  origin: '*' // Change this later to your frontend domain for security
}));

app.use(express.json());

// Health check (Render uses this)
app.get('/', (req, res) => {
  res.json({ status: 'TikTok Downloader API is running' });
});

// Main endpoint
app.get('/api/download', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing url parameter' 
      });
    }

    // Call TikWM API with HD
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const data = await response.json();

    if (data.code !== 0) {
      return res.status(400).json({
        success: false,
        message: data.msg || 'Failed to fetch video'
      });
    }

    const video = data.data;

    // Prefer HD → No watermark → Watermarked
    const downloadUrl = video.hdplay || video.play || video.wmplay;

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
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});