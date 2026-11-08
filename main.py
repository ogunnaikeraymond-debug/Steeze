from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from starlette.background import BackgroundTask
import yt_dlp
import httpx

app = FastAPI()

# Enable CORS so your Vercel frontend can communicate with this backend
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

@app.get("/api/download-file")
async def download_file(url: str = Query(...)):
    """Proxies the TikTok CDN stream safely using httpx request building and streaming."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Referer": "https://www.tiktok.com/",
        }
        
        client = httpx.AsyncClient(follow_redirects=True, timeout=60.0)
        req = client.build_request("GET", url, headers=headers)
        r = await client.send(req, stream=True)
        
        if r.status_code != 200:
            await r.aclose()
            await client.aclose()
            raise HTTPException(status_code=400, detail=f"Failed to fetch video stream from CDN (Status: {r.status_code})")

        return StreamingResponse(
            r.aiter_bytes(),
            media_type="video/mp4",
            headers={
                "Content-Disposition": 'attachment; filename="prime_tiktok_video.mp4"'
            },
            background=BackgroundTask(r.aclose)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
