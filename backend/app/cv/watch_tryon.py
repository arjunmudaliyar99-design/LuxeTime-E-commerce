import logging
import cv2
import numpy as np
from typing import Dict, Optional
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

logger = logging.getLogger(__name__)


class WatchTryOn:
    
    def __init__(self, watch_image_path: str):
        self.watch_image_path = watch_image_path
        self.watch_image = None
        
        # Initialize hand landmarker with new MediaPipe Tasks API
        try:
            base_options = python.BaseOptions(model_asset_path='hand_landmarker.task')
            options = vision.HandLandmarkerOptions(
                base_options=base_options,
                num_hands=2,
                min_hand_detection_confidence=0.5,
                min_hand_presence_confidence=0.5,
                min_tracking_confidence=0.5
            )
            self.detector = vision.HandLandmarker.create_from_options(options)
            logger.info("Hand landmarker initialized with Tasks API")
        except Exception as e:
            self.detector = None
            logger.error(f"Failed to initialize hand landmarker: {e}")
        
        self._load_watch_image()
    
    def _load_watch_image(self) -> None:
        """Load watch image with error handling"""
        try:
            import os
            # Check if file exists
            if not os.path.exists(self.watch_image_path):
                logger.warning(f"Watch image not found at: {self.watch_image_path}")
                # Try relative path from current file
                from pathlib import Path
                current_dir = Path(__file__).parent.parent.parent
                alt_path = current_dir / "assets" / "watches" / Path(self.watch_image_path).name
                if alt_path.exists():
                    self.watch_image_path = str(alt_path)
                    logger.info(f"Found watch image at: {alt_path}")
                else:
                    # Create a simple placeholder image
                    logger.warning("Creating placeholder image")
                    self.watch_image = np.zeros((200, 200, 4), dtype=np.uint8)
                    self.watch_image[:, :, :3] = [201, 160, 95]  # Gold color
                    self.watch_image[:, :, 3] = 255  # Full opacity
                    return
            
            self.watch_image = cv2.imread(self.watch_image_path, cv2.IMREAD_UNCHANGED)
            if self.watch_image is None:
                raise FileNotFoundError(f"Watch image not found: {self.watch_image_path}")
            logger.info(f"✅ Loaded watch image: {self.watch_image_path}")
        except Exception as e:
            logger.error(f"Failed to load watch image: {e}")
            # Create placeholder instead of crashing
            self.watch_image = np.zeros((200, 200, 4), dtype=np.uint8)
            self.watch_image[:, :, :3] = [201, 160, 95]
            self.watch_image[:, :, 3] = 255
    
    
    def process_frame(self, frame: np.ndarray) -> Dict[str, any]:
        """Process frame and return wrist landmarks for frontend overlay.
        
        Args:
            frame: BGR image as NumPy array
            
        Returns:
            Dict with landmarks (wrist position, width, rotation) or 'hands_detected': False
        """
        # For now, return mock data until we have MediaPipe model file
        # TODO: Implement proper hand detection with MediaPipe Tasks API
        # This will require downloading hand_landmarker.task model
        
        if self.detector is None:
            logger.debug("Hand detector not initialized - returning mock data")
            # Return mock data centered on frame for testing
            return {
                "hands_detected": True,
                "landmarks": {
                    "wrist_x": 0.5,  # Center X (normalized 0-1)
                    "wrist_y": 0.6,  # Slightly below center
                    "wrist_width": 0.15,  # 15% of frame width
                    "rotation": 0.0  # No rotation
                }
            }
        
        try:
            # TODO: Convert frame to MediaPipe Image format
            # mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            # result = self.detector.detect(mp_image)
            
            # TODO: Extract hand landmarks from result
            # if result.hand_landmarks:
            #     hand = result.hand_landmarks[0]
            #     wrist = hand[0]  # Wrist is landmark 0
            #     ...
            
            # For now, return no hands detected
            return {
                "hands_detected": False
            }
            
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return {
                "hands_detected": False,
                "error": str(e)
            }
    
    def __del__(self):
        """Clean up MediaPipe resources on deletion"""
        try:
            if self.detector:
                self.detector.close()
        except Exception:
            pass
