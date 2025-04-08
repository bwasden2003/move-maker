import React, { useState, useEffect, useRef } from 'react';
import './VideoTimeline.css';

function VideoTimeline({ 
  timelineMoves = [], 
  onMoveAdd, 
  onMoveReorder, 
  onMoveTrim, 
  onTimeChange, 
  totalDuration = 10,
  currentTime = 0 
}) {
  const [draggingMoveIndex, setDraggingMoveIndex] = useState(null);
  const [isDraggingOverTimeline, setIsDraggingOverTimeline] = useState(false);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [resizingMoveIndex, setResizingMoveIndex] = useState(null);
  
  const timelineRef = useRef(null);
  const movesContainerRef = useRef(null);
  const playheadRef = useRef(null);
  const [gridSeconds, setGridSeconds] = useState(10);
  const secondWidth = 100; // Width in pixels for 1 second on timeline

  // Use a ref to store resizing data to avoid stale closures
  const resizeDataRef = useRef({
    moveIndex: null,
    startX: null,
    originalDuration: null,
    originalStartTime: null,
    handleType: null
  });

  useEffect(() => {
    // Ensure we have at least 10 seconds or the total duration, whichever is greater
    setGridSeconds(Math.max(10, Math.ceil(totalDuration)));
  }, [totalDuration]);
  
  // Update playhead position based on currentTime
  useEffect(() => {
    if (playheadRef.current) {
      playheadRef.current.style.left = `${currentTime * secondWidth}px`;
    }
  }, [currentTime, secondWidth]);

  const calculateMoveStyle = (move, index) => {
    const left = (move.startTime || 0) * secondWidth;
    const width = move.duration * secondWidth;
    
    return {
      position: 'absolute',
      left: `${left}px`,
      width: `${width}px`,
      top: '10px',
      height: '80px',
      zIndex: draggingMoveIndex === index || resizingMoveIndex === index ? 10 : 1
    };
  };
  
  // Snap to nearest move or grid position
  const snapToNearestMove = (time) => {
    const snapThreshold = 0.3; // Snap if within 0.3 seconds
    
    // First check if we should snap to the end of another move
    let closestEndTime = null;
    let minDistance = snapThreshold;
    
    // Check for snap to end of another move
    for (const move of timelineMoves) {
      const moveEnd = (move.startTime || 0) + move.duration;
      const distance = Math.abs(time - moveEnd);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestEndTime = moveEnd;
      }
    }
    
    // Check for snap to grid (every 0.5 seconds)
    const gridTime = Math.round(time * 2) / 2; // Round to nearest 0.5
    const gridDistance = Math.abs(time - gridTime);
    
    if (gridDistance < minDistance) {
      minDistance = gridDistance;
      closestEndTime = gridTime;
    }
    
    return closestEndTime !== null ? closestEndTime : time;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOverTimeline(false);
    
    if (isRepositioning) {
      handleMoveDrop(e);
      return;
    }
    
    const moveData = e.dataTransfer.getData("application/json");
    if (!moveData) return;
    
    try {
      const move = JSON.parse(moveData);
      const timelineRect = timelineRef.current.getBoundingClientRect();
      const dropX = e.clientX - timelineRect.left;
      let dropTimePosition = parseFloat((dropX / secondWidth).toFixed(2));
      
      // Snap to nearest move if applicable
      dropTimePosition = snapToNearestMove(dropTimePosition);
      
      onMoveAdd({
        ...move,
        startTime: dropTimePosition,
        id: move.id || `move-${Date.now()}`
      });
    } catch (err) {
      console.error("Error parsing move data:", err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isRepositioning) {
      setIsDraggingOverTimeline(true);
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDragLeave = () => {
    if (!isRepositioning) {
      setIsDraggingOverTimeline(false);
    }
  };

  const handleMoveDragStart = (e, index) => {
    setDraggingMoveIndex(index);
    setIsRepositioning(true);
    e.dataTransfer.setData("application/move-index", index.toString());
    
    const move = timelineMoves[index];
    const ghostElement = document.createElement('div');
    ghostElement.textContent = move.name;
    ghostElement.style.padding = '8px';
    ghostElement.style.background = 'rgba(210, 180, 140, 0.8)';
    ghostElement.style.borderRadius = '4px';
    ghostElement.style.position = 'absolute';
    ghostElement.style.top = '-1000px';
    document.body.appendChild(ghostElement);
    
    e.dataTransfer.setDragImage(ghostElement, 10, 10);
    
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };

  const handleMoveDrop = (e) => {
    e.preventDefault();
    setIsDraggingOverTimeline(false);
    setDraggingMoveIndex(null);
    setIsRepositioning(false);
    
    const moveIndexStr = e.dataTransfer.getData("application/move-index");
    if (!moveIndexStr) return;
    
    const index = parseInt(moveIndexStr, 10);
    if (isNaN(index) || index < 0 || index >= timelineMoves.length) return;
    
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const dropX = e.clientX - timelineRect.left;
    let newStartTime = Math.max(0, parseFloat((dropX / secondWidth).toFixed(2)));
    
    // Apply snapping
    newStartTime = snapToNearestMove(newStartTime);
    
    onMoveReorder(index, newStartTime);
  };

  // Updated resize start using ref
  const handleResizeStart = (e, index, handleType) => {
    e.stopPropagation();
    e.preventDefault();
    
    setResizingMoveIndex(index);
    
    const move = timelineMoves[index];
    // Save the initial resize data in the ref
    resizeDataRef.current = {
      moveIndex: index,
      startX: e.clientX,
      originalDuration: move.duration,
      originalStartTime: move.startTime || 0,
      handleType: handleType
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Updated resize move using ref values and adding snapping
  const handleResizeMove = (e) => {
    const { moveIndex, startX, originalDuration, originalStartTime, handleType } = resizeDataRef.current;
    if (moveIndex === null || startX === null) return;
    
    const move = timelineMoves[moveIndex];
    const deltaX = e.clientX - startX;
    const timeDelta = deltaX / secondWidth;
    
    // Determine maxDuration (using move.originalDuration if available)
    const maxDuration = move.originalDuration || originalDuration;
    
    if (handleType === 'right') {
      // For right handle, update duration only
      let newDuration = Math.max(0.1, Math.min(maxDuration, originalDuration + timeDelta));
      
      // Snap the end time if appropriate
      const endTime = originalStartTime + newDuration;
      const snappedEndTime = snapToNearestMove(endTime);
      
      if (endTime !== snappedEndTime) {
        newDuration = Math.max(0.1, snappedEndTime - originalStartTime);
      }
      
      onMoveTrim(moveIndex, newDuration);
    } else if (handleType === 'left') {
      // For left handle, adjust start time and duration while keeping the end fixed
      const originalEndTime = originalStartTime + originalDuration;
      let newStartTime = originalStartTime + timeDelta;
      
      // Apply snapping to the start time
      newStartTime = snapToNearestMove(newStartTime);
      
      newStartTime = Math.max(originalEndTime - maxDuration, newStartTime);
      newStartTime = Math.max(0, newStartTime);
      const newDuration = Math.max(0.1, originalEndTime - newStartTime);
      
      onMoveReorder(moveIndex, newStartTime);
      onMoveTrim(moveIndex, newDuration);
    }
  };

  const handleResizeEnd = () => {
    setResizingMoveIndex(null);
    // Reset the ref data
    resizeDataRef.current = {
      moveIndex: null,
      startX: null,
      originalDuration: null,
      originalStartTime: null,
      handleType: null
    };
    
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  const handleTimelineClick = (e) => {
    if (e.target !== timelineRef.current && !timelineRef.current.contains(e.target)) return;
    if (e.target.closest('.video-clip')) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickTime = (clickX / secondWidth).toFixed(2);
    
    onTimeChange(parseFloat(clickTime));
  };

  const renderGridLines = () => {
    return Array.from({ length: gridSeconds + 1 }).map((_, index) => (
      <div 
        key={`grid-${index}`} 
        className="timeline-grid-second" 
        style={{ 
          position: 'absolute', 
          left: `${index * secondWidth}px`,
          height: '100%',
          width: '1px',
          backgroundColor: index % 5 === 0 ? 'var(--color-grid-line-major)' : 'var(--color-grid-line)'
        }}
      >
        {index % 5 === 0 && (
          <span className="timeline-grid-label">{index}s</span>
        )}
      </div>
    ));
  };
  
  // Highlight the currently active move (if any)
  const getCurrentMove = () => {
    for (let i = 0; i < timelineMoves.length; i++) {
      const move = timelineMoves[i];
      const moveStart = move.startTime || 0;
      const moveEnd = moveStart + move.duration;
      
      if (currentTime >= moveStart && currentTime < moveEnd) {
        return i;
      }
    }
    return -1;
  };
  
  const currentMoveIndex = getCurrentMove();

  return (
    <div className="video-timeline">
      <div className="timeline-ruler">
        <span>Timeline</span>
        <span className="timeline-zoom-controls">
          <button className="zoom-btn">-</button>
          <button className="zoom-btn">+</button>
        </span>
      </div>
      <div 
        ref={timelineRef}
        className={`timeline-container ${isDraggingOverTimeline ? 'timeline-drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleTimelineClick}
      >
        <div className="timeline-grid">
          {renderGridLines()}
        </div>
        
        {timelineMoves.length === 0 ? (
          <div className="timeline-empty-message">
            Drag moves here to create your dance
          </div>
        ) : (
          <div 
            ref={movesContainerRef} 
            className="timeline-moves-container"
            style={{ width: `${gridSeconds * secondWidth}px`, position: 'relative', height: '100%' }}
          >
            {timelineMoves.map((move, index) => (
              <div 
                key={`${move.id}-${index}`} 
                className={`video-clip ${index === currentMoveIndex ? 'video-clip-active' : ''}`}
                style={{
                  ...calculateMoveStyle(move, index),
                  borderColor: index === currentMoveIndex ? '#ff9900' : 'transparent',
                  boxShadow: index === currentMoveIndex ? '0 0 8px rgba(255, 153, 0, 0.6)' : 'none'
                }}
                draggable={resizingMoveIndex !== index}
                onDragStart={(e) => handleMoveDragStart(e, index)}
                onDragEnd={() => {
                  setDraggingMoveIndex(null);
                  setIsRepositioning(false);
                }}
              >
                <div className="video-clip-title">{move.name}</div>
                <div className="video-clip-duration">
                  <div className="video-clip-progress-bar" 
                    style={{
                      width: '100%',
                      height: '8px',
                      background: '#E6CCB2',
                      position: 'relative',
                      borderRadius: '4px'
                    }}>
                    <div 
                      style={{
                        width: `${(move.duration / (move.originalDuration || 5)) * 100}%`,
                        height: '100%',
                        background: 'var(--color-timeline-grid)',
                        borderRadius: '4px'
                      }}
                    ></div>
                  </div>
                  <span>{move.duration.toFixed(1)}s</span>
                </div>
                <div 
                  className="video-clip-handle left" 
                  title="Resize start"
                  onMouseDown={(e) => handleResizeStart(e, index, 'left')}
                  style={{
                    position: 'absolute',
                    width: '12px',
                    height: '100%',
                    top: '0',
                    left: '0',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    cursor: 'col-resize',
                    borderRadius: '4px 0 0 4px',
                    transition: 'background-color 0.2s'
                  }}
                ></div>
                <div 
                  className="video-clip-handle right" 
                  title="Resize end"
                  onMouseDown={(e) => handleResizeStart(e, index, 'right')}
                  style={{
                    position: 'absolute',
                    width: '12px',
                    height: '100%',
                    top: '0',
                    right: '0',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    cursor: 'col-resize',
                    borderRadius: '0 4px 4px 0',
                    transition: 'background-color 0.2s'
                  }}
                ></div>
              </div>
            ))}
          </div>
        )}
        
        <div className="timeline-playhead"></div>
      </div>
    </div>
  );
}

export default VideoTimeline;
