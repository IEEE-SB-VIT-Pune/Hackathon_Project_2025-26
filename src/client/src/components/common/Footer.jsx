import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand font-bold text-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
                    <span style={{ color: '#1e293b' }}>Hack<span style={{ color: '#2563eb' }}>Hub</span></span>
                </div>
                <nav className="footer-nav">
                    <Link to="/about" className="footer-link">About</Link>
                    <Link to="/faqs" className="footer-link">FAQs</Link>
                    <Link to="/contact" className="footer-link">Contact</Link>
                    <Link to="/terms" className="footer-link">Terms & Privacy</Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
