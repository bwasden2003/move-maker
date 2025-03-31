import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VideoTimeline from './VideoTimeline';
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

const DanceCreation = () => {
  // Available moves in the library
  const [availableMoves, setAvailableMoves] = useState([
    { id: 'it-takes-two', name: 'It Takes Two', duration: 2.3, originalDuration: 2.3 },
    { id: 'yippee', name: 'Yippee', duration: 0.8, originalDuration: 0.8 },
    { id: 'moonwalk', name: 'Moonwalk', duration: 1.5, originalDuration: 1.5 },
    { id: 'twist', name: 'Twist', duration: 1.2, originalDuration: 1.2 },
    { id: 'spin', name: 'Spin', duration: 0.9, originalDuration: 0.9 },
    { id: 'jump', name: 'Jump', duration: 0.5, originalDuration: 0.5 },
  ]);

  // Moves placed on the timeline
  const [timelineMoves, setTimelineMoves] = useState([]);
  
  // Current playback time
  const [currentTime, setCurrentTime] = useState(0);
  
  // Project title
  const [projectTitle, setProjectTitle] = useState('New Dance Project');
  
  // Search term for filtering moves
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reference to video element
  const videoRef = useRef(null);
  
  // Track if playback is active
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Calculate total duration of the timeline
  const totalDuration = timelineMoves.reduce((total, move) => {
    const endTime = (move.startTime || 0) + move.duration;
    return Math.max(total, endTime);
  }, 0);

  // Filter moves based on search term
  const filteredMoves = availableMoves.filter(move => 
    move.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle adding a move to the timeline
  const handleAddMove = (move) => {
    // Create a copy to avoid modifying the original move
    const newMove = {
      ...move,
      startTime: move.startTime || totalDuration, // Default to end of timeline if not specified
      id: `${move.id}-${Date.now()}` // Ensure unique ID
    };
    
    setTimelineMoves(prev => [...prev, newMove]);
  };

  // Handle reordering/repositioning a move
  const handleMoveReorder = (index, newStartTime) => {
    setTimelineMoves(prev => {
      const newMoves = [...prev];
      newMoves[index] = {
        ...newMoves[index],
        startTime: newStartTime
      };
      // Sort moves by start time for better visual representation
      return newMoves.sort((a, b) => a.startTime - b.startTime);
    });
  };

  // Handle trimming a move's duration
  const handleMoveTrim = (index, newDuration) => {
    setTimelineMoves(prev => {
      const newMoves = [...prev];
      newMoves[index] = {
        ...newMoves[index],
        duration: newDuration
      };
      return newMoves;
    });
  };

  // Handle move drag from library
  const handleMoveDrag = (e, move) => {
    e.dataTransfer.setData('application/json', JSON.stringify(move));
  };

  // Handle changing current time (e.g., when clicking on timeline)
  const handleTimeChange = (time) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Handle video playback controls
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRewind = () => {
    handleTimeChange(0);
  };

  const handleForward = () => {
    // Forward to next clip or 5 seconds, whichever is closer
    const nextTime = Math.min(currentTime + 5, totalDuration);
    handleTimeChange(nextTime);
  };

  // Clear the timeline
  const handleClearTimeline = () => {
    setTimelineMoves([]);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Update current time as video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, []);

  // Set up playhead position based on current time
  useEffect(() => {
    const playhead = document.querySelector('.timeline-playhead');
    if (playhead) {
      playhead.style.left = `${currentTime * 100}px`; // 100px per second
    }
  }, [currentTime]);

  return (
    <div className="dance-creation">
      <div className="header">
        <Link to="/" className="home-btn">
          <span className="home-icon">🏠</span> Home
        </Link>
        <input 
          type="text" 
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder="Project Title" 
          className="project-title-input" 
        />
        <button className="next-btn">Save & Export →</button>
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
              >
                <span className="move-icon">{moveIcons[move.name] || '🕺'}</span>
                <span className="move-name">{move.name}</span>
                <span className="move-duration">{move.duration.toFixed(1)}s</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dance-preview">
          <video 
            ref={videoRef} 
            className="dance-video" 
            src="#" // Would be generated based on timeline in real implementation
            poster="/api/placeholder/640/360" // Placeholder
          />
          <div className="video-controls">
            <button onClick={handleRewind} className="control-btn rewind-btn">⏪</button>
            <button onClick={handlePlayPause} className="control-btn play-btn">
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button onClick={handleForward} className="control-btn forward-btn">⏩</button>
            <div className="playback-time">
              {currentTime.toFixed(1)}s / {Math.max(0.1, totalDuration).toFixed(1)}s
            </div>
          </div>
        </div>
      </div>

      <div className="timeline-wrapper">
        <VideoTimeline 
          timelineMoves={timelineMoves}
          onMoveAdd={handleAddMove}
          onMoveReorder={handleMoveReorder}
          onMoveTrim={handleMoveTrim}
          onTimeChange={handleTimeChange}
          totalDuration={totalDuration}
        />
        <div className="timeline-actions">
          <button className="add-audio-btn">🎵 Add Audio</button>
          <button className="clear-timeline-btn" onClick={handleClearTimeline}>
            🗑️ Clear Timeline
          </button>
        </div>
      </div>
    </div>
  );
};

export default DanceCreation;