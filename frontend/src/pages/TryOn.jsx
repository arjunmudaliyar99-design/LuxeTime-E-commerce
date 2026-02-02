import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './TryOn.css';

// Local watch database - using images from project folder
const LOCAL_WATCHES = [
  { id: 1, name: 'Speedmaster', image: '/watch images/Speedmaster.png', price: 6500 },
  { id: 2, name: 'Seamaster Drive', image: '/watch images/Seamaster drive.png', price: 5800 },
  { id: 3, name: 'Planet Ocean', image: '/watch images/planet.png', price: 7500 },
  { id: 4, name: 'Diver 300M', image: '/watch images/diver.png', price: 8900 },
  { id: 5, name: 'Heritage', image: '/watch images/heritage.png', price: 7200 },
  { id: 6, name: 'Instinct', image: '/watch images/inst.png', price: 6800 },
  { id: 7, name: 'Speedmaster Dark', image: '/watch images/Speedmaster dark.png', price: 7000 },
  { id: 8, name: 'Aqua Terra', image: '/watch images/seamaster aqua teera 150m.png', price: 6200 }
];

function TryOn() {
  const [searchParams] = useSearchParams();
  const [selectedWatch, setSelectedWatch] = useState(parseInt(searchParams.get('watch')) || 1);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [handsDetected, setHandsDetected] = useState(false);
  const [fps, setFps] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mediapipeLoaded, setMediapipeLoaded] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const watchImagesRef = useRef({});
  const currentWatchIdRef = useRef(selectedWatch);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const fpsIntervalRef = useRef(null);
  const frameCountRef = useRef(0);

  // Preload watch images on mount
  useEffect(() => {
    console.log('Preloading watch images...');
    LOCAL_WATCHES.forEach(watch => {
      const img = new Image();
      img.src = watch.image;
      img.onload = () => {
        watchImagesRef.current[watch.id] = img;
        console.log(`✅ Loaded watch ${watch.id}: ${watch.name}`);
      };
      img.onerror = () => {
        console.error(`❌ Failed to load watch ${watch.id}: ${watch.image}`);
      };
    });
  }, []); // LOCAL_WATCHES is constant, safe to omit

  // Load MediaPipe Hands library
  useEffect(() => {
    const handsScript = document.createElement('script');
    handsScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
    handsScript.async = true;
    
    const cameraScript = document.createElement('script');
    cameraScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
    cameraScript.async = true;
    
    const drawingScript = document.createElement('script');
    drawingScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';
    drawingScript.async = true;
    
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 3) {
        console.log('✅ MediaPipe libraries loaded');
        setMediapipeLoaded(true);
      }
    };
    
    handsScript.onload = checkLoaded;
    cameraScript.onload = checkLoaded;
    drawingScript.onload = checkLoaded;
    
    handsScript.onerror = () => {
      console.error('❌ Failed to load MediaPipe Hands');
      setError('Failed to load hand tracking library');
    };
    
    cameraScript.onerror = () => {
      console.error('❌ Failed to load MediaPipe Camera');
      setError('Failed to load camera library');
    };
    
    drawingScript.onerror = () => {
      console.error('❌ Failed to load MediaPipe Drawing');
      setError('Failed to load drawing library');
    };
    
    document.body.appendChild(handsScript);
    document.body.appendChild(cameraScript);
    document.body.appendChild(drawingScript);

    return () => {
      if (document.body.contains(handsScript)) {
        document.body.removeChild(handsScript);
      }
      if (document.body.contains(cameraScript)) {
        document.body.removeChild(cameraScript);
      }
      if (document.body.contains(drawingScript)) {
        document.body.removeChild(drawingScript);
      }
    };
  }, []);

  // Draw watch overlay on wrist using MediaPipe landmarks
  const drawWatchOverlay = (landmarks) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    const watchImage = watchImagesRef.current[currentWatchIdRef.current];
    
    if (!watchImage || !watchImage.complete) {
      console.warn(`Watch image ${currentWatchIdRef.current} not loaded yet`);
      return;
    }
    
    // Ensure canvas matches video dimensions
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    
    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get key landmarks: wrist (0), index MCP (5), pinky MCP (17)
    const wrist = landmarks[0];      // Landmark 0: Wrist center
    const indexMCP = landmarks[5];   // Landmark 5: Index finger base
    const pinkyMCP = landmarks[17];  // Landmark 17: Pinky finger base
    
    // Convert normalized coordinates to pixel coordinates
    const wristX = wrist.x * canvas.width;
    const wristY = wrist.y * canvas.height;
    
    // Calculate watch width based on hand width (distance between index and pinky)
    const handWidth = Math.sqrt(
      Math.pow((indexMCP.x - pinkyMCP.x) * canvas.width, 2) +
      Math.pow((indexMCP.y - pinkyMCP.y) * canvas.height, 2)
    );
    const watchWidth = handWidth * 1.6; // Scale factor for watch size
    
    // Calculate rotation angle based on hand orientation
    const angle = Math.atan2(
      pinkyMCP.y - indexMCP.y,
      pinkyMCP.x - indexMCP.x
    );
    
    // Calculate watch height maintaining aspect ratio
    const watchHeight = watchWidth / 1.4;
    
    // Draw watch with proper positioning and rotation
    ctx.save();
    ctx.translate(wristX, wristY);
    ctx.rotate(angle);
    
    // Add shadow for depth effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Draw watch image centered on wrist, slightly above
    ctx.drawImage(
      watchImage,
      -watchWidth / 2,
      -watchWidth / 2.8,  // Offset upward to sit on forearm
      watchWidth,
      watchHeight
    );
    
    ctx.restore();
  };

  // MediaPipe onResults callback
  const onResults = (results) => {
    if (!canvasRef.current) return;
    
    frameCountRef.current++;
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      drawWatchOverlay(landmarks);
      setHandsDetected(true);
    } else {
      // Clear canvas when no hands detected
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHandsDetected(false);
    }
  };

  // Start camera with MediaPipe Hands
  const startCamera = async () => {
    if (!mediapipeLoaded) {
      setError('Hand tracking library not loaded yet. Please wait...');
      return;
    }

    try {
      setError(null);
      setIsConnecting(true);
      
      if (!videoRef.current) {
        setError('Video element not ready');
        setIsConnecting(false);
        return;
      }
      
      console.log('📹 Requesting camera access...');
      
      // Request camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      console.log('✅ Camera access granted');
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Wait for video metadata
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Metadata timeout')), 5000);
        videoRef.current.onloadedmetadata = () => {
          clearTimeout(timeout);
          console.log(`✅ Video ready: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          resolve();
        };
      });
      
      await videoRef.current.play();
      console.log('✅ Video playing');
      
      // Initialize MediaPipe Hands
      const hands = new window.Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });
      
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
      });
      
      hands.onResults(onResults);
      handsRef.current = hands;
      
      // Initialize camera for MediaPipe
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720
      });
      
      cameraRef.current = camera;
      await camera.start();
      
      console.log('✅ MediaPipe Hands initialized');
      
      // Start FPS counter
      fpsIntervalRef.current = setInterval(() => {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
      }, 1000);
      
      setCameraActive(true);
      setIsConnecting(false);
      
      console.log('🎉 Camera and hand tracking started!');
      
    } catch (err) {
      console.error('❌ Camera error:', err);
      let errorMessage = 'Failed to start camera. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is being used by another application.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
      setIsConnecting(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  // Stop camera and cleanup
  const stopCamera = () => {
    console.log('Stopping camera...');
    
    // Stop MediaPipe camera
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    
    // Close MediaPipe Hands
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
    
    // Stop FPS counter
    if (fpsIntervalRef.current) {
      clearInterval(fpsIntervalRef.current);
      fpsIntervalRef.current = null;
    }
    
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    setCameraActive(false);
    setHandsDetected(false);
    setFps(0);
    frameCountRef.current = 0;
  };

  // Handle watch selection change
  const handleWatchChange = (watchId) => {
    setSelectedWatch(watchId);
    currentWatchIdRef.current = watchId;
    console.log(`Watch changed to: ${watchId}`);
  };
  
  // Simple AI recommendation logic (rule-based)
  const getRecommendedWatches = () => {
    const currentWatch = LOCAL_WATCHES.find(w => w.id === selectedWatch);
    if (!currentWatch) return [];
    
    // Rule-based recommendation
    const recommendations = LOCAL_WATCHES.filter(w => {
      if (w.id === selectedWatch) return false;
      
      // Recommend watches in similar price range (+/- $1000)
      const priceDiff = Math.abs(w.price - currentWatch.price);
      if (priceDiff < 1000) return true;
      
      // Recommend by style similarity (name patterns)
      if (currentWatch.name.includes('Speedmaster') && w.name.includes('Speedmaster')) return true;
      if (currentWatch.name.includes('Seamaster') && w.name.includes('Seamaster')) return true;
      if (currentWatch.name.includes('Dark') && w.name.includes('Dark')) return true;
      
      return false;
    }).slice(0, 3);
    
    return recommendations;
  };
  
  const recommendedWatches = getRecommendedWatches();
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="tryon-page">
      <div className="container">
        <div className="tryon-header">
          <h1 className="heading-2">Virtual Try-On</h1>
          <p className="body-large text-secondary">
            Experience luxury watches on your wrist in real-time
          </p>
        </div>

        <div className="tryon-layout">
          {/* Left: Camera Feed */}
          <div className="tryon-camera">
            <div className="camera-container card">
              {/* Camera placeholder - shown when inactive */}
              <div className={`camera-placeholder ${cameraActive ? 'hidden' : ''}`}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <rect x="10" y="20" width="60" height="45" rx="4" stroke="var(--accent-primary)" strokeWidth="2"/>
                  <circle cx="40" cy="42" r="12" stroke="var(--accent-primary)" strokeWidth="2"/>
                  <circle cx="60" cy="30" r="3" fill="var(--accent-primary)"/>
                </svg>
                <p className="body-base text-secondary">Camera inactive</p>
                <button onClick={startCamera} className="btn btn-primary" disabled={isConnecting}>
                  {isConnecting ? 'Starting...' : 'Start Camera'}
                </button>
              </div>

              {/* Video + Canvas - ALWAYS in DOM, visibility via CSS */}
              <div className={`video-wrapper ${cameraActive ? 'active' : ''}`}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-feed"
                />
                <canvas 
                  ref={canvasRef} 
                  className="camera-overlay-canvas"
                />
                
                {/* Status bar - only show when active */}
                {cameraActive && (
                  <div className="camera-status-bar">
                    <div className="status-indicators">
                      <div className="status-indicator">
                        {handsDetected ? (
                          <span className="status-success">
                            <span className="status-dot success"></span>
                            Wrist Detected {fps > 0 && `• ${fps} FPS`}
                          </span>
                        ) : (
                          <span className="status-searching">
                            <span className="status-dot searching"></span>
                            Show your wrist...
                          </span>
                        )}
                      </div>
                      
                      <div className="status-indicator">
                        {mediapipeLoaded ? (
                          <span className="status-success">
                            <span className="status-dot success"></span>
                            Tracking Active
                          </span>
                        ) : (
                          <span className="status-searching">
                            <span className="status-dot searching"></span>
                            Loading...
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="recording-indicator">
                      <span className="recording-dot"></span>
                      <span>Live</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {cameraActive && (
              <div className="camera-controls">
                <button onClick={stopCamera} className="btn btn-secondary">
                  Stop Camera
                </button>
              </div>
            )}

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Right: Watch Selection & Instructions */}
          <div className="tryon-sidebar">
            <div className="card sidebar-section">
              <h3 className="heading-4">Select Watch</h3>
              <div className="watch-selector">
                {LOCAL_WATCHES.map((watch) => (
                  <button
                    key={watch.id}
                    onClick={() => handleWatchChange(watch.id)}
                    className={`watch-option ${selectedWatch === watch.id ? 'selected' : ''}`}
                  >
                    <div className="watch-option-image">
                      <img 
                        src={watch.image} 
                        alt={watch.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="watch-option-details">
                      <span className="watch-name">{watch.name}</span>
                      <span className="watch-price">${watch.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card sidebar-section">
              <h3 className="heading-4">Instructions</h3>
              <ol className="instructions-list">
                <li>Click "Start Camera" to begin</li>
                <li>Position your wrist in the camera view</li>
                <li>Select a watch from the list above</li>
                <li>The watch will appear instantly on your wrist</li>
                <li>Switch watches anytime - no lag!</li>
              </ol>
            </div>

            {/* AI Recommendation Section */}
            {recommendedWatches.length > 0 && (
              <div className="card sidebar-section ai-recommendation">
                <div className="ai-header">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: '8px' }}>
                    <path d="M10 2L12.5 7.5L18 8.5L14 13L15 18.5L10 15.5L5 18.5L6 13L2 8.5L7.5 7.5L10 2Z" fill="var(--accent-primary)" />
                  </svg>
                  <h3 className="heading-4">AI Match for You</h3>
                </div>
                <p className="body-small text-secondary" style={{ marginTop: '8px', marginBottom: '16px' }}>
                  Based on your selection, we recommend:
                </p>
                <div className="ai-recommendations">
                  {recommendedWatches.map((watch) => (
                    <button
                      key={watch.id}
                      onClick={() => handleWatchChange(watch.id)}
                      className="ai-recommendation-card"
                    >
                      <div className="ai-watch-image">
                        <img src={watch.image} alt={watch.name} />
                      </div>
                      <div className="ai-watch-info">
                        <span className="ai-watch-name">{watch.name}</span>
                        <span className="ai-watch-price">${watch.price.toLocaleString()}</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 'auto' }}>
                        <path d="M6 4L10 8L6 12" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="card sidebar-section">
              <h3 className="heading-4">Tips</h3>
              <ul className="tips-list body-small text-secondary">
                <li>Use good lighting for better detection</li>
                <li>Keep your hand steady and visible</li>
                <li>Show the back of your hand to the camera</li>
                <li>Try different angles to find your favorite view</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TryOn;
