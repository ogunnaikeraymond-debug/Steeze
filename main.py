from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp

app = FastAPI()

# Enable CORS for your Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "online", "name": "Prime Custom API"}

@app.post("/api/download")
def download_tiktok(payload: dict):
    url = payload.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="TikTok URL is required.")

    ydl_opts = {
        'format': 'best',
        'quiet': True,
        'no_warnings': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Format the extracted metadata to match your frontend expectations
            return {
                "code": 0,
                "data": {
                    "title": info.get("title", "TikTok Video"),
                    "cover": info.get("thumbnail", ""),
                    "author": {
                        "unique_id": info.get("uploader_id", "creator"),
                        "nickname": info.get("uploader", "Unknown Creator"),
                        "avatar": ""
                    },
                    "hdplay": info.get("url", ""),
                    "play": info.get("url", ""),
                    "music": info.get("url", "")
                }
            }
    except Exception as e:
        print(f"Extraction Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to extract video: {str(e)}")
        