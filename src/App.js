import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import DanceCreation from './DanceCreation';
import MoveCreator from './MoveCreator'
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/move-creator" element={<MoveCreator />} />
        {/* This will be changed to go to dance bank component once its made */}
        <Route path="/dance-bank" element={<DanceCreation />} />
        {/* Add other routes as needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
