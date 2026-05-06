import React from 'react';
import CalendarCell from './CalendarCell';

/* Weekday labels — full on desktop, single-char on mobile via CSS class */
const WEEKDAYS = [
    { full: 'Sun', short: 'S' },
    { full: 'Mon', short: 'M' },
    { full: 'Tue', short: 'T' },
    { full: 'Wed', short: 'W' },
    { full: 'Thu', short: 'T' },
    { full: 'Fri', short: 'F' },
    { full: 'Sat', short: 'S' },
];

const CalendarGrid = ({ currentDate, events, onNavigate, onEventClick }) => {
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const daysInMonth    = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    // Leading empty cells
    for (let i = 0; i < firstDayOfMonth; i++) days.push({ day: null });
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
        const dayEvents = events.filter(e => {
            if (!e.start) return false;
            const d = new Date(e.start);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === i;
        });
        days.push({ day: i, events: dayEvents });
    }

    const today = new Date();
    const isToday = (d) =>
        today.getDate() === d &&
        today.getMonth() === month &&
        today.getFullYear() === year;

    return (
        <section className="calendar-section">
            {/* ── Header row: month title + prev/next ─── */}
            <div className="calendar-header">
                <div className="month-nav">
                    <span className="current-month">{monthName} {year}</span>
                    <div className="nav-controls">
                        <button
                            className="nav-btn"
                            onClick={() => onNavigate(-1)}
                            aria-label="Previous month"
                        >
                            ‹
                        </button>
                        <button
                            className="nav-btn today-btn"
                            onClick={() => onNavigate(0)}
                            aria-label="Go to today"
                        >
                            Today
                        </button>
                        <button
                            className="nav-btn"
                            onClick={() => onNavigate(1)}
                            aria-label="Next month"
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 7-column grid ─── */}
            <div className="calendar-grid">
                {/* Weekday header row */}
                {WEEKDAYS.map((wd, i) => (
                    <div key={i} className="weekday-header">
                        <span className="wd-full">{wd.full}</span>
                        <span className="wd-short">{wd.short}</span>
                    </div>
                ))}

                {/* Day cells */}
                {days.map((dayObj, index) => (
                    <CalendarCell
                        key={index}
                        day={dayObj.day}
                        events={dayObj.events || []}
                        isToday={isToday(dayObj.day)}
                        onEventClick={onEventClick}
                    />
                ))}

                {/* Empty state (no events at all) */}
                {events.length === 0 && (
                    <div className="empty-state-message">
                        <p>No events match your active filters.</p>
                    </div>
                )}
            </div>

            {/* ── Legend ─── */}
            <div className="calendar-legend">
                <span className="legend-title">Legend:</span>
                <div className="legend-item"><div className="legend-dot badge-hackathon-start"></div> Start</div>
                <div className="legend-item"><div className="legend-dot badge-hackathon-end"></div> End</div>
                <div className="legend-item"><div className="legend-dot badge-submission"></div> Deadline</div>
                <div className="legend-item"><div className="legend-dot badge-evaluation"></div> Presentation</div>
                <div className="legend-item"><div className="legend-dot badge-results"></div> Results</div>
            </div>
        </section>
    );
};

export default CalendarGrid;
