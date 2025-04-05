import React from "react";
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DanceDataProvider } from "./DanceDataContext";
import HomeScreen from './HomeScreen';
import DanceCreation from './DanceCreation';
import DanceBank from "./DanceBank";
import MoveCreator from './MoveCreator'
import './App.css';

function App() {
  return (
    <DanceDataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/move-creator" element={<MoveCreator />} />
          <Route path="/dance-bank" element={<DanceBank />} />
          <Route path="/dance-creator" element={<DanceCreation />} />
          {/* Add other routes as needed */}
        </Routes>
      </HashRouter>
    </DanceDataProvider>
  );
}

export default App;

