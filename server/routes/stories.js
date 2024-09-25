const express = require('express');
const Story = require('../models/Story'); // Import the Story model
const auth = require('../middleware/auth'); // Ensure this path is correct
const router = express.Router();

// POST /api/stories
router.post('/', auth, async (req, res) => {
    console.log(req.body); // Log the incoming request body
    const { category, slides } = req.body; // Expecting category and an array of slides
    const userId = req.user.id; // Extract user ID from the request object

    try {
        const newStory = new Story({
            category,
            slides,
            userId,
        });

        await newStory.save(); // Save the entire story document
        res.status(201).json(newStory); // Return the created story
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ message: 'Failed to create story.' });
    }
});

// GET /api/stories
router.get('/', async (req, res) => {
    const { category } = req.query; // Get the category from query parameters

    try {
        let stories;
        if (category && category !== 'All') {
            stories = await Story.find({ category }); // Filter stories by category
        } else {
            stories = await Story.find(); // Return all stories if category is "All"
        }
        res.json(stories);
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ message: 'Failed to fetch stories.' });
    }
});

// GET /api/stories/user/:userId
router.get('/user/:userId', auth, async (req, res) => {
    const { userId } = req.params; // Get the userId from the URL parameters
    try {
        const stories = await Story.find({ userId }); // Find stories by userId
        res.json(stories);
    } catch (error) {
        console.error('Error fetching user stories:', error);
        res.status(500).json({ message: 'Failed to fetch user stories.' });
    }
});

// GET /api/stories/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params; // Get the story ID from the URL parameters

    try {
        const story = await Story.findById(id); // Find the story by ID
        if (!story) {
            return res.status(404).json({ message: 'Story not found.' });
        }
        res.json(story); // Return the story details, including likes and likedBy
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch story.' });
    }
});

// PUT /api/stories/:id
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { category, slides } = req.body;

    try {
        const updatedStory = await Story.findByIdAndUpdate(id, { category, slides }, { new: true });
        if (!updatedStory) {
            return res.status(404).json({ message: 'Story not found.' });
        }
        res.json(updatedStory);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update story.' });
    }
});

// POST /api/stories/like
router.post('/like', auth, async (req, res) => {
    const { storyId } = req.body; // Expecting storyId in the request body
    const userId = req.user.id; // Extract user ID from the request object

    try {
        // Find the story by ID
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found.' });
        }

        // Check if the user has already liked the story
        if (story.likedBy && story.likedBy.includes(userId)) {
            // User has already liked the story, so we remove the like
            story.likes -= 1;
            story.likedBy = story.likedBy.filter(id => id !== userId);
        } else {
            // User has not liked the story, so we add the like
            story.likes += 1;
            if (!story.likedBy) {
                story.likedBy = [];
            }
            story.likedBy.push(userId);
        }

        await story.save(); // Save the updated story
        res.json({ likes: story.likes, likedBy: story.likedBy });
    } catch (error) {
        console.error('Error liking/unliking story:', error);
        res.status(500).json({ message: 'Failed to update like status.' });
    }
});

// Apply auth middleware to all other routes
router.use(auth);

module.exports = router;
