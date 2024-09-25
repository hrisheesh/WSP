import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/BookmarkPage.css'; // Import the CSS for styling
import ViewStory from './ViewStory'; // Import the ViewStory component
import Modal from './Modal';

function BookmarkPage() {
    const [bookmarkedStories, setBookmarkedStories] = useState([]);
    const [isViewStoryOpen, setIsViewStoryOpen] = useState(false);
    const [currentStory, setCurrentStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBookmarkedStories = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to view your bookmarks.');
            navigate('/'); // Redirect to home if not logged in
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.id;

            const response = await fetch(`/api/bookmarks/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch bookmarked stories');
            }

            const data = await response.json();
            setBookmarkedStories(data); // This now contains full story details
        } catch (error) {
            console.error('Error fetching bookmarked stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewStory = (story) => {
        setCurrentStory(story.storyId); // Access the populated storyId
        setIsViewStoryOpen(true);
    };

    const handleBack = () => {
        navigate('/dashboard'); // Navigate back to the dashboard
    };

    useEffect(() => {
        fetchBookmarkedStories();
    }, []);

    return (
        <div className="bookmark-page-container">
            <button onClick={handleBack} className="back-button">Back to Dashboard</button>
            <h2>Your Bookmarked Stories</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="stories-grid">
                    {bookmarkedStories.length > 0 ? (
                        bookmarkedStories.map((bookmark, index) => (
                            <div key={index} className="story-card" onClick={() => handleViewStory(bookmark)}>
                                {bookmark.storyId.slides && bookmark.storyId.slides.length > 0 ? (
                                    <>
                                        <h3>{bookmark.storyId.slides[0].heading}</h3>
                                        <p>{bookmark.storyId.slides[0].description}</p>
                                        <img src={bookmark.storyId.slides[0].mediaUrl} alt={bookmark.storyId.slides[0].heading} />
                                    </>
                                ) : (
                                    <p>No slides available for this story.</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No bookmarked stories available.</p>
                    )}
                </div>
            )}
            <Modal isOpen={isViewStoryOpen} onClose={() => setIsViewStoryOpen(false)}>
                <ViewStory story={currentStory} onClose={() => setIsViewStoryOpen(false)} />
            </Modal>
        </div>
    );
}

export default BookmarkPage;
