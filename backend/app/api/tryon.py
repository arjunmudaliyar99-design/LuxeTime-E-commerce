import logging
import os
import json
import asyncio
from pathlib import Path
from typing import Optional
from functools import lru_cache
from fastapi import APIRouter, UploadFile, File, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator
import cv2
import numpy as np
from io import BytesIO
import base64
import time

from app.cv.watch_tryon import WatchTryOn
from app.core.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()

WATCH_IMAGES_DIR = Path(__file__).parent.parent.parent / "assets" / "watches"
WATCH_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

MAX_IMAGE_DIMENSION = 1920
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}


# Models
class Watch(BaseModel):
    id: str
    name: str
    brand: Optional[str] = None
    price: float
    image_path: str
    description: Optional[str] = None


class ProcessFrameRequest(BaseModel):
    image: str
    watch_id: str = "default"
    
    @field_validator('image')
    @classmethod
    def validate_base64(cls, v):
        if not v.startswith('data:image'):
            raise ValueError('Image must be base64 encoded with data URI scheme')
        return v


class TryOnRequest(BaseModel):
    image: str
    watch_id: str = "1"
    
    @field_validator('image')
    @classmethod
    def validate_base64(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Image is required')
        return v


class TryOnResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


# Mock watch database (replace with real DB)
WATCHES_DB = {
    "1": Watch(
        id="1",
        name="Speedmaster",
        brand="OMEGA",
        price=6500.00,
        image_path="Speedmaster.png",
        description="Iconic chronograph worn on the moon"
    ),
    "2": Watch(
        id="2",
        name="Seamaster Drive",
        brand="OMEGA",
        price=5800.00,
        image_path="Seamaster drive.png",
        description="Professional diving watch with elegant design"
    ),
    "3": Watch(
        id="3",
        name="Planet Ocean",
        brand="OMEGA",
        price=7200.00,
        image_path="planet.png",
        description="Deep sea professional diver"
    ),
    "4": Watch(
        id="4",
        name="Diver 300M",
        brand="OMEGA",
        price=5500.00,
        image_path="diver.png",
        description="Classic diving watch with modern features"
    ),
    "5": Watch(
        id="5",
        name="Heritage",
        brand="OMEGA",
        price=6500.00,
        image_path="heritage.png",
        description="Vintage-inspired timeless elegance"
    ),
    "6": Watch(
        id="6",
        name="Instinct",
        brand="OMEGA",
        price=4200.00,
        image_path="inst.png",
        description="Bold and rugged adventure watch"
    ),
    "7": Watch(
        id="7",
        name="Speedmaster Dark",
        brand="OMEGA",
        price=7500.00,
        image_path="Speedmaster dark.png",
        description="Dark side of the moon chronograph"
    ),
    "8": Watch(
        id="8",
        name="Aqua Terra",
        brand="OMEGA",
        price=6800.00,
        image_path="seamaster aqua teera 150m.png",
        description="Seamaster Aqua Terra 150M"
    ),
}


@lru_cache(maxsize=10)
def get_watch_tryon(watch_path: str) -> WatchTryOn:
    """Cache WatchTryOn instances to avoid reloading images"""
    tryon = WatchTryOn(watch_path)
    tryon.load_watch_image()
    return tryon


def validate_image_size(img: np.ndarray) -> np.ndarray:
    """Resize image if too large to prevent memory issues"""
    h, w = img.shape[:2]
    if max(h, w) > MAX_IMAGE_DIMENSION:
        scale = MAX_IMAGE_DIMENSION / max(h, w)
        new_w = int(w * scale)
        new_h = int(h * scale)
        img = cv2.resize(img, (new_w, new_h))
        logger.info(f"Resized image from {w}x{h} to {new_w}x{new_h}")
    return img


def get_watch_image_path(watch_id: str) -> Path:
    """Get the full path to a watch image, with fallback to default"""
    watch = WATCHES_DB.get(watch_id)
    if not watch:
        # Use a default watch image
        return WATCH_IMAGES_DIR / "default_watch.png"
    
    watch_path = WATCH_IMAGES_DIR / watch.image_path
    if not watch_path.exists():
        logger.warning(f"Watch image not found: {watch_path}, using default")
        return WATCH_IMAGES_DIR / "default_watch.png"
    
    return watch_path


@router.post("/try-on", response_model=TryOnResponse)
async def try_on(request: TryOnRequest):
    """Try on a watch with base64-encoded image"""
    
    try:
        # Decode base64 image safely
        try:
            if request.image.startswith('data:image'):
                image_data = base64.b64decode(request.image.split(',')[1])
            else:
                image_data = base64.b64decode(request.image)
        except Exception as e:
            return TryOnResponse(
                success=False,
                data=None,
                error="Invalid base64 image encoding"
            )
        
        # Check size limit
        if len(image_data) > settings.max_upload_size:
            return TryOnResponse(
                success=False,
                data=None,
                error=f"Image too large. Max size: {settings.max_upload_size / 1024 / 1024:.1f}MB"
            )
        
        # Decode to NumPy frame
        try:
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return TryOnResponse(
                    success=False,
                    data=None,
                    error="Could not decode image. Please provide a valid image."
                )
        except Exception as e:
            return TryOnResponse(
                success=False,
                data=None,
                error="Failed to process image data"
            )
        
        # Validate and resize if needed
        img = validate_image_size(img)
        
        # Get watch image path
        watch_path = get_watch_image_path(request.watch_id)
        if not watch_path.exists():
            return TryOnResponse(
                success=False,
                data=None,
                error=f"Watch not found: {request.watch_id}"
            )
        
        # Process with WatchTryOn
        try:
            tryon = get_watch_tryon(str(watch_path))
            result = tryon.process_frame(img)
            
            result_img = result["image"]
            hands_detected = result.get("hands_detected", False)
            
            # Encode result to base64
            success_encode, buffer = cv2.imencode('.jpg', result_img, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if not success_encode:
                return TryOnResponse(
                    success=False,
                    data=None,
                    error="Failed to encode result image"
                )
            
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            
            return TryOnResponse(
                success=True,
                data={
                    "image": f"data:image/jpeg;base64,{img_base64}",
                    "watch_id": request.watch_id,
                    "hands_detected": hands_detected
                },
                error=None
            )
            
        except Exception as e:
            logger.error(f"Error in watch processing: {str(e)}", exc_info=True)
            return TryOnResponse(
                success=False,
                data=None,
                error="Failed to process watch overlay"
            )
    
    except Exception as e:
        logger.error(f"Unexpected error in try-on: {str(e)}", exc_info=True)
        return TryOnResponse(
            success=False,
            data=None,
            error="An unexpected error occurred"
        )


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    watch_id: str = "1"
):
    """Upload an image and get watch try-on result"""
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    file_ext = Path(file.filename or '').suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {ALLOWED_EXTENSIONS}"
        )
    
    try:
        contents = await file.read()
        
        if len(contents) > settings.max_upload_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size: {settings.max_upload_size / 1024 / 1024:.1f}MB"
            )
        
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not decode image"
            )
        
        img = validate_image_size(img)
        
        watch_path = get_watch_image_path(watch_id)
        if not watch_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Watch image not found"
            )
        
        tryon = get_watch_tryon(str(watch_path))
        result_img = tryon.process_frame(img)
        
        success, buffer = cv2.imencode('.png', result_img)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to encode result"
            )
        
        io_buf = BytesIO(buffer)
        logger.info(f"Processed upload for watch_id: {watch_id}")
        
        return StreamingResponse(
            io_buf,
            media_type="image/png",
            headers={"X-Watch-ID": watch_id}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process image"
        )
    finally:
        await file.close()


