"""
WebSocket endpoint for real-time AR watch try-on
Receives frames from frontend, processes with MediaPipe, returns overlaid frames
"""
import asyncio
import base64
import io
import json
import logging
from typing import Dict, Optional

import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from PIL import Image

from app.cv.hand_detector import HandDetector
from app.cv.watch_overlay import WatchOverlay

logger = logging.getLogger(__name__)
router = APIRouter()

# Store active watch overlays (cached for performance)
watch_cache: Dict[int, WatchOverlay] = {}


class TryOnSession:
    """Manages a single try-on WebSocket session"""
    
    def __init__(self, websocket: WebSocket, watch_id: int):
        self.websocket = websocket
        self.watch_id = watch_id
        self.hand_detector = HandDetector()
        self.watch_overlay = self._load_watch_overlay(watch_id)
        self.frame_count = 0
        self.fps = 0.0
        self.last_fps_time = None
        
    def _load_watch_overlay(self, watch_id: int) -> Optional[WatchOverlay]:
        """Load watch image with caching"""
        if watch_id in watch_cache:
            return watch_cache[watch_id]
        
        try:
            # Map watch IDs to actual PNG files
            watch_files = {
                1: "Speedmaster.png",
                2: "Seamaster drive.png",
                3: "planet.png",
                4: "diver.png",
                5: "heritage.png",
                6: "inst.png",
                7: "Speedmaster dark.png",
                8: "seamaster aqua teera 150m.png"
            }
            
            watch_file = watch_files.get(watch_id, "Speedmaster.png")
            watch_path = f"../frontend/public/watch images/{watch_file}"
            
            overlay = WatchOverlay(watch_path)
            watch_cache[watch_id] = overlay
            return overlay
        except Exception as e:
            logger.error(f"Failed to load watch {watch_id}: {e}")
            return None
    
    async def process_frame(self, frame_data: str) -> Optional[str]:
        """Process a single frame"""
        try:
            # Decode base64 frame
            img_bytes = base64.b64decode(frame_data.split(',')[1] if ',' in frame_data else frame_data)
            img = Image.open(io.BytesIO(img_bytes))
            frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            
            # Detect hand landmarks
            landmarks = self.hand_detector.detect(frame)
            
            # Overlay watch if hand detected and overlay available
            if landmarks and self.watch_overlay:
                frame = self.watch_overlay.apply(frame, landmarks)
            
            # Encode frame back to base64
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            frame_b64 = base64.b64encode(buffer).decode('utf-8')
            
            # Calculate FPS
            self.frame_count += 1
            if self.frame_count % 30 == 0:
                import time
                current_time = time.time()
                if self.last_fps_time:
                    self.fps = 30 / (current_time - self.last_fps_time)
                self.last_fps_time = current_time
            
            return frame_b64
            
        except Exception as e:
            logger.error(f"Frame processing error: {e}")
            return None


@router.websocket("/ws/tryon")
async def websocket_tryon(
    websocket: WebSocket,
    watch_id: int = Query(1, description="Watch ID to overlay")
):
    """
    WebSocket endpoint for real-time try-on
    
    Client sends: {"type": "frame", "data": "<base64 image>"}
    Server responds: {"type": "frame", "data": "<base64 processed image>", "fps": 15.2}
    """
    await websocket.accept()
    logger.info(f"WebSocket connected: watch_id={watch_id}")
    
    session = TryOnSession(websocket, watch_id)
    
    try:
        while True:
            # Receive frame from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "frame":
                # Process frame
                processed_frame = await session.process_frame(message.get("data", ""))
                
                if processed_frame:
                    # Send back processed frame
                    response = {
                        "type": "frame",
                        "data": processed_frame,
                        "fps": round(session.fps, 1),
                        "frame_count": session.frame_count
                    }
                    await websocket.send_text(json.dumps(response))
                else:
                    # Send error
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Failed to process frame"
                    }))
            
            elif message.get("type") == "change_watch":
                # Change watch on the fly
                new_watch_id = message.get("watch_id")
                if new_watch_id:
                    session.watch_overlay = session._load_watch_overlay(new_watch_id)
                    session.watch_id = new_watch_id
                    await websocket.send_text(json.dumps({
                        "type": "watch_changed",
                        "watch_id": new_watch_id
                    }))
            
            elif message.get("type") == "ping":
                # Health check
                await websocket.send_text(json.dumps({"type": "pong"}))
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: watch_id={watch_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": str(e)
            }))
        except:
            pass
    finally:
        try:
            await websocket.close()
        except:
            pass
