import cv2
import mediapipe as mp
import numpy as np
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from moviepy.editor import VideoFileClip
import uuid
app = Flask(__name__)
CORS(app)
@app.route('/process-video', methods=['POST', 'OPTIONS'])
def process_video():
    print("Received a request to process video")
    # Initialize MediaPipe Pose
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
    mp_drawing = mp.solutions.drawing_utils  # For drawing landmarks

    print("Loading MediaPipe Pose...")
    # Load video file (replace 'video.mp4' with your file path)
    # Retrieve the video file from the POST request
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    print("Video file found in request")
    video_file = request.files['video']
    video_path = os.path.join('temp', video_file.filename)
    os.makedirs('temp', exist_ok=True)
    video_file.save(video_path)

    # Load the video file
    cap = cv2.VideoCapture(video_path)

    # Get the frame width and height
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Define the codec and create a VideoWriter object (using XVID codec for better compatibility)
    output_video = cv2.VideoWriter('src/output_skeleton_video3.avi', 
                                cv2.VideoWriter_fourcc(*'XVID'),  # 'XVID' codec, use 'XVID' for AVI format
                                30,  # Frames per second
                                (frame_width, frame_height))  # Ensure the output size matches the input size
    print("Processing the video...")
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break  # End of video

        # Create a blank black canvas (same size as the video)
        skeleton_frame = np.zeros((frame_height, frame_width, 3), dtype=np.uint8)

        # Convert the BGR image to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Process the frame with MediaPipe Pose
        results = pose.process(image)

        # Convert back to BGR for rendering
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # If pose landmarks are found, draw only the skeleton (landmarks and connections)
        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                skeleton_frame,  # Draw on the black canvas
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS
            )

        # Write the frame with only the skeleton to the output video
        output_video.write(skeleton_frame)

        # Display the frame with only the skeleton
        #cv2.imshow('Skeleton Video', skeleton_frame)
        
        # Exit on 'q' key press
        # if cv2.waitKey(1) & 0xFF == ord('q'):
        #     break
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    pose.close()
    output_video.release()
    clip = VideoFileClip('src/output_skeleton_video3.avi')
    clip.write_videofile('src/output_skeleton_video3.mp4', codec='libx264')
    return jsonify({"message": "Video processed successfully","videoPath": "/output_skeleton_video3.mp4"}), 200

if __name__ == '__main__': 
    app.run(debug=True) 