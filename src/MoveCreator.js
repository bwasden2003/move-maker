import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDanceData } from './DanceDataContext';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import './MoveCreator.css';

function MoveCreator() {
    const { moves, addMove } = useDanceData();
    const [title, setTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [videoDuration, setVideoDuration] = useState(null);
    const [poseModel, setPoseModel] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const originalVideoRef = useRef(null);

    // Load pose detection model on component mount
    useEffect(() => {
        async function loadPoseModel() {
            // Load TensorFlow.js backend
            await tf.setBackend('webgl');
            
            // Initialize the pose detector
            const detectorConfig = {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                enableSmoothing: true,
                minPoseScore: 0.3
            };
            
            try {
                const detector = await poseDetection.createDetector(
                    poseDetection.SupportedModels.MoveNet,
                    detectorConfig
                );
                setPoseModel(detector);
                console.log('Pose detection model loaded successfully');
            } catch (error) {
                console.error('Error loading pose detection model:', error);
            }
        }
        
        loadPoseModel();
        
        // Cleanup function
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        console.log('File dropped:', file);
        handleFileSelect(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        console.log('File selected:', file);
        handleFileSelect(file);
    };

    const handleFileSelect = (file) => {
        if (file && file.type.startsWith('video/')) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            originalVideoRef.current = url;
            
            // Set the preview URL to the original video initially
            setPreviewUrl(url);
        } else {
            alert('Please select a valid video file.');
        }
    };
    // Initialize video recorder with proper codec detection
    const getMimeType = () => {
        const types = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
            'video/mp4'
        ];
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log('Using MIME type:', type);
                return type;
            }
        }
        
        // Fallback to basic webm if nothing else is supported
        return 'video/webm';
    };

    const processVideo = async () => {
        if (!selectedFile || !poseModel || !originalVideoRef.current) {
            alert('Please select a video file first or wait for the model to load');
            return;
        }
        
        setIsProcessing(true);
        setProcessingProgress(0);
        
        try {
            // Create video element for processing
            const video = document.createElement('video');
            video.src = originalVideoRef.current;
            video.muted = true;
            video.playsInline = true;
            
            // Set up canvas for drawing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Wait for video metadata to load
            await new Promise((resolve) => {
                video.onloadedmetadata = () => resolve();
                video.load();
            });
            
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Initialize video recorder
            const chunks = [];
            const stream = canvas.captureStream(30); // 30 FPS
            const recorder = new MediaRecorder(stream, {
                mimeType: getMimeType(),
                videoBitsPerSecond: 2500000
            });
            
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };
            
            // Start video and recorder
            video.currentTime = 0;
            await video.play();
            recorder.start(100); // Collect data every 100ms
            
            const totalFrames = Math.floor(video.duration * 30); // Assuming 30fps
            let processedFrames = 0;
            
            // Process frames
            const processFrame = async () => {
                if (video.ended || video.paused) {
                    recorder.stop();
                    return;
                }
                
                // Draw black background
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Detect poses
                const poses = await poseModel.estimatePoses(video);
                
                if (poses.length > 0) {
                    drawSkeleton(ctx, poses[0], canvas.width, canvas.height);
                }
                
                // Update progress
                processedFrames++;
                const progress = Math.min(100, Math.round((processedFrames / totalFrames) * 100));
                setProcessingProgress(progress);
                
                // Continue processing frames
                requestAnimationFrame(processFrame);
            };
            
            // Start frame processing
            processFrame();
            
            // When recording is completed
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const processedUrl = URL.createObjectURL(blob);
                setPreviewUrl(processedUrl);
                
                // Create a file from the blob
                const processedFile = new File([blob], 'skeleton-' + selectedFile.name, {
                    type: 'video/webm'
                });
                setSelectedFile(processedFile);
                setIsProcessing(false);
                console.log('Video processing completed');
            };
            
            // Stop recording when video ends
            video.onended = () => {
                if (recorder.state !== 'inactive') {
                    recorder.stop();
                }
                video.pause();
            };
            
        } catch (error) {
            console.error('Error processing video:', error);
            setIsProcessing(false);
            alert('Error processing video. Please try again with a different video.');
        }
    };

    const drawSkeleton = (ctx, pose, width, height) => {
        // Draw keypoints
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        
        // Draw all keypoints
        pose.keypoints.forEach(keypoint => {
            if (keypoint.score > 0.3) {
                const { x, y } = keypoint;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
        
        // Define connections for skeleton
        const connections = [
            ['nose', 'left_eye'], ['left_eye', 'left_ear'], ['nose', 'right_eye'],
            ['right_eye', 'right_ear'], ['nose', 'left_shoulder'], 
            ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
            ['nose', 'right_shoulder'], ['right_shoulder', 'right_elbow'],
            ['right_elbow', 'right_wrist'], ['left_shoulder', 'right_shoulder'],
            ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
            ['left_hip', 'right_hip'], ['left_hip', 'left_knee'],
            ['left_knee', 'left_ankle'], ['right_hip', 'right_knee'],
            ['right_knee', 'right_ankle']
        ];
        
        // Create a lookup object for keypoints
        const keypointMap = {};
        pose.keypoints.forEach(keypoint => {
            if (keypoint.score > 0.3) {
                keypointMap[keypoint.name] = keypoint;
            }
        });
        
        // Draw connections
        ctx.beginPath();
        connections.forEach(([startName, endName]) => {
            const start = keypointMap[startName];
            const end = keypointMap[endName];
            
            if (start && end) {
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
            }
        });
        ctx.stroke();
    };

    // When save is clicked, create the move object and add it to context.
    const handleSave = () => {
        if (!selectedFile) {
            alert("No file selected!");
            return;
        }
        
        const moveData = {
            name: title || selectedFile.name,
            videoUrl: previewUrl,
            file: selectedFile,
            duration: videoDuration,
            // Additional metadata can be added here
        };
        
        console.log('Saving move data:', moveData);
        addMove(moveData);
    };

    return (
        <>
            <div className="MTitle">
                <Link to="/" className="MBackButton">Back</Link>
                <h1 className="MTitleText">Move Creator</h1>
            </div>
            <div className="MPageContent">
                <div className="MUploadVideoTitleContainer">
                    <h2 className="MBoldText">Title</h2>
                    <input 
                        type="text" 
                        id="title" 
                        name="title" 
                        placeholder="My Dance" 
                        className="MDanceInput"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div className="MUploadVideoContainer">
                        <h2 className="MRegText">Upload Video</h2>
                        <h3 className="MSmallText">
                            Upload a video to convert into a dance. Be sure the dancer's full body is in frame.
                        </h3>
                        <div 
                            className="MImportFileContainer"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <h2 className="MDragText">Drag and drop video here</h2>
                            <h2 className="MOrText">OR</h2>
                            <label htmlFor="file">Browse Files</label>
                            <input 
                                className="MChooseFile" 
                                type="file" 
                                id="file" 
                                name="file" 
                                accept="video/*" 
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>
                <div className="MEditSaveContainer">
                    <div className="saveButtons">
                        {selectedFile && !isProcessing && (
                            <button 
                                className="MProcessButton" 
                                onClick={processVideo}
                                disabled={!poseModel || isProcessing}
                            >
                                Process Skeleton
                            </button>
                        )}
                        <button 
                            className="MSaveButton" 
                            onClick={handleSave}
                            disabled={!selectedFile || isProcessing}
                        >
                            Save
                        </button>
                    </div>
                    <div className="MVideoPreviewContainer">
                        <h2 className="MRegText">Edit Movements</h2>
                        <h3 className="MSmallText">
                            {isProcessing 
                                ? `Processing video: ${processingProgress}% complete...` 
                                : "The movements from your video will be applied to this skeleton. Edit a frame by dragging motion points."}
                        </h3>
                        
                        {/* Progress bar for processing */}
                        {isProcessing && (
                            <div className="MProgressBar">
                                <div 
                                    className="MProgressBarFill" 
                                    style={{ width: `${processingProgress}%` }}
                                ></div>
                            </div>
                        )}
                        
                        {/* Preview the video if available */}
                        {previewUrl && !isProcessing && (
                            <video 
                                ref={videoRef}
                                controls 
                                width="250" 
                                height="250" 
                                src={previewUrl} 
                                onLoadedMetadata={(e) => {
                                    const duration = e.target.duration;
                                    console.log('Video duration:', duration);
                                    setVideoDuration(duration);
                                }}
                            />
                        )}
                        
                        {/* Hidden canvas for video processing */}
                        <canvas 
                            ref={canvasRef} 
                            style={{ display: 'none' }}
                        ></canvas>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MoveCreator;