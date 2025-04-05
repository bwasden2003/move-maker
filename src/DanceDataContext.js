import React, { createContext, useContext, useState } from 'react';

const DanceDataContext = createContext();

export const DanceDataProvider = ({ children }) => {
  const [moves, setMoves] = useState([]);

  const addMove = (move) => {
    setMoves((prevMoves) => [...prevMoves, move]);
  };

  // Optionally, you could add remove or update functions here.

  return (
    <DanceDataContext.Provider value={{ moves, addMove }}>
      {children}
    </DanceDataContext.Provider>
  );
};

export const useDanceData = () => useContext(DanceDataContext);
