import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './styles/AddEditStory.css';
import { createStory, updateStory } from '../services/apiService'; // Import service functions

const categories = ['Food', 'Health and Fitness', 'Travel', 'Movie', 'Education'];

function AddEditStory({ isEditMode, existingStory, onSubmit }) {
    const [slides, setSlides] = useState(
        isEditMode && existingStory ? existingStory.slides : Array(3).fill({ heading: '', description: '', mediaUrl: '' })
    );
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [error, setError] = useState('');
    const [storyCategory, setStoryCategory] = useState(isEditMode && existingStory ? existingStory.category : categories[0]);

    useEffect(() => {
        if (isEditMode && existingStory) {
            setSlides(existingStory.slides);
            setStoryCategory(existingStory.category);
        }
    }, [isEditMode, existingStory]);

    const handleSlideChange = (index, field, value) => {
        const newSlides = slides.map((slide, i) => 
            i === index ? { ...slide, [field]: value } : slide
        );
        setSlides(newSlides);
    };

    const addSlide = () => {
        if (slides.length < 6) {
            setSlides([...slides, { heading: '', description: '', mediaUrl: '' }]);
        }
    };

    const removeSlide = (index) => {
        if (slides.length > 3) {
            const newSlides = slides.filter((_, i) => i !== index);
            setSlides(newSlides);
            if (activeSlideIndex >= newSlides.length) {
                setActiveSlideIndex(newSlides.length - 1);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (slides.length < 3 || slides.some(slide => !slide.heading || !slide.description || !slide.mediaUrl)) {
            setError('All fields are mandatory and at least 3 slides are required.');
            return;
        }
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found. Please log in again.');
            }

            const slidesData = slides.map(slide => ({
                heading: slide.heading,
                description: slide.description,
                mediaUrl: slide.mediaUrl,
            }));

            let data;
            if (isEditMode && existingStory) {
                data = await updateStory(existingStory._id, storyCategory, slidesData, token);
                alert(`Story Updated Successfully: ${data.category}`);
            } else {
                data = await createStory(storyCategory, slidesData, token);
                alert(`Story Posted Successfully: ${data.category}`);
            }

            onSubmit(data);
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message || 'An unexpected error occurred.'}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-edit-story-form">
            {error && <p className="error-message">{error}</p>}
            <div className="tabs">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        className={`tab ${activeSlideIndex === index ? 'active' : ''}`}
                        onClick={() => setActiveSlideIndex(index)}
                    >
                        Slide {index + 1}
                    </button>
                ))}
                {slides.length < 6 && (
                    <button type="button" onClick={addSlide} className="add-slide-button">Add +</button>
                )}
            </div>
            <div className="slide">
                <h3>Slide {activeSlideIndex + 1}</h3>
                <input
                    type="text"
                    placeholder="Heading"
                    value={slides[activeSlideIndex].heading}
                    onChange={(e) => handleSlideChange(activeSlideIndex, 'heading', e.target.value)}
                    required
                />
                <textarea
                    placeholder="Description"
                    value={slides[activeSlideIndex].description}
                    onChange={(e) => handleSlideChange(activeSlideIndex, 'description', e.target.value)}
                    required
                />
                <input
                    type="url"
                    placeholder="Add Image/Video URL"
                    value={slides[activeSlideIndex].mediaUrl}
                    onChange={(e) => handleSlideChange(activeSlideIndex, 'mediaUrl', e.target.value)}
                    required
                />
                <select
                    value={storyCategory}
                    onChange={(e) => setStoryCategory(e.target.value)}
                >
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                <div className="button-group">
                    {slides.length > 3 && (
                        <button type="button" onClick={() => removeSlide(activeSlideIndex)}>Remove Slide</button>
                    )}
                    <div className="navigation-buttons">
                        {activeSlideIndex > 0 && (
                            <button type="button" onClick={() => setActiveSlideIndex(activeSlideIndex - 1)}>Previous</button>
                        )}
                        {activeSlideIndex < slides.length - 1 && (
                            <button type="button" onClick={() => setActiveSlideIndex(activeSlideIndex + 1)}>Next</button>
                        )}
                        <button type="submit">{isEditMode ? 'Update Story' : 'Post Story'}</button>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default AddEditStory;