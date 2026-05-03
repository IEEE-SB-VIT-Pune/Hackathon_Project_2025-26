import React from "react";
import { Link } from "react-router-dom";
import authBg from "../../assets/auth-bg.jpeg";
import '../../styles/auth.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      {/* Back to Home Button */}
      <Link to="/" className="auth-back-home">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Back to Home</span>
      </Link>

      {/* Left Form Section */}
      <div className="auth-left">
        {children}
      </div>

      {/* Right Branding Section (IMAGE ONLY) */}
      <div
        className="auth-right"
        style={{
          backgroundImage: `url(${authBg})`,
        }}

      />
    </div>
  );
};

export default AuthLayout;
