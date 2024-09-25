import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './styles/ViewStory.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as solidBookmark } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as regularBookmark } from '@fortawesome/free-regular-svg-icons';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import SharePopup from './SharePopup';

function ViewStory({ story, onClose }) {
    const navigate = useNavigate(); // Initialize useNavigate
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSharePopup, setShowSharePopup] = useState(false);

    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                const response = await axios.get(`/api/stories/${story._id}`);
                setLikeCount(response.data.likes);
            } catch (error) {
                console.error('Error fetching initial state:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialState();
    }, [story._id]);

    const toggleLike = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Redirect to login page
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/stories/like', {
                storyId: story._id,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setLikeCount(response.data.likes);
            const userId = localStorage.getItem('userId');
            const liked = response.data.likedBy.includes(userId);
            setIsLiked(liked);
        } catch (error) {
            console.error('Error updating like status:', error);
            if (error.response && error.response.status === 401) {
                alert('Session expired. Please log in again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleBookmark = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Redirect to login page
            return;
        }

        setLoading(true);
        try {
            if (isBookmarked) {
                const response = await axios.delete('/api/bookmarks', {
                    data: { storyId: story._id },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.status === 200) {
                    setIsBookmarked(false);
                }
            } else {
                const response = await axios.post('/api/bookmarks', {
                    storyId: story._id,
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.status === 201) {
                    setIsBookmarked(true);
                }
            }
        } catch (error) {
            console.error('Error updating bookmark status:', error);
            if (error.response && error.response.status === 400) {
                alert('Failed to update bookmark status. Please check the story ID.');
            } else if (error.response && error.response.status === 401) {
                alert('Session expired. Please log in again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (activeSlideIndex < story.slides.length - 1) {
            setActiveSlideIndex(activeSlideIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (activeSlideIndex > 0) {
            setActiveSlideIndex(activeSlideIndex - 1);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(`Check out this story: ${story.slides[activeSlideIndex].heading}`) // Copy message to clipboard
            .then(() => {
                setShowSharePopup(true); // Show the popup
                setTimeout(() => setShowSharePopup(false), 3000); // Hide after 3 seconds
            })
            .catch(err => console.error('Failed to copy: ', err));
    };

    return (
        <div className="view-story-container">
            <button className="close-button" onClick={onClose}>✖</button>
            {showSharePopup && (
                <SharePopup message="Liked is copied to clipboard." onClose={() => setShowSharePopup(false)} />
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
                                    onClick={toggleBookmark} 
                                    disabled={loading}
                                >
                                    <FontAwesomeIcon icon={isBookmarked ? solidBookmark : regularBookmark} />
                                </button>
                                <div className="like-button-container">
                                    <button 
                                        className={`like-button ${isLiked ? 'liked' : ''}`} 
                                        onClick={toggleLike} 
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
