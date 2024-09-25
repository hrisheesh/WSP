import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './styles/ViewStory.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as solidBookmark } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as regularBookmark } from '@fortawesome/free-regular-svg-icons';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';
import SharePopup from './SharePopup';
import { getStoryById, toggleLike, addBookmark, removeBookmark, getBookmarkedStories } from '../services/apiService'; // Import service functions

function ViewStory({ story, onClose }) {
    const navigate = useNavigate();
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSharePopup, setShowSharePopup] = useState(false);

    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                const storyData = await getStoryById(story._id); // Fetch story details
                setLikeCount(storyData.likes);

                const userId = localStorage.getItem('userId'); // Ensure userId is stored in localStorage
                const token = localStorage.getItem('token'); // Get token

                // Set like status safely
                if (storyData.likedBy && Array.isArray(storyData.likedBy)) {
                    setIsLiked(storyData.likedBy.includes(userId));
                } else {
                    setIsLiked(false);
                }

                // Fetch user's bookmarks to check if the current story is bookmarked
                if (token && userId) {
                    const bookmarks = await getBookmarkedStories(userId);
                    // Check if the current story is among the bookmarks
                    const isBookmarkedStory = bookmarks.some(bookmark => bookmark.storyId._id === story._id);
                    setIsBookmarked(isBookmarkedStory);
                } else {
                    setIsBookmarked(false);
                }
            } catch (error) {
                console.error('Error fetching initial state:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialState();
    }, [story._id]);

    const toggleLikeHandler = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Redirect to login page
            return;
        }

        setLoading(true);
        try {
            const response = await toggleLike(story._id, token); // Toggle like status
            setLikeCount(response.likes);
            const userId = localStorage.getItem('userId');
            const liked = response.likedBy.includes(userId);
            setIsLiked(liked);
        } catch (error) {
            console.error('Error updating like status:', error);
            if (error.response && error.response.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login'); // Redirect if unauthorized
            } else {
                alert(error.message || 'Failed to update like status.');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleBookmarkHandler = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Redirect to login page
            return;
        }

        setLoading(true);
        try {
            if (isBookmarked) {
                // Attempt to remove bookmark
                const response = await removeBookmark(story._id, token); // Remove bookmark
                if (response.message === 'Bookmark removed successfully.') {
                    setIsBookmarked(false);
                }
            } else {
                // Attempt to add bookmark
                const response = await addBookmark(story._id, token); // Add bookmark
                if (response._id) { // Assuming the response includes the created bookmark's _id
                    setIsBookmarked(true);
                }
            }
        } catch (error) {
            console.error('Error updating bookmark status:', error);
            if (error.response && error.response.status === 400) {
                alert(error.message || 'Failed to update bookmark status.');
            } else if (error.response && error.response.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login'); // Redirect if unauthorized
            } else {
                alert('An error occurred while updating bookmark status.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (activeSlideIndex < story.slides.length - 1) {
            setActiveSlideIndex(prevIndex => prevIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (activeSlideIndex > 0) {
            setActiveSlideIndex(prevIndex => prevIndex - 1);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowSharePopup(true);
    };

    return (
        <div className="view-story-container">
            <button className="close-button" onClick={onClose}>✖</button>
            {showSharePopup && (
                <SharePopup message="Story link copied to clipboard." onClose={() => setShowSharePopup(false)} />
            )}
            {story.slides && story.slides.length > 0 ? (
                <>
                    <h2>{story.slides[activeSlideIndex].heading}</h2>
                    <div className="slide">
                        <p>{story.slides[activeSlideIndex].description}</p>
                        {story.slides[activeSlideIndex].mediaUrl.endsWith('.mp4') ? (
                            <video controls>
                                <source src={story.slides[activeSlideIndex].mediaUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <img src={story.slides[activeSlideIndex].mediaUrl} alt={story.slides[activeSlideIndex].heading} />
                        )}
                    </div>
                    <div className="like-section">
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <button 
                                    className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`} 
                                    onClick={toggleBookmarkHandler} 
                                    disabled={loading}
                                >
                                    <FontAwesomeIcon icon={isBookmarked ? solidBookmark : regularBookmark} />
                                </button>
                                <div className="like-button-container">
                                    <button 
                                        className={`like-button ${isLiked ? 'liked' : ''}`} 
                                        onClick={toggleLikeHandler} 
                                        disabled={loading}
                                    >
                                        <FontAwesomeIcon icon={isLiked ? solidHeart : regularHeart} />
                                    </button>
                                </div>
                            </>
                        )}
                        <p className="like-count">{`${likeCount} Likes`}</p>
                    </div>
                    <div className="navigation-buttons">
                        <button className="prev-button" onClick={handlePrevious} disabled={activeSlideIndex === 0}>Previous</button>
                        <button className="next-button" onClick={handleNext} disabled={activeSlideIndex === story.slides.length - 1}>Next</button>
                    </div>
                    <button className="share-button" onClick={handleShare}>
                        <FontAwesomeIcon icon={faShareAlt} />
                    </button>
                </>
            ) : (
                <p>No slides available for this story.</p>
            )}
        </div>
    );
}

export default ViewStory;
