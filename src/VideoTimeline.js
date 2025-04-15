import React, { useRef, useEffect } from 'react';
import './VideoTimeline.css';

function VideoTimeline({ 
  timelineMoves = [], 
  onAddMove, 
  onInsertMove, 
  onDeleteMove, 
  onSelectMove,
  currentMoveIndex = -1,
  currentPlayTime = 0,
  isPlaying = false
}) {
  const timelineRef = useRef(null);
  const moveBlockWidth = 150; // Fixed width for each move block
  
  // Scroll the timeline to ensure the current move is visible
  useEffect(() => {
    if (currentMoveIndex >= 0 && timelineRef.current) {
      const container = timelineRef.current;
      const moveElement = container.querySelector(`.timeline-move-item[data-index="${currentMoveIndex}"]`);
      
      if (moveElement) {
        const containerRect = container.getBoundingClientRect();
        const moveRect = moveElement.getBoundingClientRect();
        
        // Check if the move is not fully visible
        if (moveRect.left < containerRect.left || moveRect.right > containerRect.right) {
          const scrollPosition = moveElement.offsetLeft - containerRect.width / 2 + moveRect.width / 2;
          container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [currentMoveIndex]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    
    // Add a class to highlight drop targets
    if (e.target.classList.contains('timeline-insert-spot')) {
      e.target.classList.add('timeline-insert-spot-active');
    }
  };

  const handleDragLeave = (e) => {
    // Remove highlight class
    if (e.target.classList.contains('timeline-insert-spot')) {
      e.target.classList.remove('timeline-insert-spot-active');
    }
  };

  const handleDrop = (e, insertIndex) => {
    e.preventDefault();
    
    // Remove all active highlights
    document.querySelectorAll('.timeline-insert-spot-active').forEach(el => {
      el.classList.remove('timeline-insert-spot-active');
    });
    
    const moveData = e.dataTransfer.getData("application/json");
    if (!moveData) return;
    
    try {
      const move = JSON.parse(moveData);
      onInsertMove(move, insertIndex);
    } catch (err) {
      console.error("Error parsing move data:", err);
    }
  };

  // Calculate progress percentage for the current playing move
  const getCurrentMoveProgress = () => {
    if (currentMoveIndex < 0 || currentMoveIndex >= timelineMoves.length) return 0;
    const move = timelineMoves[currentMoveIndex];
    return Math.min(100, (currentPlayTime / move.duration) * 100);
  };

  // Add empty timeline message
  if (timelineMoves.length === 0) {
    return (
      <div className="video-timeline">
        <div className="timeline-header">
          <span>Timeline</span>
        </div>
        <div className="timeline-empty" 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 0)}>
          <p>Drag a move here to start your dance sequence</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-timeline">
      <div className="timeline-header">
        <span>Timeline</span>
        <span className="timeline-status">
          {isPlaying ? '▶️ Playing' : '⏸️ Paused'}
        </span>
      </div>
      <div 
        ref={timelineRef}
        className="timeline-moves-container"
      >
        {/* First insert point (at the beginning) */}
        <div 
          className="timeline-insert-spot"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 0)}
        >
          <div className="timeline-insert-icon">+</div>
        </div>
        
        {/* Render all the moves with insert points between them */}
        {timelineMoves.map((move, index) => (
          <React.Fragment key={`${move.id}-${index}`}>
            <div 
              className={`timeline-move-item ${index === currentMoveIndex ? 'timeline-move-active' : ''}`}
              style={{ width: `${moveBlockWidth}px` }}
              data-index={index}
              onClick={() => onSelectMove(index)}
            >
              <div className="timeline-move-delete" onClick={(e) => {
                e.stopPropagation();
                onDeleteMove(index);
              }}>×</div>
              <div className="timeline-move-icon">{move.name.charAt(0)}</div>
              <div className="timeline-move-name">{move.name}</div>
              <div className="timeline-move-duration">{move.duration.toFixed(1)}s</div>
              
              {/* Progress bar - only show for the current move */}
              {index === currentMoveIndex && (
                <div className="timeline-move-progress-container">
                  <div 
                    className="timeline-move-progress-bar" 
                    style={{ width: `${getCurrentMoveProgress()}%` }}
                  ></div>
                </div>
              )}
            </div>
            
            {/* Insert point after this move */}
            <div 
              className="timeline-insert-spot"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index + 1)}
            >
              <div className="timeline-insert-icon">+</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default VideoTimeline;