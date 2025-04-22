const cv = require('opencv4nodejs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
// Assume a Node-compatible MediaPipe Pose library or similar exists
const { Pose, POSE_CONNECTIONS } = require('@mediapipe/pose'); 

/**
 * Processes a video file by extracting pose landmarks and drawing a skeleton.
 * The processed video is saved as an AVI file and then converted to MP4.
 *
 * @param {string} inputVideoPath - Path to the input video.
 * @param {string} outputVideoPath - Path for the final MP4 video.
 */
async function processVideo(inputVideoPath, outputVideoPath) {
  // Initialize MediaPipe Pose with desired options.
  const pose = new Pose({
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  
  // Open the video file using OpenCV.
  const cap = new cv.VideoCapture(inputVideoPath);
  const frameWidth = cap.get(cv.CAP_PROP_FRAME_WIDTH);
  const frameHeight = cap.get(cv.CAP_PROP_FRAME_HEIGHT);
  
  // Create a VideoWriter object to save the skeleton video as AVI.
  const outputAVIPath = path.join(path.dirname(outputVideoPath), 'output_skeleton_video.avi');
  const fourcc = cv.VideoWriter.fourcc('X', 'V', 'I', 'D');
  const out = new cv.VideoWriter(outputAVIPath, fourcc, 30, new cv.Size(frameWidth, frameHeight));
  
  let frame;
  while (true) {
    frame = cap.read();
    if (frame.empty) {
      break; // End of video.
    }
    
    // Create a blank black canvas with the same dimensions as the input frame.
    const skeletonFrame = new cv.Mat(frameHeight, frameWidth, cv.CV_8UC3, [0, 0, 0]);
    
    // Convert the frame from BGR to RGB.
    const rgbFrame = frame.cvtColor(cv.COLOR_BGR2RGB);
    
    // Process the frame with MediaPipe Pose.
    // (Depending on the API, you may need to adjust how you call the processing function.)
    const results = await pose.send({ image: rgbFrame });
    
    // If pose landmarks are found, draw the skeleton on the black canvas.
    if (results && results.poseLandmarks) {
      drawLandmarks(skeletonFrame, results.poseLandmarks, POSE_CONNECTIONS);
    }
    
    // Write the skeleton frame to the output video.
    out.write(skeletonFrame);
  }
  
  // Cleanup resources.
  cap.release();
  out.release();
  pose.close();

  // Convert the AVI video to MP4 using FFmpeg.
  await convertAVIToMP4(outputAVIPath, outputVideoPath);
  console.log("Video processed successfully:", outputVideoPath)
}

/**
 * Draws landmarks and connections onto a frame.
 *
 * @param {cv.Mat} frame - The OpenCV image on which to draw.
 * @param {Array} landmarks - Array of landmark objects with normalized x and y values.
 * @param {Array} connections - Array of landmark index pairs defining the skeleton connections.
 */
function drawLandmarks(frame, landmarks, connections) {
  // Draw circles at each landmark.
  landmarks.forEach(landmark => {
    const x = Math.round(landmark.x * frame.cols);
    const y = Math.round(landmark.y * frame.rows);
    cv.drawCircle(frame, new cv.Point(x, y), 3, new cv.Vec(255, 255, 255), -1);
  });
  
  // Draw lines between connected landmarks.
  connections.forEach(connection => {
    const start = landmarks[connection[0]];
    const end = landmarks[connection[1]];
    const x1 = Math.round(start.x * frame.cols);
    const y1 = Math.round(start.y * frame.rows);
    const x2 = Math.round(end.x * frame.cols);
    const y2 = Math.round(end.y * frame.rows);
    cv.drawLine(frame, new cv.Point(x1, y1), new cv.Point(x2, y2), new cv.Vec(255, 255, 255), 2);
  });
}

/**
 * Converts an AVI video file to MP4 format using FFmpeg.
 *
 * @param {string} inputPath - Path to the input AVI file.
 * @param {string} outputPath - Desired path for the output MP4 file.
 * @returns {Promise} - Resolves when the conversion is complete.
 */
function convertAVIToMP4(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-c:v libx264'])
      .on('end', () => resolve())
      .on('error', err => reject(err))
      .save(outputPath);
  });
}

// Example usage:
processVideo('path/to/input/video.mp4', 'path/to/output/output_skeleton_video.mp4')
  .then(() => console.log("Processing complete"))
  .catch(err => console.error("Error processing video:", err));
