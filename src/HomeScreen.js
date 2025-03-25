import React from 'react';
import './HomeScreen.css';
import logo from './logo.svg';
import DancingDude from './DancingDude.png'

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
            <button className="Buttons">Dance Bank</button>
            <button className="Buttons">Move Bank</button>
        </div>
				<img class="HomeImage" src={DancingDude} alt="homepage image"	/>
    </div>
		</>
	);
}

export default HomeScreen