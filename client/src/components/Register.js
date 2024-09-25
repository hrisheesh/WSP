import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

    const { username, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/register', { username, password });
            setMessage('You are registered successfully!');
            setIsSuccess(true);
            console.log(res.data);
            setIsOpen(false); // Close the modal
            setTimeout(() => {
                navigate('/login'); // Redirect to login after a brief delay
            }, 500);
        } catch (err) {
            setMessage(err.response.data.message || 'An error occurred');
            setIsSuccess(false);
            console.error(err.response.data);
        }
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)}>Register Now</button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Register">
                <form onSubmit={onSubmit}>
                    <input type="text" name="username" value={username} onChange={onChange} placeholder="Enter username" required />
                    <input type="password" name="password" value={password} onChange={onChange} placeholder="Enter password" required />
                    <button type="submit">Register</button>
                </form>
                {message && <p className={isSuccess ? 'success-message' : 'message'}>{message}</p>}
            </Modal>
        </>
    );
}

export default Register;
