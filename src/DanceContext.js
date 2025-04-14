// src/contexts/DanceContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const DanceContext = createContext();

export const useDanceContext = () => useContext(DanceContext);

// Helper to load dances from localStorage
const loadDancesFromStorage = () => {
  try {
    const savedDances = localStorage.getItem('dances');
    return savedDances ? JSON.parse(savedDances) : [];
  } catch (error) {
    console.error('Error loading dances from storage:', error);
    return [];
  }
};

// Helper to save dances to localStorage
const saveDancesToStorage = (dances) => {
  try {
    localStorage.setItem('dances', JSON.stringify(dances));
  } catch (error) {
    console.error('Error saving dances to storage:', error);
  }
};

export const DanceProvider = ({ children }) => {
  // Store all saved dances - initialize from localStorage
  const [dances, setDances] = useState(loadDancesFromStorage());
  
  // Store the current dance being edited
  const [currentDance, setCurrentDance] = useState({
    title: 'New Dance Project',
    timelineMoves: [],
    totalDuration: 0,
    id: `dance-${Date.now()}`
  });

  // Save changes to localStorage whenever dances change
  useEffect(() => {
    saveDancesToStorage(dances);
  }, [dances]);

  // Save the current dance to the dance collection
  const saveDance = (danceWithMetadata = null) => {
    const danceToUse = danceWithMetadata || currentDance;
    
    if (danceToUse.title && danceToUse.timelineMoves.length > 0) {
      // Calculate total duration
      const totalDuration = danceToUse.timelineMoves.reduce(
        (total, move) => total + move.duration, 0
      );
      
      const danceToSave = {
        ...danceToUse,
        id: danceToUse.id || `dance-${Date.now()}`,
        totalDuration,
        lastEdited: new Date().toISOString(),
        // Make sure to include metadata if it exists
        metadata: danceToUse.metadata
      };
      
      // Check if dance already exists (update) or is new (add)
      const existingIndex = dances.findIndex(dance => dance.id === danceToSave.id);
      
      if (existingIndex >= 0) {
        // Update existing dance
        const updatedDances = [...dances];
        updatedDances[existingIndex] = danceToSave;
        setDances(updatedDances);
      } else {
        // Add new dance
        setDances([...dances, danceToSave]);
      }
      
      return true;
    }
    return false;
  };

  // Load a dance from the dance bank
  const loadDance = (danceId) => {
    const dance = dances.find(d => d.id === danceId);
    if (dance) {
      setCurrentDance({ ...dance });
      return true;
    }
    return false;
  };

  // Create a new empty dance project
  const createNewDance = () => {
    setCurrentDance({
      title: 'New Dance Project',
      timelineMoves: [],
      totalDuration: 0,
      id: `dance-${Date.now()}`
    });
  };

  // Update the dance title
  const updateDanceTitle = (title) => {
    setCurrentDance(prev => ({
      ...prev,
      title
    }));
  };

  // Set the entire timeline
  const setTimelineMoves = (moves) => {
    setCurrentDance(prev => ({
      ...prev,
      timelineMoves: moves,
      totalDuration: moves.reduce((total, move) => total + move.duration, 0)
    }));
  };

  // Add a move to the timeline
  const addMoveToTimeline = (move) => {
    // Create a copy with unique ID
    const newMove = {
      ...move,
      id: `${move.id}-${Date.now()}`,
      videoUrl: move.videoUrl,
    };
    
    setCurrentDance(prev => ({
      ...prev,
      timelineMoves: [...prev.timelineMoves, newMove],
      totalDuration: prev.totalDuration + move.duration
    }));
    
    return newMove;
  };

  // Insert a move at a specific position
  const insertMoveInTimeline = (move, index) => {
    const newMove = {
      ...move,
      id: `${move.id}-${Date.now()}`,
      videoUrl: move.videoUrl,
    };
    
    setCurrentDance(prev => {
      const newMoves = [...prev.timelineMoves];
      newMoves.splice(index, 0, newMove);
      
      return {
        ...prev,
        timelineMoves: newMoves,
        totalDuration: prev.totalDuration + move.duration
      };
    });
    
    return newMove;
  };

  // Delete a move from the timeline
  const deleteMoveFromTimeline = (index) => {
    setCurrentDance(prev => {
      const moveToDelete = prev.timelineMoves[index];
      const newMoves = [...prev.timelineMoves];
      newMoves.splice(index, 1);
      
      return {
        ...prev,
        timelineMoves: newMoves,
        totalDuration: prev.totalDuration - (moveToDelete ? moveToDelete.duration : 0)
      };
    });
  };

  // Clear the timeline
  const clearTimeline = () => {
    setCurrentDance(prev => ({
      ...prev,
      timelineMoves: [],
      totalDuration: 0
    }));
  };

  // Delete a dance from the collection
  const deleteDance = (danceId) => {
    setDances(dances.filter(dance => dance.id !== danceId));
    
    // If the current dance is being deleted, create a new one
    if (currentDance.id === danceId) {
      createNewDance();
    }
  };

  return (
    <DanceContext.Provider value={{
      dances,
      currentDance,
      saveDance,
      loadDance,
      createNewDance,
      updateDanceTitle,
      setTimelineMoves,
      addMoveToTimeline,
      insertMoveInTimeline,
      deleteMoveFromTimeline,
      clearTimeline,
      deleteDance
    }}>
      {children}
    </DanceContext.Provider>
  );
};