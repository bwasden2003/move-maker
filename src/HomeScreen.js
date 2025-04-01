import React from 'react';
import './HomeScreen.css';
import logo from './logo.svg';
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
              <button className="Buttons">Browse</button>
              <Link to="/dance-bank" className="Buttons">Dance Bank</Link>
              <button className="Buttons">Move Bank</button>
          </div>
          <img class="HomeImage" src={DancingDude} alt="homepage image"	/>
      </div>
		</>
	);
}

export default HomeScreen;