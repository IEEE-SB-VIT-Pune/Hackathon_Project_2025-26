import React from 'react';

const getBadgeClass = (type) => {
    switch (type) {
        case 'hackathon_start': return 'badge-hackathon-start';
        case 'hackathon_end':   return 'badge-hackathon-end';
        case 'deadline':        return 'badge-submission';
        case 'presentation':    return 'badge-evaluation';
        case 'result':          return 'badge-results';
        // Legacy
        case 'Registration': return 'badge-registration';
        case 'Submission':   return 'badge-submission';
        case 'Results':      return 'badge-results';
        case 'Evaluation':   return 'badge-evaluation';
        default: return '';
    }
};

const CalendarCell = ({ day, events, isToday, onEventClick }) => {
    if (!day) return <div className="day-cell muted" aria-hidden="true" />;

    // Cap visible events on desktop; on mobile we show dots
    const MAX_VISIBLE = 2;
    const overflow = Math.max(0, events.length - MAX_VISIBLE);

    return (
        <div className={`day-cell ${isToday ? 'today' : ''}`} role="gridcell" aria-label={`Day ${day}${isToday ? ', today' : ''}`}>
            <div className="date-number">{day}</div>

            {/* ── Desktop: full-text badges ── */}
            <div className="events-stack desktop-events">
                {events.slice(0, MAX_VISIBLE).map(event => {
                    const label = event.hackathon
                        ? `${event.hackathon} — ${event.name}`
                        : event.name;
                    return (
                        <div
                            key={event.id}
                            className={`event-badge ${getBadgeClass(event.type)}`}
                            title={label}
                            onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && onEventClick(event)}
                        >
                            {label}
                        </div>
                    );
                })}
                {overflow > 0 && (
                    <div
                        className="event-overflow"
                        onClick={(e) => { e.stopPropagation(); onEventClick(events[MAX_VISIBLE]); }}
                        role="button"
                        tabIndex={0}
                    >
                        +{overflow} more
                    </div>
                )}
            </div>

            {/* ── Mobile: colored dot indicators ── */}
            <div className="mobile-dots">
                {events.slice(0, 3).map((event, i) => (
                    <span
                        key={i}
                        className={`event-dot ${getBadgeClass(event.type)}`}
                        title={event.name}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        role="button"
                        tabIndex={0}
                        aria-label={event.name}
                    />
                ))}
                {events.length > 3 && (
                    <span className="dot-overflow">+{events.length - 3}</span>
                )}
            </div>
        </div>
    );
};

export default CalendarCell;
