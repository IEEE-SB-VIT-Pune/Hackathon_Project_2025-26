import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Navbar from '../../components/common/Navbar';
import CalendarSidebar from '../../components/user/CalendarSidebar';
import CalendarGrid from '../../components/user/CalendarGrid';
import CalendarListView from '../../components/user/CalendarListView';
import Footer from '../../components/common/Footer';
import EventModal from '../../components/user/EventModal';
import { getMyCalendarEvents, getCalendarEvents } from '../../services/api';
import { getSocket } from '../../services/socket';
import '../../styles/calendar.css';

// Maps internal event type → display-friendly label used by filters & badges
const TYPE_LABELS = {
    hackathon_start: 'Hackathon Start',
    hackathon_end: 'Hackathon End',
    deadline: 'Deadline',
    presentation: 'Presentation',
    result: 'Result',
};

const ALL_TYPES = Object.keys(TYPE_LABELS);
const ALL_STATUSES = ['upcoming', 'past'];

// ── Real-time update banner ──────────────────────────────────────────────────
const RefreshBanner = ({ visible }) => (
    <div
        style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(5,150,105,0.35)',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-10px)',
            pointerEvents: 'none',
            zIndex: 9999,
        }}
    >
        📅 Calendar updated in real time
    </div>
);

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [bannerVisible, setBannerVisible] = useState(false);
    const bannerTimer = useRef(null);

    const [currentDate, setCurrentDate] = useState(new Date());

    const [filters, setFilters] = useState({
        status: [...ALL_STATUSES],
        type: [...ALL_TYPES],
    });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('month'); // 'month' | 'list'
    const [sidebarOpen, setSidebarOpen] = useState(false);  // mobile filter drawer

    // ── Fetch ─────────────────────────────────────────────────────────────
    const fetchEvents = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setError(null);

            const response = showAll
                ? await getCalendarEvents()
                : await getMyCalendarEvents();

            if (response.data.success) {
                const mapped = response.data.data.map(event => ({
                    ...event,
                    name: TYPE_LABELS[event.type] || event.type,
                    hackathon: event.hackathonName || 'Unknown Hackathon',
                }));
                setEvents(mapped);
            }
        } catch (err) {
            console.error('Error fetching calendar events:', err);
            if (!silent) {
                setError(
                    showAll
                        ? 'Could not load the public calendar.'
                        : 'Could not load your calendar. Make sure you are logged in.'
                );
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [showAll]);

    useEffect(() => { fetchEvents(false); }, [fetchEvents]);

    // ── Socket.IO ─────────────────────────────────────────────────────────
    useEffect(() => {
        const socket = getSocket();
        const handleCalendarUpdate = () => {
            fetchEvents(true).then(() => {
                setBannerVisible(true);
                clearTimeout(bannerTimer.current);
                bannerTimer.current = setTimeout(() => setBannerVisible(false), 3000);
            });
        };
        socket.on('calendar:update', handleCalendarUpdate);
        return () => {
            socket.off('calendar:update', handleCalendarUpdate);
            clearTimeout(bannerTimer.current);
        };
    }, [fetchEvents]);

    // ── Filter helpers ────────────────────────────────────────────────────
    const handleFilterChange = (category, value) => {
        setFilters(prev => {
            if (category === 'reset') return { status: [...ALL_STATUSES], type: [...ALL_TYPES] };
            if (category === 'clear') return { status: [], type: [] };
            const current = prev[category];
            const next = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: next };
        });
    };

    const handleEventClick = (event) => { setSelectedEvent(event); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setSelectedEvent(null); };

    const filteredEvents = useMemo(() =>
        events.filter(event => {
            const statusMatch = filters.status.length === 0 || filters.status.includes(event.status?.toLowerCase());
            const typeMatch = filters.type.length === 0 || filters.type.includes(event.type);
            return statusMatch && typeMatch;
        }),
        [events, filters]);

    const onNavigateMonth = (direction) => {
        if (direction === 0) { setCurrentDate(new Date()); return; }
        const next = new Date(currentDate);
        next.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(next);
    };

    // ── Loading state ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="calendar-page">
                <Navbar />
                <div className="cal-loading">
                    <div className="cal-spinner" />
                    <p>Loading calendar…</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="calendar-page">
            <Navbar />

            <RefreshBanner visible={bannerVisible} />

            {/* ── Top Control Bar ── */}
            <div className="calendar-top-bar">

                {/* View mode — toggle buttons (desktop) + select (mobile) */}
                <div className="cal-control-group">
                    <span className="cal-control-label">View</span>

                    {/* Desktop toggle buttons */}
                    <div className="view-mode-toggles cal-desktop-only">
                        <button
                            className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
                            onClick={() => setViewMode('month')}
                        >
                            Month
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            List
                        </button>
                    </div>

                    {/* Mobile select */}
                    <select
                        className="cal-select cal-mobile-only"
                        value={viewMode}
                        onChange={e => setViewMode(e.target.value)}
                        aria-label="View mode"
                    >
                        <option value="month">Month</option>
                        <option value="list">List</option>
                    </select>
                </div>

                {/* Data source — toggle buttons (desktop) + select (mobile) */}
                <div className="cal-control-group">
                    <span className="cal-control-label">Show</span>

                    {/* Desktop toggle buttons */}
                    <div className="view-mode-toggles cal-desktop-only">
                        <button
                            className={`view-btn ${!showAll ? 'active' : ''}`}
                            onClick={() => setShowAll(false)}
                            title="Only hackathons you are registered for"
                        >
                            My Events
                        </button>
                        <button
                            className={`view-btn ${showAll ? 'active' : ''}`}
                            onClick={() => setShowAll(true)}
                            title="All open / ongoing hackathons"
                        >
                            All Hackathons
                        </button>
                    </div>

                    {/* Mobile select */}
                    <select
                        className="cal-select cal-mobile-only"
                        value={showAll ? 'all' : 'mine'}
                        onChange={e => setShowAll(e.target.value === 'all')}
                        aria-label="Event source"
                    >
                        <option value="mine">My Events</option>
                        <option value="all">All Hackathons</option>
                    </select>
                </div>

                {/* Mobile filter toggle — only visible on mobile */}
                <button
                    className="cal-filter-toggle-btn cal-mobile-only"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open filters"
                >
                    Filters
                    {(filters.status.length < ALL_STATUSES.length || filters.type.length < ALL_TYPES.length) && (
                        <span className="cal-filter-badge" />
                    )}
                </button>
            </div>

            {/* ── Error & Empty States ── */}
            {error && (
                <div className="cal-error-banner">{error}</div>
            )}

            {!error && events.length === 0 && (
                <div className="cal-empty-state">
                    <p>📭 No hackathon events found.</p>
                    {showAll
                        ? <p>No open hackathons have been created yet.</p>
                        : <p>Register for a hackathon to see its schedule, or switch to <strong>All Hackathons</strong>.</p>
                    }
                </div>
            )}

            {/* ── Main Calendar Layout ── */}
            <main className="calendar-container">
                {/* Mobile sidebar backdrop */}
                {sidebarOpen && (
                    <div
                        className="cal-sidebar-backdrop"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                <CalendarSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    typeLabels={TYPE_LABELS}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <section className="calendar-main-content">
                    {viewMode === 'month' ? (
                        <CalendarGrid
                            currentDate={currentDate}
                            events={filteredEvents}
                            onNavigate={onNavigateMonth}
                            onEventClick={handleEventClick}
                        />
                    ) : (
                        <CalendarListView
                            events={filteredEvents}
                            onEventClick={handleEventClick}
                        />
                    )}
                </section>
            </main>

            <EventModal
                event={selectedEvent}
                isOpen={isModalOpen}
                onClose={closeModal}
            />

            <Footer />
        </div>
    );
};

export default Calendar;
