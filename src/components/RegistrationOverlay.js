import React, { useState } from 'react';
import Cookies from 'js-cookie';
import './RegistrationOverlay.css';

const RegistrationOverlay = ({ onClose, googleUser }) => {
  const [formData, setFormData] = useState({
    name: googleUser?.name || '',
    email: googleUser?.email || '',
    company: '',
    intendedUse: ''
  });
  const [emailError, setEmailError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Set a session cookie to remember the user
    Cookies.set('kartavision_registered', 'true', { expires: 1/24 }); // 1 hour expiry
    
    // Close the overlay
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="registration-overlay">
      <div className="registration-content">
        <h2>Welcome to Karta Vision</h2>
        <p>Please complete your registration to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!!googleUser}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!!googleUser}
              required
            />
            {emailError && <span className="error-message">{emailError}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="company">Company</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="intendedUse">How do you plan to use Karta Vision?</label>
            <textarea
              id="intendedUse"
              name="intendedUse"
              value={formData.intendedUse}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationOverlay; 