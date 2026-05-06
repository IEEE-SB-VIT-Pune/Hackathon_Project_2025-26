import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Telescope,
  Calendar as CalendarIcon,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  LayoutDashboard,
  PlusCircle,
  Menu,
  X,
  User,
} from "lucide-react";
import "../../styles/navbar.css";

const Navbar = ({ navigationMode = "user", showBadge = "", title = "" }) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const initial =
    user?.fullName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  const isActive = (path) => location.pathname.startsWith(path);

  /* ─── JUDGE NAVBAR ─── */
  if (navigationMode === "judge") {
    return (
      <nav className="judge-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <h1 className="navbar-logo">HackHub</h1>
            {showBadge && <span className="navbar-badge">{showBadge}</span>}
          </div>
          <div className="navbar-right">
            <button
              onClick={logout}
              className="nav-link logout"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  /* ─── ADMIN NAVBAR ─── */
  if (navigationMode === "admin") {
    return (
      <nav className="admin-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <Link
              to="/"
              className="navbar-logo"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              HackHub
            </Link>
          </div>

          {title && (
            <div className="navbar-center">
              <span className="navbar-title">{title}</span>
            </div>
          )}

          <div className="navbar-right">
            <Link
              to="/admin/dashboard"
              className={`nav-link ${isActive("/admin/dashboard") ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>

            <Link
              to="/admin/hackathons/create"
              className={`nav-link ${isActive("/admin/hackathons/create") ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <PlusCircle size={16} /> Create Hackathon
            </Link>

            <button
              onClick={logout}
              className="nav-link logout"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  /* ─── USER NAVBAR (default) ─── */
  return (
    <>
      <div className="navbar-user">
        <div className="navbar-content-user">
          {/* Left: Logo + Nav links */}
          <div className="navbar-left-user">
            <Link to="/" className="navbar-logo-user">
              HackHub
            </Link>

            {/* Desktop nav links */}
            <nav className="navbar-nav-user">
              <Link
                to="/discovery"
                className={`nav-item-user ${location.pathname === "/discovery" ? "active" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Telescope size={16} /> Discovery
              </Link>
              <Link
                to="/calendar"
                className={`nav-item-user ${location.pathname === "/calendar" ? "active" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <CalendarIcon size={16} /> Calendar
              </Link>
              <Link
                to="/about"
                className={`nav-item-user ${location.pathname === "/about" ? "active" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Telescope size={16} /> About Us
              </Link>
              {(user?.systemRole === "mentor" || user?.systemRole === "admin") && (
                <Link
                  to="/organizer/dashboard"
                  className={`nav-item-user ${location.pathname.startsWith("/organizer") ? "active" : ""}`}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Settings size={16} /> My Hackathons
                </Link>
              )}
              {user?.systemRole === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className={`nav-item-user ${location.pathname.startsWith("/admin") ? "active" : ""}`}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Shield size={16} /> Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Right: Auth + Hamburger */}
          <div className="navbar-right-user">
            {/* Desktop auth */}
            <div className="navbar-desktop-auth">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="navbar-profile-link">
                    <div className="navbar-avatar">{initial}</div>
                  </Link>
                  <button
                    onClick={logout}
                    className="navbar-logout-btn"
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <div className="navbar-auth-links">
                  <Link
                    to="/login"
                    className="navbar-login-link"
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <LogIn size={16} /> Login
                  </Link>
                  <Link
                    to="/signup"
                    className="navbar-signup-link"
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <UserPlus size={16} /> Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger button — mobile only */}
            <button
              className="navbar-hamburger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {menuOpen && (
        <div
          className="navbar-mobile-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <div className={`navbar-mobile-drawer ${menuOpen ? "open" : ""}`}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <span className="drawer-logo">HackHub</span>
          <button
            className="drawer-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* User info in drawer */}
        {isAuthenticated && (
          <div className="drawer-user-info">
            <div className="drawer-avatar">{initial}</div>
            <div>
              <div className="drawer-user-name">{user?.fullName || user?.email}</div>
              <div className="drawer-user-role">{user?.systemRole || "user"}</div>
            </div>
          </div>
        )}

        {/* Drawer Nav Links */}
        <nav className="drawer-nav">
          <Link to="/discovery" className="drawer-link">
            <Telescope size={18} /> Discovery
          </Link>
          <Link to="/calendar" className="drawer-link">
            <CalendarIcon size={18} /> Calendar
          </Link>
          <Link to="/about" className="drawer-link">
            <Telescope size={18} /> About Us
          </Link>
          {(user?.systemRole === "mentor" || user?.systemRole === "admin") && (
            <Link to="/organizer/dashboard" className="drawer-link">
              <Settings size={18} /> My Hackathons
            </Link>
          )}
          {user?.systemRole === "admin" && (
            <Link to="/admin/dashboard" className="drawer-link">
              <Shield size={18} /> Admin
            </Link>
          )}
        </nav>

        {/* Drawer Auth Actions */}
        <div className="drawer-auth">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="drawer-link">
                <User size={18} /> Profile
              </Link>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="drawer-logout-btn"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="drawer-link">
                <LogIn size={18} /> Login
              </Link>
              <Link to="/signup" className="drawer-signup-btn">
                <UserPlus size={18} /> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
