import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react';

/* ── compact multi-select dropdown ───────────────────────────────── */
const MultiSelectDropdown = ({ label, options, selected, onToggle }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const allSelected = options.every(o => selected.includes(o.value));
    const noneSelected = selected.length === 0;

    const summary =
        noneSelected ? 'None' :
        allSelected  ? 'All'  :
        selected.length === 1
            ? options.find(o => o.value === selected[0])?.label
            : `${selected.length} selected`;

    return (
        <div className="cal-dropdown" ref={ref}>
            <button
                className="cal-dropdown-btn"
                onClick={() => setOpen(o => !o)}
                type="button"
                aria-expanded={open}
            >
                <span className="cal-dropdown-label">{label}</span>
                <span className="cal-dropdown-summary">{summary}</span>
                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {open && (
                <div className="cal-dropdown-menu" role="listbox" aria-multiselectable="true">
                    {options.map(({ value, label: optLabel }) => {
                        const checked = selected.includes(value);
                        return (
                            <label
                                key={value}
                                className={`cal-dropdown-option ${checked ? 'checked' : ''}`}
                                role="option"
                                aria-selected={checked}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => onToggle(value)}
                                    className="cal-dropdown-checkbox"
                                />
                                <span className="cal-option-text">{optLabel}</span>
                                {checked && <span className="cal-option-check">✓</span>}
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ── main sidebar ─────────────────────────────────────────────────── */
const CalendarSidebar = ({ filters, onFilterChange, typeLabels = {}, isOpen = false, onClose }) => {
    const statusOptions = [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'past',     label: 'Past' },
    ];

    const typeOptions = Object.entries(typeLabels).map(([value, label]) => ({ value, label }));

    return (
        <aside className={`calendar-sidebar${isOpen ? ' cal-sidebar--open' : ''}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-title">Filters</h2>
                <div className="filter-actions">
                    <button
                        className="text-btn"
                        onClick={() => onFilterChange('reset')}
                        title="Reset all filters"
                    >
                        <RotateCcw size={13} /> Reset
                    </button>
                    <button
                        className="text-btn text-btn--clear"
                        onClick={() => onFilterChange('clear')}
                        title="Clear all filters"
                    >
                        <X size={13} /> Clear
                    </button>
                    {/* Mobile close button */}
                    {onClose && (
                        <button
                            className="text-btn cal-sidebar-close-btn"
                            onClick={onClose}
                            aria-label="Close filters"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* Status dropdown */}
            <div className="sidebar-filter-group">
                <MultiSelectDropdown
                    label="Status"
                    options={statusOptions}
                    selected={filters.status}
                    onToggle={(v) => onFilterChange('status', v)}
                />
            </div>

            {/* Event type dropdown */}
            <div className="sidebar-filter-group">
                <MultiSelectDropdown
                    label="Event Type"
                    options={typeOptions}
                    selected={filters.type}
                    onToggle={(v) => onFilterChange('type', v)}
                />
            </div>

            {/* Active filter pills */}
            {(filters.status.length + filters.type.length) > 0 &&
             (filters.status.length < 2 || filters.type.length < typeOptions.length) && (
                <div className="active-filters">
                    <span className="active-filters-label">Active:</span>
                    <div className="active-pills">
                        {filters.status
                            .filter(s => !['upcoming','past'].every(x => filters.status.includes(x)))
                            .map(s => (
                                <span key={s} className="active-pill">
                                    {statusOptions.find(o => o.value === s)?.label}
                                    <button onClick={() => onFilterChange('status', s)} aria-label={`Remove ${s}`}>×</button>
                                </span>
                            ))
                        }
                        {filters.type
                            .filter(() => filters.type.length < typeOptions.length)
                            .map(t => (
                                <span key={t} className={`active-pill pill-type`}>
                                    {typeLabels[t] || t}
                                    <button onClick={() => onFilterChange('type', t)} aria-label={`Remove ${t}`}>×</button>
                                </span>
                            ))
                        }
                    </div>
                </div>
            )}
        </aside>
    );
};

export default CalendarSidebar;
