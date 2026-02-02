"""
Watch overlay on wrist using perspective transformation
"""
import logging
from pathlib import Path
from typing import Optional, Tuple

import cv2
import numpy as np

logger = logging.getLogger(__name__)


class WatchOverlay:
    """Overlays a watch image on detected wrist"""
    
    def __init__(self, watch_image_path: str):
        """
        Args:
            watch_image_path: Path to PNG watch image (with transparency)
        """
        self.watch_img = self._load_watch_image(watch_image_path)
        if self.watch_img is None:
            raise ValueError(f"Could not load watch image: {watch_image_path}")
        
        self.watch_h, self.watch_w = self.watch_img.shape[:2]
        
    def _load_watch_image(self, path: str) -> Optional[np.ndarray]:
        """Load watch image with alpha channel"""
        try:
            img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
            if img is None:
                logger.error(f"Failed to load: {path}")
                return None
            
            # Ensure BGRA format
            if img.shape[2] == 3:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
            
            return img
        except Exception as e:
            logger.error(f"Error loading watch image: {e}")
            return None
    
    def apply(self, frame: np.ndarray, hand_data: dict) -> np.ndarray:
        """
        Apply watch overlay on wrist
        
        Args:
            frame: Input frame (BGR)
            hand_data: Dict with 'wrist' and 'landmarks' from HandDetector
        
        Returns:
            Frame with watch overlaid
        """
        try:
            wrist = hand_data["wrist"]
            landmarks = hand_data["landmarks"]
            
            # Get key points for perspective transform
            # We'll use wrist (0), thumb base (1), pinky base (17), and middle finger base (9)
            wrist_pt = np.array(landmarks[0], dtype=np.float32)
            thumb_base = np.array(landmarks[1], dtype=np.float32)
            pinky_base = np.array(landmarks[17], dtype=np.float32)
            middle_base = np.array(landmarks[9], dtype=np.float32)
            
            # Calculate watch size based on hand size
            hand_width = np.linalg.norm(thumb_base - pinky_base)
            watch_scale = hand_width * 0.8  # Watch is 80% of hand width
            
            # Calculate watch position (centered on wrist)
            center_x, center_y = wrist
            
            # Calculate rotation angle
            angle = np.arctan2(middle_base[1] - wrist_pt[1], middle_base[0] - wrist_pt[0])
            angle_deg = np.degrees(angle) - 90  # Adjust for vertical orientation
            
            # Create rotation matrix
            watch_center = (self.watch_w // 2, self.watch_h // 2)
            rot_matrix = cv2.getRotationMatrix2D(watch_center, angle_deg, watch_scale / self.watch_w)
            
            # Adjust translation
            rot_matrix[0, 2] += center_x - watch_center[0]
            rot_matrix[1, 2] += center_y - watch_center[1]
            
            # Warp watch image
            rotated_watch = cv2.warpAffine(
                self.watch_img,
                rot_matrix,
                (frame.shape[1], frame.shape[0]),
                flags=cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_CONSTANT,
                borderValue=(0, 0, 0, 0)
            )
            
            # Blend with original frame using alpha channel
            frame = self._blend_transparent(frame, rotated_watch)
            
            return frame
            
        except Exception as e:
            logger.error(f"Overlay error: {e}")
            return frame
    
    def _blend_transparent(self, background: np.ndarray, overlay: np.ndarray) -> np.ndarray:
        """Blend overlay with alpha channel onto background"""
        try:
            # Extract alpha channel
            if overlay.shape[2] == 4:
                alpha = overlay[:, :, 3] / 255.0
                overlay_rgb = overlay[:, :, :3]
            else:
                return background
            
            # Ensure same dimensions
            if background.shape[:2] != overlay.shape[:2]:
                return background
            
            # Blend
            for c in range(3):
                background[:, :, c] = (
                    alpha * overlay_rgb[:, :, c] +
                    (1 - alpha) * background[:, :, c]
                )
            
            return background
        except Exception as e:
            logger.error(f"Blending error: {e}")
            return background
