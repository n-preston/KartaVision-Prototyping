import React from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import './GoogleSignIn.css';

const GoogleSignIn = ({ onSuccess }) => {
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      onSuccess({
        name: user.displayName,
        email: user.email
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="google-sign-in-container">
      <div className="google-sign-in-content">
        <h2>Welcome to Karta Vision</h2>
        <p>Please sign in with your Google account to continue</p>
        <button 
          className="google-sign-in-button"
          onClick={handleGoogleSignIn}
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="google-icon"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default GoogleSignIn; 