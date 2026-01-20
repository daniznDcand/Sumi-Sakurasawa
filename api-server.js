import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function extractYouTubeId(url) {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9\-\_]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9\-\_]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9\-\_]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function getVideoDescription(url) {
  try {
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    const apiUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.error) {
      throw new Error('Video not found');
    }
    
    return {
      title: data.title || 'No title available',
      description: data.description || 'No description available',
      author: data.author_name || 'Unknown',
      thumbnail: data.thumbnail_url || '',
      url: data.url || url,
      videoId: videoId
    };
  } catch (error) {
    console.error('Error getting video description:', error);
    throw error;
  }
}

app.get('/api/description', async (req, res) => {
  try {
    const { url, apikey } = req.query;
    
    if (!url) {
      return res.status(400).json({
        status: false,
        message: 'URL parameter is required'
      });
    }

    if (!apikey) {
      return res.status(400).json({
        status: false,
        message: 'API key is required'
      });
    }

    if (apikey !== 'kujou-4548') {
      return res.status(401).json({
        status: false,
        message: 'Invalid API key'
      });
    }

    const descriptionData = await getVideoDescription(url);
    
    res.json({
      status: true,
      message: 'Video description retrieved successfully',
      data: descriptionData
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Internal server error'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🎵 Video Description API running on port ${PORT}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET /api/description?url=YOUTUBE_URL&apikey=kujou-4548`);
  console.log(`   GET /api/health`);
});

export default app;
