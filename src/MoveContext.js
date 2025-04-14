import React, { createContext, useContext, useState, useEffect } from 'react';

const MoveContext = createContext();

// Helper to load moves from localStorage
const loadMovesFromStorage = () => {
  try {
    const savedMoves = localStorage.getItem('moves');
    return savedMoves ? JSON.parse(savedMoves) : [];
  } catch (error) {
    console.error('Error loading moves from storage:', error);
    return [];
  }
};

// Helper to save moves to localStorage
const saveMovesToStorage = (moves) => {
  try {
    localStorage.setItem('moves', JSON.stringify(moves));
  } catch (error) {
    console.error('Error saving moves to storage:', error);
  }
};

export const MoveProvider = ({ children }) => {
  // Initialize moves from localStorage
  const [moves, setMoves] = useState(loadMovesFromStorage());

  // Save changes to localStorage whenever moves change
  useEffect(() => {
    saveMovesToStorage(moves);
  }, [moves]);

  // Add a new move to the collection
  const addMove = (move) => {
    // Make sure the move has a unique ID
    const moveToAdd = {
      ...move,
      id: move.id || `move-${Date.now()}`
    };
    
    setMoves((prevMoves) => [...prevMoves, moveToAdd]);
    return moveToAdd;
  };

  // Update an existing move
  const updateMove = (moveId, updatedData) => {
    setMoves((prevMoves) => {
      const index = prevMoves.findIndex(move => move.id === moveId);
      if (index === -1) return prevMoves;
      
      const updatedMoves = [...prevMoves];
      updatedMoves[index] = {
        ...updatedMoves[index],
        ...updatedData
      };
      
      return updatedMoves;
    });
  };

  // Delete a move
  const deleteMove = (moveId) => {
    setMoves((prevMoves) => prevMoves.filter(move => move.id !== moveId));
  };

  // Get a move by ID
  const getMoveById = (moveId) => {
    return moves.find(move => move.id === moveId);
  };

  // Clear all moves
  const clearMoves = () => {
    setMoves([]);
  };

  return (
    <MoveContext.Provider value={{ 
      moves, 
      addMove, 
      updateMove, 
      deleteMove, 
      getMoveById,
      clearMoves
    }}>
      {children}
    </MoveContext.Provider>
  );
};

export const useMoveData = () => useContext(MoveContext);