import React from 'react';
import './HomeScreen.css';
import DancingDude from './DancingDude.png';
import { Link } from 'react-router-dom';

function HomeScreen() {
	return (
		<>
      <div className="Title">
        <h1 class="TitleText">Move Maker</h1>
        <h2 class="TitleSubtext">Your Moves, Your Masterpiece</h2>
      </div>
      <div className="buttonandimg">
          <div className="ButtonContainer">
              <Link to="/dance-bank" className="Buttons">Dance Bank</Link>
              <Link to="/dance-creator" className="Buttons">Dance Creator</Link>
              <Link to="/move-bank" className="Buttons">Move Bank</Link>
              <Link to="/move-creator" className="Buttons">Move Creator</Link>
          </div>
          <img class="HomeImage" src={DancingDude} alt="homepage image"	/>
      </div>
		</>
	);
}

export default HomeScreen;