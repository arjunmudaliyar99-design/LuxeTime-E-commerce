import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7)
mp_drawing = mp.solutions.drawing_utils

# Function to open the camera and overlay the watch on the user's hand
def open_camera():
    cap = cv2.VideoCapture(0)
    
    # Check if the camera opened successfully
    if not cap.isOpened():
        print("Error: Could not open camera.")
        return
    
    watch_image = cv2.imread("C:\Program Files\.vscode\Sy_prac\watch.png", cv2.IMREAD_UNCHANGED)  
    
    # Check if the watch image was loaded successfully
    if watch_image is None:
        print("Error: Could not load watch image. Check the file path.")
        return
    
    watch_width, watch_height = watch_image.shape[1], watch_image.shape[0]

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame from camera.")
            break

        # Convert the frame to RGB for MediaPipe processing
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Draw hand landmarks (optional for debugging)
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

                # ... (rest of your overlay logic remains the same) ...

        # Display the frame with the watch overlay
        cv2.imshow("AR Watch", frame)

        # Exit on pressing 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# Entry point for the program
if __name__ == "__main__":
    open_camera()