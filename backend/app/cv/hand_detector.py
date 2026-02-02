"""
Hand detection using MediaPipe
Optimized for wrist landmark extraction
"""
import logging
from typing import Optional, Tuple

import cv2
import mediapipe as mp
import numpy as np

logger = logging.getLogger(__name__)


class HandDetector:
    """Detects hands and extracts wrist landmarks"""
    
    def __init__(
        self,
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=static_image_mode,
            max_num_hands=max_num_hands,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        self.mp_draw = mp.solutions.drawing_utils
        
    def detect(self, frame: np.ndarray) -> Optional[dict]:
        """
        Detect hand and return wrist landmark positions
        
        Returns:
            dict with:
                - wrist: (x, y)  
                - landmarks: list of all 21 landmarks as (x, y) tuples
                - handedness: "Left" or "Right"
        """
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)
        
        if not results.multi_hand_landmarks:
            return None
        
        # Get first hand
        hand_landmarks = results.multi_hand_landmarks[0]
        handedness = results.multi_handedness[0].classification[0].label
        
        h, w, _ = frame.shape
        
        # Extract all landmarks
        landmarks = []
        for lm in hand_landmarks.landmark:
            x = int(lm.x * w)
            y = int(lm.y * h)
            landmarks.append((x, y))
        
        # Wrist is landmark 0
        wrist = landmarks[0]
        
        return {
            "wrist": wrist,
            "landmarks": landmarks,
            "handedness": handedness
        }
    
    def draw_landmarks(self, frame: np.ndarray, results) -> np.ndarray:
        """Draw hand landmarks on frame"""
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                self.mp_draw.draw_landmarks(
                    frame,
                    hand_landmarks,
                    self.mp_hands.HAND_CONNECTIONS
                )
        return frame
    
    def __del__(self):
        """Cleanup"""
        if hasattr(self, 'hands'):
            self.hands.close()
