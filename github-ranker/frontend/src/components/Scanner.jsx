import React, { useState } from 'react';

// Change onUpdate to onProfileAdded to match App.js
const RankScanner = ({ onProfileAdded }) => { 
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleScan = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/rank-me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ githubUrl: url })
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            const data = await response.json();

            // Safety check: ensure we got data back
            if (!data || !data.username) {
                throw new Error('Invalid data received');
            }

            // SAVE TO LOCAL STORAGE
            const localKey = 'ranker_data'; // Using the key App.js looks for
            const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
            const updated = [data, ...existing.filter(u => u.username !== data.username)];
            localStorage.setItem(localKey, JSON.stringify(updated));

            // CALL THE CORRECT PROP NAME
            if (onProfileAdded) {
                onProfileAdded(data);
            }
            
            setUrl('');
        } catch (err) {
            console.error("Scanning Error:", err);
            alert("Error scanning profile. Check the browser console (F12) for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="scanner-container">
            <form onSubmit={handleScan}>
                <input 
                    className="scanner-input"
                    type="text" 
                    placeholder="Enter GitHub URL (e.g. github.com/username)" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required 
                />
                <button className="scanner-button" type="submit" disabled={loading}>
                    {loading ? "Analyzing..." : "Calculate Score"}
                </button>
            </form>
        </div>
    );
};

export default RankScanner;