const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    category: { type: String, required: true }, // Category of the story
    slides: [
        {
            heading: { type: String, required: true },
            description: { type: String, required: true },
            mediaUrl: { type: String, required: true },
        }
    ],
    userId: { type: String, required: true }, // To associate stories with users
    likes: { type: Number, default: 0 }, // To store the total number of likes
    likedBy: [{ type: String }] // Array to store user IDs of users who liked the story
}, { timestamps: true });

const Story = mongoose.model('Story', storySchema);
module.exports = Story;
