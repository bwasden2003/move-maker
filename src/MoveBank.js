import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { useMoveData } from './MoveContext';
import './MoveBank.css'; // You'll need to create this CSS file

function MoveBank() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState([]);
    
    // Use the move context
    const { moves, updateMove, deleteMove } = useMoveData();
    
    // Helper function to format time in mm:ss format
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    };
    
    // Sample preset moves - in a real app, these might come from an API
    const presetMoves = [
        { id: "move-1", name: "Shuffle Step", category: "Footwork", duration: 5, difficulty: "Easy", videoUrl: "./videos/shuffle.mp4" },
        { id: "move-2", name: "Body Roll", category: "Body Movement", duration: 4, difficulty: "Medium", videoUrl: "./videos/bodyroll.mp4" },
        { id: "move-3", name: "Moonwalk", category: "Footwork", duration: 8, difficulty: "Hard", videoUrl: "./videos/moonwalk.mp4" },
        { id: "move-4", name: "Robot", category: "Isolation", duration: 6, difficulty: "Medium", videoUrl: "./videos/robot.mp4" },
        { id: "move-5", name: "Spin", category: "Turn", duration: 3, difficulty: "Easy", videoUrl: "./videos/spin.mp4" },
        { id: "move-6", name: "Popping", category: "Isolation", duration: 7, difficulty: "Hard", videoUrl: "./videos/popping.mp4" },
    ];

    // Get all unique categories from both preset and user moves
    const getUniqueCategories = () => {
        const categories = new Set();
        // Add categories from preset moves
        presetMoves.forEach(move => categories.add(move.category));
        // Add categories from user moves
        moves.forEach(move => {
            if (move.category) categories.add(move.category);
        });
        // Add a "Custom" category for moves without a category
        categories.add("Custom");
        return Array.from(categories);
    };

    const allCategories = getUniqueCategories();
    
    // Combine preset moves with user-created moves
    const allMoves = [
        ...presetMoves,
        ...moves.map(move => ({
            ...move,
            isCustom: true,
            videoUrl: move.videoUrl || "./videos/default.mp4"
        }))
    ];

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const handleCategoryChange = (category) => {
        setCategoryFilter(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    // Handle clicking on a move
    const handleMoveClick = (move) => {
        // Navigate to move detail/edit page or show a modal
        // This will depend on your application's flow
    };

    // Filter moves based on search term and category filter
    const filteredMoves = allMoves.filter(move => {
        const matchesSearch = move.name.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter.length === 0 || 
                               (move.category && categoryFilter.includes(move.category)) || 
                               (!move.category && categoryFilter.includes("Custom"));
        return matchesSearch && matchesCategory;
    });

    return (
        <div>
            <div className="NavBar">
                <Link to="/" className="HomeButtonPlus">Home</Link>
                <button className="HeadButton">Move Bank</button>
                <Link to="/move-creator" className="HomeButtonPlus">+</Link>
            </div>
            <div className="SortAndFilter">
                <div className="SearchBox">
                    <input
                        type='text'
                        placeholder='Search Moves'
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className="Filters">
                    <h3 className="CategoryHeader">Category Filters</h3>
                    <div className="Categories">
                        {allCategories.map(category => (
                            <label key={category}>
                                <input
                                    type="checkbox"
                                    checked={categoryFilter.includes(category)}
                                    onChange={() => handleCategoryChange(category)}
                                />
                                {category}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="Moves">
                {filteredMoves.map((move, i) => (
                    <div
                        key={i}
                        className="MoveCard"
                        onClick={() => handleMoveClick(move)}
                    >
                        <div className="MoveVideoPreview">
                            {move.videoUrl ? (
                                <video 
                                    src={move.videoUrl}
                                    className="MoveVideo"
                                    alt={move.name}
                                    poster="./images/move-thumbnail.png"
                                />
                            ) : (
                                <div className="NoVideoPlaceholder">No Video</div>
                            )}
                        </div>
                        <div className="Info">
                            <strong>{move.name}</strong>
                            <p>{move.category || "Custom"}</p>
                            <p>Difficulty: {move.difficulty || "N/A"}</p>
                            <p>Duration: {formatTime(move.duration)}</p>
                        </div>
                        {move.isCustom && (
                            <div className="MoveActions">
                                <Link to={`/move-editor/${encodeURIComponent(move.id)}`} className="EditButton">Edit</Link>
                                <button 
                                    className="DeleteButton"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if(window.confirm("Are you sure you want to delete this move?")) {
                                            deleteMove(move.id);
                                        }
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                
                {filteredMoves.length === 0 && (
                    <div className="NoMoves">
                        <p>No moves match your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MoveBank;