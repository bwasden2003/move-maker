import logo from './logo.svg';
import './App.css';
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomeScreen from "./HomeScreen";
import DanceBank from "./DanceBank";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/dance-bank" element={<DanceBank />} />
    </Routes>
  );
}

export default App;

