const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true } // Ensure this line is present
}, { timestamps: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
module.exports = Bookmark;
