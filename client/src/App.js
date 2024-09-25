import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home'; // Import the Home component
import UserDashboard from './components/UserDashboard'; // Import the UserDashboard component
import BookmarkPage from './components/BookmarkPage'; // Import the BookmarkPage component
import AddEditStory from './components/AddEditStory'; // Import the AddEditStory component

function App() {
  const [loggedInUsername, setLoggedInUsername] = useState('User'); // Placeholder for logged-in username

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Web Stories Platform</h1>
          <div className="auth-buttons">
            <Register />
            <Login />
          </div>
        </header>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setLoggedInUsername={setLoggedInUsername} />} />
          <Route path="/dashboard" element={<UserDashboard username={loggedInUsername} setLoggedInUsername={setLoggedInUsername} />} />
          <Route path="/bookmarks" element={<BookmarkPage />} />
          <Route path="/edit-story" element={<AddEditStory />} /> {/* Change 'component' to 'element' */}
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