@router.post("/process-frame")
async def process_frame(request: ProcessFrameRequest):
    """Process a webcam frame with watch overlay"""
    
    try:
        image_data = base64.b64decode(request.image.split(',')[1])
        
        if len(image_data) > settings.max_upload_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Frame too large"
            )
        
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image data"
            )
        
        img = validate_image_size(img)
        
        watch_path = get_watch_image_path(request.watch_id)
        if not watch_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Watch not found"
            )
        
        tryon = get_watch_tryon(str(watch_path))
        result = tryon.process_frame(img)
        
        result_img = result["image"]
        hands_detected = result.get("hands_detected", False)
        
        success, buffer = cv2.imencode('.jpg', result_img, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to encode frame"
            )
        
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "image": f"data:image/jpeg;base64,{img_base64}",
            "watch_id": request.watch_id,
            "hands_detected": hands_detected
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing frame: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process frame"
        )


@router.get("/watches")
async def get_watches():
    """Get all available watches"""
    watches = list(WATCHES_DB.values())
    return {
        "watches": [w.dict() for w in watches],
        "count": len(watches)
    }


@router.get("/watches/{watch_id}")
async def get_watch(watch_id: str):
    """Get specific watch details"""
    watch = WATCHES_DB.get(watch_id)
    if not watch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watch not found"
        )
    return watch.dict()


# ============== WEBSOCKET ENDPOINT ==============

@router.websocket("/ws")
async def websocket_tryon_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time AR try-on
    
    Client sends: {"type": "frame", "image": "<base64>", "watch_id": 1}
    Server responds: {"type": "landmarks", "landmarks": {...}, "fps": 15} or {"type": "no_hands"}
    """
    await websocket.accept()
    logger.info("WebSocket connected")
    
    frame_count = 0
    fps = 0.0
    last_fps_time = time.time()
    current_watch_id = "1"
    tryon = None
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "frame":
                try:
                    # Decode base64 frame
                    frame_data = message.get("image", "")
                    new_watch_id = str(message.get("watch_id", "1"))
                    
                    # Load tryon instance if watch changed
                    if new_watch_id != current_watch_id or tryon is None:
                        watch_path = get_watch_image_path(new_watch_id)
                        if watch_path.exists():
                            tryon = get_watch_tryon(str(watch_path))
                            current_watch_id = new_watch_id
                    
                    if 'base64,' in frame_data:
                        frame_data = frame_data.split('base64,')[1]
                    
                    img_bytes = base64.b64decode(frame_data)
                    nparr = np.frombuffer(img_bytes, np.uint8)
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    if frame is None:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Failed to decode frame"
                        }))
                        continue
                    
                    # Process frame to get landmarks
                    result = tryon.process_frame(frame)
                    
                    # Calculate FPS
                    frame_count += 1
                    if frame_count % 30 == 0:
                        current_time = time.time()
                        elapsed = current_time - last_fps_time
                        if elapsed > 0:
                            fps = 30 / elapsed
                        last_fps_time = current_time
                    
                    # Send landmarks or no_hands response
                    if result.get("hands_detected"):
                        await websocket.send_text(json.dumps({
                            "type": "landmarks",
                            "landmarks": result["landmarks"],
                            "fps": round(fps, 1)
                        }))
                    else:
                        await websocket.send_text(json.dumps({
                            "type": "no_hands"
                        }))
                    
                except Exception as e:
                    logger.error(f"Frame processing error: {e}")
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": str(e)
                    }))
            
            elif message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass

