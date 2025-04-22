import React, { useState, useEffect }from "react";
import Dances from './DanceHolder';
import './DanceBank.css';
import { Link } from 'react-router-dom';
import { useDanceContext } from './DanceContext';

function DanceBank() {
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState([]);
    
    // Use the dance context
    const { dances, loadDance, deleteDance } = useDanceContext();
    
    // Helper function to format time in mm:ss format
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    };
    
    // Sample preset dances - in a real app, these might come from an API
    // or be initialized in your context
    const presetDances = Dances;
    
    // Combine preset dances with user-created dances
    const allDances = [
        ...presetDances,
        ...dances.map(dance => ({
            id: dance.id,
            title: dance.title,
            // Use metadata if available
            artist: dance.metadata?.artist || "Custom Dance",
            difficulty: dance.metadata?.difficulty || "Custom",
            time: formatTime(dance.totalDuration),
            img: dance.metadata?.img || "./CustomDance.png",
            isCustom: true
        }))
    ];
    const [tagFilter, setTagFilter] = useState([]);
    const [timeFilter, setTimeFilter] = useState([]);

    // Storing dances in another file to reduce cluter. 

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const handleDifficultyChange = (level) => {
        setDifficultyFilter((prev) =>
            prev.includes(level) ? prev.filter((d) => d !== level) : [...prev, level]
        );
    };
  
    // Handle clicking on a dance
    const handleDanceClick = (dance) => {
        if (dance.isCustom) {
            // If it's a custom dance, load it into the editor context
            loadDance(dance.id);
        }
        // For preset dances, the Link will handle the navigation
    };
            
    const handleTagChange = (tag) => {
      setTagFilter((prev) =>
          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    };

    const handleTimeChange = (time) => {
      setTimeFilter((prev) =>
        prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
      );
    };

    const filteredDances = allDances.filter((dance) => {
      const searched = dance.title.toLowerCase().includes(searchTerm);
      const diffFilter = difficultyFilter.length === 0 || difficultyFilter.includes(dance.difficulty);
      const tagMatch = tagFilter.length === 0 || dance.tags.some((tag) => tagFilter.includes(tag));
    
      
      const [minutes, seconds] = dance.time.split(":").map(Number);
      const timeInMin = minutes + seconds / 60;
    
      const timeMatch =
        timeFilter.length === 0 ||
        timeFilter.some((filter) => {
          if (filter === "<1 min") return timeInMin < 1;
          if (filter === "1-2 min") return timeInMin >= 1 && timeInMin <= 2;
          if (filter === "2-3 min") return timeInMin > 2 && timeInMin <= 3;
          if (filter === "3+ min") return timeInMin > 3;
          return true;
        });
    
      return searched && diffFilter && tagMatch && timeMatch;
    });

  return (
    <div>
        <div class="NavBar">
            <Link to="/" className="HomeButtonPlus">Home</Link>
            <button className="HeadButton"> Dance Bank</button>
            <Link to="/dance-creator" className="HomeButtonPlus">+</Link>
        </div>
        
        <div className="SearchFilterWrapper">
          <div className="SortAndFilter">
            <div className="SearchBox">
              <input
                type="text"
                placeholder="Search Dances"
                value={searchTerm}
                onChange={handleSearch}
                className="SearchInput"
              />
            </div>

           
            <div className="FiltersContainer">
              
             <h3 className="FilterHeader">Difficulty</h3>
              <div className="FilterGroup">
                {["Easy", "Medium", "Hard", "Extreme"].map((difficulty) => (
                  <label key={difficulty} className="FilterOption">
                    <input
                      type="checkbox"
                      checked={difficultyFilter.includes(difficulty)}
                      onChange={() => handleDifficultyChange(difficulty)}
                    />
                    <span className="FilterLabel">{difficulty}</span>
                  </label>
                ))}
              </div>

              
              <h3 className="FilterHeader">Tags</h3>
              <div className="FilterTagGroup">
                {["Pop", "Hip-Hop", "Ballet", "Jazz", "K-Pop", "Dance", "Funk", "Latin", "Rock", "2000s", "2010s"].map((tag) => (
                  <label key={tag} className="FilterTagOption">
                    <input
                      type="checkbox"
                      checked={tagFilter.includes(tag)}
                      onChange={() => handleTagChange(tag)}
                    />
                    <span className="FilterLabel">{tag}</span>
                  </label>
                ))}
              </div>

              <h3 className="FilterHeader">Time Filter</h3>
              <div className="FilterTimeGroup">
                {["<1 min", "1-2 min", "2-3 min", "3+ min"].map((time) => (
                  <label key={time} className="FilterTimeOption">
                    <input
                      type="checkbox"
                      checked={timeFilter.includes(time)}
                      onChange={() => handleTimeChange(time)}
                    />
                    <span className="FilterLabel">{time}</span>
                  </label>
                ))}
              </div>

            </div>
          </div>
          <div className="Dances">
                {filteredDances.map((dance, i) => (
                    <div
                        key={i}
                        className="DanceCard"
                        onClick={() => handleDanceClick(dance)}
                    >
                        <img src={dance.img} className="DanceImage" alt={dance.title} />
                        <div className="Info">
                            <strong>{dance.title}</strong>
                            <p>{dance.artist}</p>
                            <p>{dance.tags.join(", ")}</p>
                            <p>{dance.difficulty}</p>
                            <p>{dance.time}</p>
                        </div>
                        
                        {dance.isCustom && (
                            <div className="MoveActions">
                            <Link to={`/create/${encodeURIComponent(dance.id)}`} className="EditButton">Edit</Link>
                            <button 
                                className="DeleteButton"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(window.confirm("Are you sure you want to delete this move?")) {
                                        deleteDance(dance.id);
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </div>
                        )}
                    </div>
                ))}
                
                {filteredDances.length === 0 && (
                    <div className="NoDances">
                        <p>No dances match your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
}

export default DanceBank;