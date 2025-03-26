import React, { useState, useEffect }from "react";
import './DanceBank.css';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import DancingDude from './DancingDude.png'

function DanceBank() {
    const navigateTo = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState([]);
    const handleSearch = (e) => {
		setSearchTerm(e.target.value.toLowerCase());
	};
    const handleDifficultyChange = (level) => {
        setDifficultyFilter((prev) =>
            prev.includes(level) ? prev.filter((d) => d !== level) : [...prev, level]
        );
    };

    const dances = [
        { title: "Poker Face", artist: "Lady Gaga", difficulty: "Medium", time: "3:07", img: "./DancingDude.png" },
        { title: "Moves Like Jagger", artist: "Maroon 5", difficulty: "Hard", time: "4:39", img: "./DancingDude.png" },
        { title: "Firework", artist: "Katy Perry", difficulty: "Medium", time: "3:53", img: "./DancingDude.png" },
        { title: "Just Dance", artist: "Lady Gaga", difficulty: "Medium", time: "4:07", img: "./DancingDude.png" },
        { title: "POP/STARS", artist: "K/DA", difficulty: "Hard", time: "3:23", img: "./DancingDude.png" },
        { title: "U Can’t Touch This", artist: "MC Hammer", difficulty: "Medium", time: "4:34", img: "./DancingDude.png" },
    ];


  return (
    <div>
        <div class="NavBar">
            <button className="HomeButtonPlus"> Home</button>
            <button className="HeadButton"> Dance Bank</button>
            <button className="HomeButtonPlus">+</button>
        </div>
        <div className="SortAndFilter">
            <div className= "SearchBox">
                <input
                            type='text'
                            placeholder='Search Dances'
                            value={searchTerm}
                            onChange={handleSearch}
                />
            </div>
            <div className="Filters">
                <h3 className="DifficultyHeader">Difficulty Filters</h3>
                <div className="Difficulty">
                    <label>
                        <input
                            type="checkbox"
                            checked={difficultyFilter.includes("Easy")}
                            onChange={() => handleDifficultyChange("Easy")}
                        />
                        Easy
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={difficultyFilter.includes("Medium")}
                            onChange={() => handleDifficultyChange("Medium")}
                        />
                        Medium
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={difficultyFilter.includes("Hard")}
                            onChange={() => handleDifficultyChange("Hard")}
                        />
                        Hard
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={difficultyFilter.includes("Extreme")}
                            onChange={() => handleDifficultyChange("Extreme")}
                        />
                        Extreme
                    </label>
                </div>
            </div>

        </div>

        <div className="Dances">
            {/* <p>Welcome to the Dance Bank!</p> */}
            {dances.map((dance, i) => (
                <Link   key={i}
                        to={`/dance-bank/${encodeURIComponent(dance.title)}`} 
                        className="DanceCard"

                >
                <img src={dance.img}  className="DanceImage" />
                <div className="Info">
                    <strong>{dance.title}</strong>
                    <p>{dance.artist}</p>
                    <p>{dance.difficulty}</p>
                    <p>{dance.time}</p>
                </div>
                </Link>
            ))}
        
        </div>

        
      
      
    </div>
  );
}

export default DanceBank;
