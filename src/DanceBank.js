import React, { useState, useEffect }from "react";
import Dances from './DanceHolder';
import './DanceBank.css';
import { Link } from 'react-router-dom';

function DanceBank() {
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState([]);
    const [tagFilter, setTagFilter] = useState([]);

    // Storing dances in another file to reduce cluter. 
    const dances = Dances;

    const handleSearch = (e) => {
		setSearchTerm(e.target.value.toLowerCase());
	};


    const handleDifficultyChange = (level) => {
        setDifficultyFilter((prev) =>
            prev.includes(level) ? prev.filter((d) => d !== level) : [...prev, level]
        );
    };

    const handleTagChange = (tag) => {
      setTagFilter((prev) =>
          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    };

    const filteredDances = dances.filter((dance) => {
        let searched = dance.title.toLowerCase().includes(searchTerm);
        let diffFilter = difficultyFilter.length === 0 || difficultyFilter.includes(dance.difficulty);
        let tagMatch = tagFilter.length === 0 || dance.tags.some((tag) => tagFilter.includes(tag));
        return searched && diffFilter && tagMatch;
    })




  return (
    <div>
        <div class="NavBar">
            <Link to="/" className="HomeButtonPlus">Home</Link>
            <button className="HeadButton"> Dance Bank</button>
            <button className="HomeButtonPlus">+</button>
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

            </div>
          </div>
        
          <div className="Dances">
              {/* <p>Welcome to the Dance Bank!</p> */}
              {filteredDances.map((dance, i) => (
                  <Link   key={i}
                          to={`/dance-bank/${encodeURIComponent(dance.title)}`} 
                          className="DanceCard"

                  >
                  <img src={dance.img}  className="DanceImage" />
                  <div className="Info">
                      <strong>{dance.title}</strong>
                      <p>{dance.artist}</p>
                      <p>{<p>{dance.tags.join(", ")}</p>}</p>
                      <p>{dance.difficulty}</p>
                      <p>{dance.time}</p>
                  </div>
                  </Link>
              ))}
          
          </div>
        </div>

        
      
      
    </div>
  );
}

export default DanceBank;
