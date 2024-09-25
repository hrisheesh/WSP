const express = require('express');
const Bookmark = require('../models/Bookmark'); // Import the Bookmark model
const auth = require('../middleware/auth'); // Ensure this path is correct
const router = express.Router();

// POST /api/bookmarks
router.post('/', auth, async (req, res) => {
    const { storyId } = req.body; // Expecting storyId in the request body
    const userId = req.user.id; // Extract user ID from the request object

    // Log the incoming request body for debugging
    console.log('Received request to bookmark story:', req.body);

    try {
        // Check if the bookmark already exists
        const existingBookmark = await Bookmark.findOne({ userId, storyId });
        if (existingBookmark) {
            return res.status(400).json({ message: 'Bookmark already exists.' });
        }

        const newBookmark = new Bookmark({ userId, storyId });
        await newBookmark.save(); // Save the new bookmark
        res.status(201).json(newBookmark); // Return the created bookmark
    } catch (error) {
        console.error('Error adding bookmark:', error);
        res.status(500).json({ message: 'Failed to add bookmark.' });
    }
});

// DELETE /api/bookmarks
router.delete('/', auth, async (req, res) => {
    const { storyId } = req.body; // Expecting storyId in the request body
    const userId = req.user.id; // Extract user ID from the request object

    try {
        const result = await Bookmark.findOneAndDelete({ userId, storyId }); // Remove the bookmark
        if (!result) {
            return res.status(404).json({ message: 'Bookmark not found.' });
        }
        res.json({ message: 'Bookmark removed successfully.' });
    } catch (error) {
        console.error('Error removing bookmark:', error);
        res.status(500).json({ message: 'Failed to remove bookmark.' });
    }
});

// GET /api/bookmarks/user/:userId
router.get('/user/:userId', auth, async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch bookmarks and populate the storyId to get full story details
        const bookmarks = await Bookmark.find({ userId }).populate('storyId');
        res.json(bookmarks); // Return the bookmarks with populated story details
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ message: 'Failed to fetch bookmarks.' });
    }
});

module.exports = router;
