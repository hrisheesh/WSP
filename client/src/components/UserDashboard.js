import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/UserDashboard.css';
import AddEditStory from './AddEditStory';
import ViewStory from './ViewStory'; // Import the ViewStory component
import Modal from './Modal';

const categories = ['All', 'Food', 'Health and Fitness', 'Travel', 'Movie', 'Education'];

function UserDashboard({ username, setLoggedInUsername }) {
    const navigate = useNavigate(); // Initialize useNavigate

    const handleNavigateToBookmarks = () => {
        navigate('/bookmarks'); // Navigate to the BookmarkPage
    };

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
    const [topStories, setTopStories] = useState([]);
    const [userStories, setUserStories] = useState([]);
    const [isEditStoryOpen, setIsEditStoryOpen] = useState(false);
    const [currentStory, setCurrentStory] = useState(null);
    const [isViewStoryOpen, setIsViewStoryOpen] = useState(false); // State to manage viewing a story
    const [bookmarkCount, setBookmarkCount] = useState(0); // State to hold bookmark count

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        fetchTopStories(category);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setLoggedInUsername(null);
        navigate('/');
    };

    const fetchTopStories = async (category) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/stories?category=${category === 'All' ? '' : category}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch top stories');
            }
            const data = await response.json();
            setTopStories(data);
        } catch (error) {
            console.error('Error fetching top stories:', error);
        }
    };

    const fetchUserStories = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            const userId = JSON.parse(atob(token.split('.')[1])).id;
            console.log('Extracted user ID:', userId); // Debugging log
            console.log('Fetching user stories for user ID:', userId); // Debugging log
            const response = await fetch(`/api/stories/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user stories');
            }
            const data = await response.json();
            setUserStories(data);
        } catch (error) {
            console.error('Error fetching user stories:', error);
        }
    };

    const fetchBookmarkCount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return; // No need to fetch if not logged in
            }
            const userId = JSON.parse(atob(token.split('.')[1])).id;
            console.log('Fetching bookmark count for user ID:', userId); // Debugging log
            const response = await fetch(`/api/bookmarks/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch bookmark count');
            }
            const data = await response.json();
            setBookmarkCount(data.length); // Assuming data is an array of bookmarks
        } catch (error) {
            console.error('Error fetching bookmark count:', error);
        }
    };

    useEffect(() => {
        fetchTopStories(selectedCategory);
        fetchUserStories();
        fetchBookmarkCount(); // Fetch bookmark count on load
    }, [selectedCategory]);

    const handleEditStory = (story) => {
        setCurrentStory(story); // Set the current story to be edited
        setIsEditStoryOpen(true); // Open the edit story modal
    };

    const handleAddStory = () => {
        setIsAddStoryOpen(true);
    };

    const handleViewStory = (story) => {
        setCurrentStory(story);
        setIsViewStoryOpen(true); // Open the view story modal
    };

    return (
        <div className="user-dashboard-container">
            <div className="header">
                <button className="bookmark-button" onClick={handleNavigateToBookmarks}>
                    Bookmark({bookmarkCount})
                </button>
                <button className="add-story-button" onClick={handleAddStory}>Add Story</button>
                <button className="user-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    {username}
                </button>
                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
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
            <h2>Your Stories</h2>
            <div className="stories-grid">
                {userStories.length > 0 ? (
                    userStories.map((story, index) => (
                        <div key={index} className="story-card" onClick={() => handleViewStory(story)}> {/* Make the entire card clickable */}
                            <h3>{story.slides[0].heading}</h3>
                            <p>{story.slides[0].description}</p>
                            <img src={story.slides[0].mediaUrl} alt={story.slides[0].heading} />
                            <button className="edit-button" onClick={(e) => { e.stopPropagation(); handleEditStory(story); }}>Edit</button>
                        </div>
                    ))
                ) : (
                    <p>No stories available.</p>
                )}
            </div>
            <h2>Top Stories About {selectedCategory}</h2>
            <div className="stories-grid">
                {topStories.length > 0 ? (
                    topStories.map((story, index) => (
                        <div key={index} className="story-card" onClick={() => handleViewStory(story)}> {/* Make the entire card clickable */}
                            <h3>{story.slides[0].heading}</h3>
                            <p>{story.slides[0].description}</p>
                            <img src={story.slides[0].mediaUrl} alt={story.slides[0].heading} />
                        </div>
                    ))
                ) : (
                    <p>No top stories available.</p>
                )}
            </div>
            <Modal isOpen={isAddStoryOpen} onClose={() => setIsAddStoryOpen(false)}>
                <AddEditStory isEditMode={false} onSubmit={() => { fetchUserStories(); setIsAddStoryOpen(false); }} />
            </Modal>
            <Modal isOpen={isEditStoryOpen} onClose={() => setIsEditStoryOpen(false)}>
                <AddEditStory isEditMode={true} existingStory={currentStory} onSubmit={() => { fetchUserStories(); setIsEditStoryOpen(false); }} />
            </Modal>
            <Modal isOpen={isViewStoryOpen} onClose={() => setIsViewStoryOpen(false)}>
                <ViewStory story={currentStory} onClose={() => setIsViewStoryOpen(false)} />
            </Modal>
        </div>
    );
}

export default UserDashboard;