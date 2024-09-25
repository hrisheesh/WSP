import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Assuming you have axios installed
import Modal from './Modal'; // Assuming you have a Modal component

function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state
    const navigate = useNavigate(); // Initialize useNavigate

    const { username, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true); // Set loading to true

        try {
            const res = await axios.post('/api/auth/login', { username, password });
            const token = res.data.token; // Assuming this is where you get the token
            localStorage.setItem('token', token); // Store the token
            setMessage('Login successful!');
            setIsSuccess(true);
            console.log(res.data);
            navigate('/dashboard'); // Redirect to UserDashboard after successful login
        } catch (err) {
            setMessage(err.response?.data?.message || 'An error occurred');
            setIsSuccess(false);
            console.error(err.response?.data);
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)}>Sign In</button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Login">
                <form onSubmit={onSubmit}>
                    <input type="text" name="username" value={username} onChange={onChange} placeholder="Enter username" required />
                    <input type="password" name="password" value={password} onChange={onChange} placeholder="Enter password" required />
                    <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                </form>
                {message && <p className={isSuccess ? 'success-message' : 'message'}>{message}</p>}
            </Modal>
        </>
    );
}

export default Login;
