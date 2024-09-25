import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/apiService'; // Import the register function
import Modal from './Modal'; // Assuming you have a Modal component

function Register() {
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
            const res = await register(username, password); // Use the centralized register function
            setMessage('You are registered successfully!');
            setIsSuccess(true);
            console.log(res.data);
            setIsOpen(false); // Close the modal
            setTimeout(() => {
                navigate('/login'); // Redirect to login after a brief delay
            }, 500);
        } catch (err) {
            setMessage(err.message || 'An error occurred');
            setIsSuccess(false);
            console.error(err);
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)}>Register Now</button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Register">
                <h2 style={{ textAlign: 'center', color: 'black', fontSize: '28px', marginBottom: '15px' }}>Register</h2> {/* Increased font size */}
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: 'black', width: '100%' }}>
                        Username
                        <input 
                            type="text" 
                            name="username" 
                            value={username} 
                            onChange={onChange} 
                            placeholder="Enter username" 
                            required 
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', width: '80%' }} // Adjusted width
                        />
                    </label>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: 'black', width: '100%' }}>
                        Password
                        <input 
                            type="password" 
                            name="password" 
                            value={password} 
                            onChange={onChange} 
                            placeholder="Enter password" 
                            required 
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', width: '80%' }} // Adjusted width
                        />
                    </label>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        style={{ 
                            width: '129px', 
                            height: '45px', 
                            borderRadius: '20px', 
                            backgroundColor: '#73ABFF', 
                            color: 'white', 
                            cursor: 'pointer', 
                            alignSelf: 'center', 
                            fontSize: '16px', 
                            marginTop: '15px' // Added margin for spacing
                        }}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                {message && <p className={isSuccess ? 'success-message' : 'message'} style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{message}</p>}
            </Modal>
        </>
    );
}

export default Register;
