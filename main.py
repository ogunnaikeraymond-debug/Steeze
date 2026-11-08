from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import yt_dlp
import httpx

app = FastAPI()

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
    """Proxies the TikTok CDN stream and forces a direct file download."""
    try:
        client = httpx.AsyncClient(follow_redirects=True, timeout=60.0)
        req = client.build_request("GET", url)
        r = await client.send(req, stream=True)
        
        if r.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch video stream from CDN")

        return StreamingResponse(
            r.aiter_bytes(),
            media_type="video/mp4",
            headers={
                "Content-Disposition": 'attachment; filename="prime_tiktok_video.mp4"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
