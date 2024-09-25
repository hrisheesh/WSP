import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/UserDashboard.css';
import AddEditStory from './AddEditStory';
import ViewStory from './ViewStory'; // Import the ViewStory component
import Modal from './Modal';

const categories = ['All', 'Food', 'Health and Fitness', 'Travel', 'Movie', 'Education'];

function UserDashboard({ username, setLoggedInUsername }) {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
    const [topStories, setTopStories] = useState([]);
    const [userStories, setUserStories] = useState([]);
    const [isEditStoryOpen, setIsEditStoryOpen] = useState(false);
    const [currentStory, setCurrentStory] = useState(null);
    const [bookmarkCount, setBookmarkCount] = useState(0);
    const [isViewStoryOpen, setIsViewStoryOpen] = useState(false);
    const [loading, setLoading] = useState(true); // Loading state
    const [showMoreUserStories, setShowMoreUserStories] = useState(false);
    const [showMoreTopStories, setShowMoreTopStories] = useState(false);

    const userStoriesToShow = showMoreUserStories ? userStories : userStories.slice(0, 4);
    const topStoriesToShow = showMoreTopStories ? topStories : topStories.slice(0, 4);

    const handleNavigateToBookmarks = () => {
        navigate('/bookmarks'); // Navigate to the BookmarkPage
    };

    const fetchTopStories = async (category) => {
        setLoading(true); // Set loading state
        try {
            const response = await fetch(`/api/stories?category=${category}`);
            if (!response.ok) {
                throw new Error('Failed to fetch top stories');
            }
            const data = await response.json();
            setTopStories(data);
        } catch (error) {
            console.error('Error fetching top stories:', error);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const fetchUserStories = async () => {
        setLoading(true); // Set loading state
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            const userId = JSON.parse(atob(token.split('.')[1])).id;
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
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const fetchBookmarkCount = async () => {
        setLoading(true); // Set loading state
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            const userId = JSON.parse(atob(token.split('.')[1])).id;
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
        } finally {
            setLoading(false); // Reset loading state
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

    const handleLogout = () => {
        // Clear user data (e.g., remove token from local storage)
        localStorage.removeItem('userToken');
        // Redirect to home page
        navigate('/'); // Change this line to navigate to the Home page
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
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </div>
                )}
            </div>
            <div className="category-buttons">
                {categories.map((category) => (
                    <button 
                        key={category} 
                        className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <h2>Your Stories</h2>
            <div className="stories-grid">
                {userStoriesToShow.length > 0 ? (
                    userStoriesToShow.map((story, index) => (
                        <div key={index} className="story-card" onClick={() => handleViewStory(story)}>
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
            {userStories.length > 4 && !showMoreUserStories && (
                <button onClick={() => setShowMoreUserStories(true)} className="see-more-button">See More</button>
            )}
            <h2>Top Stories About {selectedCategory}</h2>
            <div className="stories-grid">
                {topStoriesToShow.length > 0 ? (
                    topStoriesToShow.map((story, index) => (
                        <div key={index} className="story-card" onClick={() => handleViewStory(story)}>
                            <h3>{story.slides[0].heading}</h3>
                            <p>{story.slides[0].description}</p>
                            <img src={story.slides[0].mediaUrl} alt={story.slides[0].heading} />
                        </div>
                    ))
                ) : (
                    <p>No top stories available.</p>
                )}
            </div>
            {topStories.length > 4 && !showMoreTopStories && (
                <button onClick={() => setShowMoreTopStories(true)} className="see-more-button">See More</button>
            )}
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