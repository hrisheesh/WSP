import React from 'react';
import './styles/SharePopup.css'; // Create a CSS file for styling

const SharePopup = ({ message, onClose }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="close-button" onClick={onClose}>✖</button>
                <p>{message}</p>
            </div>
        </div>
    );
};

export default SharePopup;