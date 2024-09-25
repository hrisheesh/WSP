import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css'; // Ensure you have this CSS file for styling
import ViewStory from './ViewStory'; // Import the ViewStory component
import Modal from './Modal';

const categories = ['All', 'Food', 'Health and Fitness', 'Travel', 'Movie', 'Education'];

function Home() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [stories, setStories] = useState([]); // State to store fetched stories
    const [isViewStoryOpen, setIsViewStoryOpen] = useState(false); // State to manage viewing a story
    const [currentStory, setCurrentStory] = useState(null); // State to hold the current story

    const navigate = useNavigate();

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        fetchStories(category); // Fetch stories when category changes
    };

    const fetchStories = async (category) => {
        try {
            const response = await fetch(`/api/stories?category=${category === 'All' ? '' : category}`);
            if (!response.ok) {
                throw new Error('Failed to fetch stories');
            }
            const data = await response.json();
            setStories(data); // Store the fetched stories
        } catch (error) {
            console.error('Error fetching stories:', error);
        }
    };

    useEffect(() => {
        fetchStories(''); // Fetch all stories on initial render
    }, []);

    const handleViewStory = (story) => {
        setCurrentStory(story);
        setIsViewStoryOpen(true); // Open the view story modal
    };

    return (
        <div className="home-container">
            <div className="category-buttons">
                {categories.map((category) => (
                    <button 
                        key={category} 
                        className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <div className="stories-section">
                <h2>Top Stories About {selectedCategory}</h2>
                <div className="stories-grid">
                    {stories.length > 0 ? (
                        stories.map((story, index) => (
                            <div key={index} className="story-card" onClick={() => handleViewStory(story)}> {/* Make the entire card clickable */}
                                <h3>{story.slides[0].heading}</h3>
                                <p>{story.slides[0].description}</p>
                                <img src={story.slides[0].mediaUrl} alt={story.slides[0].heading} />
                            </div>
                        ))
                    ) : (
                        <p>No stories available.</p>
                    )}
                </div>
            </div>
            <Modal isOpen={isViewStoryOpen} onClose={() => setIsViewStoryOpen(false)}>
                <ViewStory story={currentStory} onClose={() => setIsViewStoryOpen(false)} /> {/* ViewStory modal */}
            </Modal>
        </div>
    );
}

export default Home;
