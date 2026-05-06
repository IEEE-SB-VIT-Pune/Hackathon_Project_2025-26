import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { useAuth } from "../../context/AuthContext";
import CountUp from 'react-countup';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';
import { Compass, CalendarDays, UserCircle2, Gavel, LayoutDashboard, ShieldCheck, UserPlus, Hammer, Trophy } from 'lucide-react';
import "../../styles/home.css";

/* =============== GATEWAY CARD DATA =============== */
const gateways = [
    {
        title: "Discover Hackathons",
        desc: "Browse upcoming hackathons, filter by tech stack, and find the perfect challenge for your team.",
        to: "/discovery",
        accent: "#3b82f6",
        bg: "#eff6ff",
        Icon: Compass,
    },
    {
        title: "Calendar",
        desc: "Track deadlines, submission dates, and presentation schedules in one unified timeline.",
        to: "/calendar",
        accent: "#8b5cf6",
        bg: "#f5f3ff",
        Icon: CalendarDays,
    },
    {
        title: "My Profile",
        desc: "Manage your skills, teams, and hackathon history. Showcase your achievements.",
        to: "/profile",
        accent: "#06b6d4",
        bg: "#ecfeff",
        Icon: UserCircle2,
    },
    {
        title: "Judge Panel",
        desc: "Review submissions, score teams with criteria-based rubrics, and provide feedback.",
        to: "/judge/hackathons",
        accent: "#f59e0b",
        bg: "#fffbeb",
        Icon: Gavel,
    },
    {
        title: "Organizer Dashboard",
        desc: "Manage your assigned hackathons, teams, and event settings.",
        to: "/organizer/dashboard",
        accent: "#047857",
        bg: "#ecfdf5",
        Icon: LayoutDashboard,
    },
    {
        title: "Admin Dashboard",
        desc: "Create hackathons, manage teams, assign judges, and monitor platform activity.",
        to: "/admin/dashboard",
        accent: "#ef4444",
        bg: "#fef2f2",
        Icon: ShieldCheck,
        roleRequired: "admin"
    }
];

/* =============== STEPS DATA =============== */
const steps = [
    {
        num: "01",
        title: "Register",
        desc: "Create your account, browse hackathons, and form or join a team.",
        Icon: UserPlus,
    },
    {
        num: "02",
        title: "Build",
        desc: "Collaborate with your team, submit prototypes, and iterate on your project.",
        Icon: Hammer,
    },
    {
        num: "03",
        title: "Win",
        desc: "Present to judges, get scored with transparent rubrics, and claim your prizes.",
        Icon: Trophy,
    },
];

/* =============== STATS DATA =============== */
const stats = [
    { value: 50, label: "Hackathons Hosted", suffix: "+" },
    { value: 1200, label: "Teams Formed", suffix: "+" },
    { value: 3500, label: "Projects Submitted", suffix: "+" },
    { value: 10000, label: "Participants", suffix: "+" },
];

const Home = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    
    // Vanta.js integration
    const [vantaEffect, setVantaEffect] = useState(null);
    const vantaRef = useRef(null);

    useEffect(() => {
        if (!vantaEffect && vantaRef.current) {
            setVantaEffect(NET({
                el: vantaRef.current,
                THREE: THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.15, // Scales down the rendering resolution slightly to boost FPS
                scaleMobile: 2.00, // Greatly scales down resolution on mobile for performance
                points: 12, // Reduced number of points from ~20 to 12. Vanta.net calculates lines exponentially (N^2), so fewer nodes = MASSIVE performance gain
                maxDistance: 24, // Let nodes link up slightly further away to compensate for fewer nodes
                spacing: 18, 
                color: 0x60a5fa,
                backgroundColor: 0x1e3a8a 
            }));
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

    const handleCardClick = (e, g) => {
        e.preventDefault();

        // 1. Mandatory Login Check
        if (!isAuthenticated) {
            return navigate('/login');
        }

        // 2. Admin Logic (Keep Alert)
        if (g.roleRequired === 'admin' && user?.systemRole !== 'admin') {
            return alert("Access Denied: You are not an Admin.");
        }

        // 3. Judge & Organizer - Direct Navigation (Old Way)
        // The pages themselves will handle the filtering/empty states
        navigate(g.to);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* ===== HERO ===== */}
            <section className="home-hero" ref={vantaRef}>
                <div className="hero-content">
                    

                    <h1 className="hero-title">
                        Build. Compete.
                        <br />
                        <span className="gradient-text">Innovate Together.</span>
                    </h1>

                    <p className="hero-subtitle">
                        One platform to host, manage, and participate in hackathons.
                        From team formation to judging — everything in one place.
                    </p>

                    <div className="hero-actions">
                        <Link to="/discovery" className="btn-hero-primary">
                            Explore Hackathons →
                        </Link>
                        {isAuthenticated ? (
                            <Link to="/profile" className="btn-hero-secondary">
                                Go to My Profile
                            </Link>
                        ) : (
                            <Link to="/signup" className="btn-hero-secondary">
                                Get Started — It's Free
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* ===== GATEWAY CARDS ===== */}
            <section className="gateway-section">
                <div className="section-header">
                    <span className="section-label">Your Gateway</span>
                    <h2 className="section-title">Everything You Need</h2>
                    <p className="section-subtitle">
                        Jump into any area of the platform. Whether you're here to compete,
                        judge, or organize ... we've got you covered.
                    </p>
                </div>

                <div className="gateway-grid">
                    {gateways.map((g, i) => (
                        <div
                            key={i}
                            onClick={(e) => handleCardClick(e, g)}
                            className="gateway-card"
                            style={{
                                "--card-accent": g.accent,
                                "--card-bg": g.bg,
                                cursor: 'pointer'
                            }}
                        >
                            <div className="card-icon" style={{ color: g.accent }}>
                                <g.Icon size={32} strokeWidth={1.75} />
                            </div>
                            <div className="card-title">{g.title}</div>
                            <div className="card-desc">{g.desc}</div>
                            <div className="card-arrow">
                                Go to {g.title} <span>→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="how-section">
                <div className="section-header">
                    <span className="section-label">How It Works</span>
                    <h2 className="section-title">Three Steps to Glory</h2>
                    <p className="section-subtitle">
                        Getting started is simple — here's the path from idea to innovation.
                    </p>
                </div>

                <div className="steps-row">
                    {steps.map((s, i) => (
                        <div key={i} className="step-item">
                            <div className="step-number">{s.num}</div>
                            <div className="step-icon">
                                <s.Icon size={28} strokeWidth={1.75} />
                            </div>
                            <div className="step-title">{s.title}</div>
                            <div className="step-desc">{s.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section className="stats-section">
                <div className="stats-row">
                    {stats.map((s, i) => (
                        <div key={i} className="stat-item">
                            <div className="stat-number">
                                <CountUp end={s.value} duration={2.5} separator="," enableScrollSpy scrollSpyOnce />
                                {s.suffix}
                            </div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;