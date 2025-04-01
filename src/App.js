import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import DanceCreation from './DanceCreation';
import DanceBank from "./DanceBank";
import MoveCreator from './MoveCreator'
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/move-creator" element={<MoveCreator />} />
        <Route path="/dance-bank" element={<DanceBank />} />
        <Route path="/dance-creator" element={<DanceCreation />} />
        {/* Add other routes as needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

