import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import VideoTimeline from './VideoTimeline';
import { useMoveData } from './MoveContext';
import { useDanceContext } from './DanceContext';
import { useNavigate } from 'react-router-dom';
import './DanceCreation.css';

// Sample move icons - in a real implementation, these would be thumbnails
const moveIcons = {
  'It Takes Two': '👥',
  'Yippee': '🎉',
  'Moonwalk': '🕴️',
  'Twist': '🌀',
  'Spin': '💫',
  'Jump': '⬆️',
};

// Default dance image
const DEFAULT_DANCE_IMAGE = './DancingDude.png';

const DanceCreation = () => {
  const navigate = useNavigate();
  const { danceId } = useParams(); // Get danceId from URL if editing an existing dance
  
  const {
    dances,
    currentDance,
    updateDanceTitle,
    addMoveToTimeline,
    insertMoveInTimeline, 
    deleteMoveFromTimeline,
    clearTimeline,
    saveDance,
    createNewDance,
    loadDance
  } = useDanceContext();

  // Metadata modal state
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [danceMetadata, setDanceMetadata] = useState({
    artist: '',
    difficulty: 'Medium',
    img: DEFAULT_DANCE_IMAGE
  });

  const { title: projectTitle, timelineMoves } = currentDance;

  // Available moves in the library
  const { moves: availableMoves } = useMoveData();
  
  // Current playback index and time
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  
  // Search term for filtering moves
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reference to video element
  const videoRef = useRef(null);
  
  // Track if playback is active
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Calculate total duration of the timeline
  const totalDuration = timelineMoves.reduce((total, move) => total + move.duration, 0);

  // Initialize or load dance on mount
  useEffect(() => {
    if (danceId) {
      // Try to load existing dance
      const success = loadDance(danceId);
      if (!success) {
        // If dance not found, create a new one
        createNewDance();
      } else {
        // If the dance has metadata, load it into the state
        const existingDance = dances.find(dance => dance.id === danceId);
        if (existingDance && existingDance.metadata) {
          setDanceMetadata({
            artist: existingDance.metadata.artist || '',
            difficulty: existingDance.metadata.difficulty || 'Medium',
            img: existingDance.metadata.img || DEFAULT_DANCE_IMAGE
          });
        }
      }
    } else {
      // No danceId, create a new dance project
      createNewDance();
    }
  }, [danceId]); // Only run when danceId changes

  // Filter moves based on search term
  const filteredMoves = availableMoves.filter(move => 
    move.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle adding a move to the end of the timeline
  const handleAddMove = (move) => {
    addMoveToTimeline(move);
  };

  // Handle inserting a move at a specific position
  const handleInsertMove = (move, index) => {
    insertMoveInTimeline(move, index);
    
    // Adjust current index if we inserted before the currently playing move
    if (currentMoveIndex >= index && currentMoveIndex !== -1) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };

  // Handle deleting a move from the timeline
  const handleDeleteMove = (index) => {
    deleteMoveFromTimeline(index);
    
    // If the deleted move was currently playing, reset
    if (currentMoveIndex === index) {
      // If there are no moves left after deletion
      if (timelineMoves.length <= 1) {
        setCurrentMoveIndex(-1);
        setCurrentTime(0);
        setTotalElapsedTime(0);
        setIsPlaying(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      } else if (index < timelineMoves.length - 1) {
        // There's a next move, switch to it
        // Don't change currentMoveIndex, just update the video
        updateVideoSource(index, 0);
      } else {
        // We deleted the last move, go to previous
        setCurrentMoveIndex(index - 1);
        setCurrentTime(0);
        updateVideoSource(index - 1, 0);
      }
    } else if (currentMoveIndex > index) {
      // Adjust the current index if we deleted a move before it
      setCurrentMoveIndex(currentMoveIndex - 1);
      
      // Also update the totalElapsedTime
      let newElapsedTime = 0;
      for (let i = 0; i < currentMoveIndex - 1; i++) {
        // Skip the deleted move in the calculation
        if (i !== index) {
          newElapsedTime += timelineMoves[i].duration;
        }
      }
      setTotalElapsedTime(newElapsedTime + currentTime);
    }
  };

  // Handle move drag from library
  const handleMoveDrag = (e, move) => {
    e.dataTransfer.setData('application/json', JSON.stringify(move));
  };

  // Handle selecting a move to play
  const handleSelectMove = (index) => {
    if (index < 0 || index >= timelineMoves.length) return;
    
    setCurrentMoveIndex(index);
    setCurrentTime(0);
    
    // Calculate time position based on moves before this one
    let timePosition = 0;
    for (let i = 0; i < index; i++) {
      timePosition += timelineMoves[i].duration;
    }
    
    setTotalElapsedTime(timePosition);
    updateVideoSource(index, 0);
  };

  // Update video source to the specified move
  const updateVideoSource = (index, startTime = 0, shouldAutoPlay = false) => {
    if (index < 0 || index >= timelineMoves.length) return;

    const move = timelineMoves[index];
    if (!move || !videoRef.current) return;

    const video = videoRef.current;
    const videoSource = move.videoUrl;

    // Only change the source if it's different from the current one
    if (video.getAttribute('src') !== videoSource) {
      const wasPlaying = !video.paused;
      
      video.setAttribute('src', videoSource);
      video.setAttribute('data-current-move', move.name);
      video.currentTime = startTime;
      
      const handleCanPlay = () => {
        if (shouldAutoPlay || wasPlaying || isPlaying) {
          video.play().catch((err) => {
            console.warn("Playback failed:", err);
          });
        }
        video.removeEventListener('loadeddata', handleCanPlay);
      };

      video.addEventListener('loadeddata', handleCanPlay);
      video.load();
    } else {
      // If the same source, just update the time and play if needed.
      video.currentTime = startTime;
      if (shouldAutoPlay || isPlaying) {
        video.play().catch(err => {
          console.warn("Playback failed:", err);
        });
      }
    }
  };

  // Handle video playback controls
  const handlePlayPause = () => {
    if (timelineMoves.length === 0) {
      // Nothing to play
      return;
    }
    
    if (currentMoveIndex === -1) {
      // Start from the beginning
      setCurrentMoveIndex(0);
      setCurrentTime(0);
      setTotalElapsedTime(0);
      updateVideoSource(0, 0);
    }
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.warn("Playback failed:", err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRewind = () => {
    if (timelineMoves.length === 0) return;
    
    // If at the first move or at the beginning, go to start
    if (currentMoveIndex <= 0 || currentTime < 1) {
      setCurrentMoveIndex(0);
      setCurrentTime(0);
      setTotalElapsedTime(0);
      updateVideoSource(0, 0);
    } else {
      // Go to previous move
      const newIndex = currentMoveIndex - 1;
      setCurrentMoveIndex(newIndex);
      setCurrentTime(0);
      
      // Recalculate elapsed time
      let timePosition = 0;
      for (let i = 0; i < newIndex; i++) {
        timePosition += timelineMoves[i].duration;
      }
      setTotalElapsedTime(timePosition);
      
      updateVideoSource(newIndex, 0);
    }
  };

  const handleForward = () => {
    if (timelineMoves.length === 0) return;
    
    if (currentMoveIndex === -1) {
      // Start from the beginning
      handleSelectMove(0);
      return;
    }
    
    if (currentMoveIndex < timelineMoves.length - 1) {
      // Move to next clip
      const newIndex = currentMoveIndex + 1;
      setCurrentMoveIndex(newIndex);
      setCurrentTime(0);
      
      // Calculate new elapsed time
      let timePosition = 0;
      for (let i = 0; i < newIndex; i++) {
        timePosition += timelineMoves[i].duration;
      }
      setTotalElapsedTime(timePosition);
      
      updateVideoSource(newIndex, 0);
    }
  };

  // Clear the timeline
  const handleClearTimeline = () => {
    clearTimeline();
    setCurrentMoveIndex(-1);
    setCurrentTime(0);
    setTotalElapsedTime(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Open metadata modal and pre-fill if editing existing dance
  const handleOpenSaveDialog = () => {
    if (timelineMoves.length === 0 || !projectTitle.trim()) {
      alert("Please add at least one move and give your dance a title before saving.");
      return;
    }
    
    // If editing an existing dance, pre-fill metadata
    if (danceId) {
      const existingDance = dances.find(dance => dance.id === danceId);
      if (existingDance && existingDance.metadata) {
        setDanceMetadata({
          artist: existingDance.metadata.artist || '',
          difficulty: existingDance.metadata.difficulty || 'Medium',
          img: existingDance.metadata.img || DEFAULT_DANCE_IMAGE
        });
      }
    }
    
    setShowMetadataModal(true);
  };

  // Save dance with metadata
  const handleSaveAndExport = () => {
    // Add metadata to the current dance
    const danceWithMetadata = {
      ...currentDance,
      metadata: danceMetadata
    };
    
    // Save through context
    if (saveDance(danceWithMetadata)) {
      setShowMetadataModal(false);
      navigate('/dance-bank');
    } else {
      alert("There was an error saving your dance.");
    }
  };

  // Get the current move being played
  const currentMove = currentMoveIndex >= 0 && currentMoveIndex < timelineMoves.length
    ? timelineMoves[currentMoveIndex]
    : null;

  // Update current time as video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      const newTime = video.currentTime;
      setCurrentTime(newTime);
      
      // Calculate total elapsed time based on previous moves and current time
      if (currentMoveIndex >= 0) {
        let timeBeforeCurrentMove = 0;
        for (let i = 0; i < currentMoveIndex; i++) {
          timeBeforeCurrentMove += timelineMoves[i].duration;
        }
        setTotalElapsedTime(timeBeforeCurrentMove + newTime);
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, [currentMoveIndex, timelineMoves]);
  
  // Handle end of video playback (automatic transition to next move)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleVideoEnd = () => {
      // Move to the next clip if available
      if (currentMoveIndex < timelineMoves.length - 1) {
        const nextIndex = currentMoveIndex + 1;
        setCurrentMoveIndex(nextIndex);
        setCurrentTime(0);
        
        // Calculate new elapsed time
        let timePosition = 0;
        for (let i = 0; i < nextIndex; i++) {
          timePosition += timelineMoves[i].duration;
        }
        setTotalElapsedTime(timePosition);
        
        updateVideoSource(nextIndex, 0, true);
      } else {
        // End of timeline reached
        setIsPlaying(false);
      }
    };
    
    video.addEventListener('ended', handleVideoEnd);
    
    return () => {
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, [currentMoveIndex, timelineMoves]);

  // Available difficulty options
  const difficultyOptions = ["Easy", "Medium", "Hard", "Extreme", "Custom"];

  return (
    <div className="dance-creation">
      <div className="header">
        <Link to="/" className="home-btn">
          <span className="home-icon">🏠</span> Home
        </Link>
        <input 
          type="text" 
          value={projectTitle}
          onChange={(e) => updateDanceTitle(e.target.value)}
          placeholder="Project Title" 
          className="project-title-input" 
        />
        <button className="next-btn" onClick={handleOpenSaveDialog}>Save & Export →</button>
      </div>

      <div className="content">
        <div className="moves-library">
          <h3>My Moves</h3>
          <div className="moves-search">
            <input 
              type="text" 
              placeholder="Search moves..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="moves-grid">
            {filteredMoves.map(move => (
              <div 
                key={move.id} 
                className="move-item"
                draggable
                onDragStart={(e) => handleMoveDrag(e, move)}
                onClick={() => handleAddMove(move)}
              >
                <span className="move-icon">{moveIcons[move.name] || '🕺'}</span>
                <span className="move-name">{move.name}</span>
                <span className="move-duration">
                  {move.duration ? move.duration.toFixed(1) : 'N/A'}s
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dance-preview">
          <video 
            ref={videoRef} 
            className="dance-video" 
            src={currentMove ? currentMove.videoUrl : '#'}
            poster="/api/placeholder/640/360"
            controls={false}
          />
          <div className="video-controls">
            <button 
              onClick={handleRewind} 
              className="control-btn rewind-btn"
              disabled={timelineMoves.length === 0 || (currentMoveIndex === 0 && currentTime === 0)}
            >⏪</button>
            <button 
              onClick={handlePlayPause} 
              className="control-btn play-btn"
              disabled={timelineMoves.length === 0}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button 
              onClick={handleForward} 
              className="control-btn forward-btn"
              disabled={timelineMoves.length === 0 || currentMoveIndex === timelineMoves.length - 1}
            >⏩</button>
            <div className="playback-time">
              {totalElapsedTime.toFixed(1)}s / {Math.max(0.1, totalDuration).toFixed(1)}s
            </div>
          </div>
          
          {currentMove ? (
            <div className="current-move-indicator">
              Now Playing: {currentMove.name} ({currentTime.toFixed(1)}s / {currentMove.duration.toFixed(1)}s)
            </div>
          ) : (
            <div className="current-move-indicator">
              {timelineMoves.length > 0 ? "Click play to start" : "Add moves to get started"}
            </div>
          )}
        </div>
      </div>

      <div className="timeline-wrapper">
        <VideoTimeline 
          timelineMoves={timelineMoves}
          onAddMove={handleAddMove}
          onInsertMove={handleInsertMove}
          onDeleteMove={handleDeleteMove}
          onSelectMove={handleSelectMove}
          currentMoveIndex={currentMoveIndex}
          currentPlayTime={currentTime}
          isPlaying={isPlaying}
        />
        <div className="timeline-actions">
          <button className="add-audio-btn">🎵 Add Audio</button>
          <button 
            className="clear-timeline-btn" 
            onClick={handleClearTimeline}
            disabled={timelineMoves.length === 0}
          >
            🗑️ Clear Timeline
          </button>
        </div>
      </div>

      {/* Metadata Modal */}
      {showMetadataModal && (
        <div className="metadata-modal-overlay">
          <div className="metadata-modal">
            <h2>Dance Details</h2>
            <div className="form-group">
              <label>Artist/Creator:</label>
              <input
                type="text"
                value={danceMetadata.artist}
                onChange={(e) => setDanceMetadata({...danceMetadata, artist: e.target.value})}
                placeholder="Enter artist or creator name"
              />
            </div>
            <div className="form-group">
              <label>Difficulty:</label>
              <select
                value={danceMetadata.difficulty}
                onChange={(e) => setDanceMetadata({...danceMetadata, difficulty: e.target.value})}
              >
                {difficultyOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Dance Image:</label>
              <div className="image-options">
                <div 
                  className={`image-option ${danceMetadata.img === './DancingDude.png' ? 'selected' : ''}`}
                  onClick={() => setDanceMetadata({...danceMetadata, img: './DancingDude.png'})}
                >
                  <img src="./DancingDude.png" alt="Dancing Dude" />
                </div>
                <div 
                  className={`image-option ${danceMetadata.img === './DancingLady.png' ? 'selected' : ''}`}
                  onClick={() => setDanceMetadata({...danceMetadata, img: './DancingLady.png'})}
                >
                  <img src="./DancingLady.png" alt="Dancing Lady" />
                </div>
                <div 
                  className={`image-option ${danceMetadata.img === './CustomDance.png' ? 'selected' : ''}`}
                  onClick={() => setDanceMetadata({...danceMetadata, img: './CustomDance.png'})}
                >
                  <img src="./CustomDance.png" alt="Custom Dance" />
                </div>
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowMetadataModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleSaveAndExport} className="save-btn">Save Dance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanceCreation;