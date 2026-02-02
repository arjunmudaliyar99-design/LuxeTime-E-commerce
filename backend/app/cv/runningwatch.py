import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands()

# Load the watch image (ensure the path is correct)
watch_image = cv2.imread('C:\\Program Files\\.vscode\\Sy_prac\\watch.png', cv2.IMREAD_UNCHANGED)

# Start capturing video from the camera
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Camera not accessible")
    exit()

while True:
    success, img = cap.read()
    if not success:
        print("Error: Failed to capture image")
        break

    # Check if the image is empty
    if img is None or img.size == 0:
        print("Error: Captured image is empty")
        break

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands.process(img_rgb)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Get wrist coordinates
            wrist_x = int(hand_landmarks.landmark[mp_hands.HandLandmark.WRIST].x * img.shape[1])
            wrist_y = int(hand_landmarks.landmark[mp_hands.HandLandmark.WRIST].y * img.shape[0])

            # Calculate wrist width based on the distance between the wrist and the index finger
            index_x = int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].x * img.shape[1])
            index_y = int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y * img.shape[0])
            wrist_width = int(np.sqrt((index_x - wrist_x) ** 2 + (index_y - wrist_y) ** 2) * 0.6)  # Adjust factor as needed

            # Resize watch image to fit wrist size
            watch_resized = cv2.resize(watch_image, (wrist_width, int(watch_image.shape[0] * (wrist_width / watch_image.shape[1]))))

            # Ensure wrist coordinates are within the image bounds
            wrist_x = max(0, min(wrist_x, img.shape[1] - watch_resized.shape[1]))
            wrist_y = max(0, min(wrist_y, img.shape[0] - watch_resized.shape[0]))

            # Adjust wrist position for better fitting
            offset_x = 10  # Adjust as needed
            offset_y = 5   # Adjust as needed

            # Overlay watch image on wrist
            for c in range(0, 3):
                img[wrist_y + offset_y:wrist_y + watch_resized.shape[0] + offset_y, wrist_x + offset_x:wrist_x + watch_resized.shape[1] + offset_x, c] = \
                    watch_resized[:, :, c] * (watch_resized[:, :, 3] / 255.0) + \
                    img[wrist_y + offset_y:wrist_y + watch_resized.shape[0] + offset_y, wrist_x + offset_x:wrist_x + watch_resized.shape[1] + offset_x, c] * (1.0 - watch_resized[:, :, 3] / 255.0)

    cv2.imshow("Virtual Watch", img)

    # Exit on 'q' key press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()