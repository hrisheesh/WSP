import axios from 'axios';

// Set the base URL for Axios
const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to include Authorization header automatically
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access, e.g., redirect to login
            console.error('Unauthorized access - possibly invalid token.');
            // Optionally, you can redirect the user to the login page
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Function to get stories based on category
export const getStories = async (category = 'All') => {
    try {
        const categoryQuery = category === 'All' ? '' : category;
        const response = await apiClient.get(`/stories?category=${encodeURIComponent(categoryQuery)}`);
        return response.data;
    } catch (error) {
        console.error('Error in getStories:', error);
        throw error.response?.data || error;
    }
};

// Function to fetch a single story by ID (if needed)
export const getStoryById = async (id) => {
    try {
        const response = await apiClient.get(`/stories/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error in getStoryById:', error);
        throw error.response?.data || error;
    }
};

// **New Function: Create a New Story**
export const createStory = async (category, slides, token) => {
    try {
        const response = await apiClient.post(
            '/stories',
            { category, slides },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error in createStory:', error);
        throw error.response?.data || error;
    }
};

// **New Function: Update an Existing Story**
export const updateStory = async (id, category, slides, token) => {
    try {
        const response = await apiClient.put(
            `/stories/${id}`,
            { category, slides },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error in updateStory:', error);
        throw error.response?.data || error;
    }
};

// **New Function: User Login**
export const login = async (username, password) => {
    try {
        const response = await apiClient.post('/auth/login', { username, password });
        return response.data;
    } catch (error) {
        console.error('Error in login:', error);
        throw error.response?.data || error;
    }
};

// **New Function: User Registration**
export const register = async (username, password) => {
    try {
        const response = await apiClient.post('/auth/register', { username, password });
        return response.data;
    } catch (error) {
        console.error('Error in register:', error);
        throw error.response?.data || error;
    }
};

// **New Function: Fetch Bookmarked Stories for a User**
export const getBookmarkedStories = async (userId) => {
    try {
        const response = await apiClient.get(`/bookmarks/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error in getBookmarkedStories:', error);
        throw error.response?.data || error;
    }
};

// Function to toggle like status for a story
export const toggleLike = async (storyId, token) => {
    try {
        const response = await apiClient.post(
            '/stories/like',
            { storyId },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error in toggleLike:', error);
        throw error.response?.data || error;
    }
};

// Function to add a bookmark to a story
export const addBookmark = async (storyId, token) => {
    try {
        const response = await apiClient.post(
            '/bookmarks',
            { storyId },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error in addBookmark:', error);
        throw error.response?.data || error;
    }
};

// Function to remove a bookmark from a story
export const removeBookmark = async (storyId, token) => {
    try {
        const response = await apiClient.delete('/bookmarks', {
            data: { storyId },
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error in removeBookmark:', error);
        throw error.response?.data || error;
    }
};

// Add more service functions as needed
