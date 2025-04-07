import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDanceData } from './DanceDataContext';
import './MoveCreator.css';

function MoveCreator() {
    const { moves, addMove } = useDanceData();
    const [title, setTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [videoDuration, setVideoDuration] = useState(null);
    
    const handleFile = (file) => {
        const formData = new FormData();
        formData.append('video', file);
        let videoPath = null;
        if (file && file.type.startsWith('video/')) {
            fetch('http://localhost:5000/process-video', {
                method: 'POST',
                body: formData
            })
                .then((response) => response.json())
                .then((data) => {
                    videoPath = data.videoPath;
                    if (videoPath && videoPath.type.startsWith('video/')) {
                        console.log('File accepted:', videoPath);
                        setSelectedFile(videoPath);
                        const url = URL.createObjectURL(videoPath);
                        setPreviewUrl(url);
                        console.log('Preview URL generated:', url);
                    } else {
                        alert('Could not find skeleton file.');
                    }
                })
                .catch((error) => {
                    console.error('Error calling Python script:', error);
                });
        } else {
            alert('Please select a valid video file.');
        }
        
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        console.log('File dropped:', file);
        handleFile(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        console.log('File selected:', file);
        handleFile(file);
    };

    // when save is clicked, create the move object and add it to context.
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
            // Additional metadata (e.g., thumbnail) can be added here.
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
                    <button className="MSaveButton" onClick={handleSave}>Save</button>
                </div>
                <div className="MVideoPreviewContainer">
                    <h2 className="MRegText">Edit Movements</h2>
                    <h2 className="MSmallText">
                    The movements from your video will be applied to this skeleton. Edit a frame by dragging motion points.
                    </h2>
                    {/* Preview the video if available */}
                    {previewUrl && (
                    <video controls width="250" height="250" src={previewUrl} onLoadedMetadata={(e) => {
                        const duration = e.target.duration;
                        console.log('Video duration:', duration);
                        setVideoDuration(duration);
                    }}/>
                    )}
                </div>
                </div>
            </div>
        </>
	);
}

export default MoveCreator;