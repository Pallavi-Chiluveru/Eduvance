import { useMemo, useState } from 'react';

const DAY_MS = 86400000;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const formatKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const levelFor = (count) => count >= 4 ? 4 : count;
const activityLabel = (type) => ({ lecture_view: 'lesson viewed', quiz_submit: 'quiz attempted', practice: 'practice activity', login: 'login' }[type] || 'learning activity');

function buildHeatmap(activities) {
    const records = new Map();
    (activities || []).forEach((record) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(record?.dateString || '')) return;
        const entries = Array.isArray(record.activities) ? record.activities : [];
        entries.forEach((entry) => {
            const timestamp = new Date(entry.timestamp);
            const key = Number.isNaN(timestamp.getTime()) ? record.dateString : formatKey(timestamp);
            const existing = records.get(key) || [];
            records.set(key, existing.concat(entry));
        });
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rangeStart = new Date(today);
    rangeStart.setDate(today.getDate() - 180);
    const gridStart = new Date(rangeStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    const weeks = [];
    let cursor = new Date(gridStart);
    while (cursor <= today) {
        const week = [];
        for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
            const date = new Date(cursor);
            const inRange = date >= rangeStart && date <= today;
            const key = formatKey(date);
            week.push(inRange ? { date, key, entries: records.get(key) || [] } : null);
            cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);
    }

    const months = [];
    weeks.forEach((week, index) => {
        const firstVisible = week.find(Boolean);
        if (!firstVisible) return;
        const month = firstVisible.date.toLocaleDateString(undefined, { month: 'short' });
        if (!months.length || months[months.length - 1].label !== month) months.push({ label: month, column: index + 1 });
    });
    const hasActivity = weeks.some((week) => week.some((day) => day?.entries.length));
    return { weeks, months, hasActivity };
}

export default function ActivityHeatmap({ activities = [] }) {
    const { weeks, months, hasActivity } = useMemo(() => buildHeatmap(activities), [activities]);
    const [tooltip, setTooltip] = useState(null);

    const showTooltip = (event, day) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = 230;
        const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 12);
        const showBelow = rect.top < 130;
        setTooltip({ day, left, top: showBelow ? rect.bottom + 9 : rect.top - 9, below: showBelow });
    };

    return (
        <div className="journey-heatmap-wrap">
            <div className="journey-heatmap-scroll custom-scrollbar">
                <div className="journey-heatmap" style={{ '--heatmap-weeks': weeks.length }}>
                    <div className="journey-heatmap-months">
                        {months.map((month) => <span key={`${month.label}-${month.column}`} style={{ gridColumn: month.column }}>{month.label}</span>)}
                    </div>
                    <div className="journey-heatmap-body">
                        <div className="journey-weekdays">{DAY_LABELS.map((label, index) => <span key={label}>{index % 2 ? label : ''}</span>)}</div>
                        <div className="journey-heatmap-grid">
                            {weeks.map((week, weekIndex) => week.map((day, dayIndex) => day ? (
                                <button
                                    type="button"
                                    key={day.key}
                                    className={`journey-heatmap-day level-${levelFor(day.entries.length)}`}
                                    aria-label={`${day.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}: ${day.entries.length || 'no'} learning ${day.entries.length === 1 ? 'activity' : 'activities'}`}
                                    onPointerEnter={(event) => showTooltip(event, day)}
                                    onPointerLeave={() => setTooltip(null)}
                                    onFocus={(event) => showTooltip(event, day)}
                                    onBlur={() => setTooltip(null)}
                                    style={{ gridColumn: weekIndex + 1, gridRow: dayIndex + 1 }}
                                />
                            ) : <span key={`empty-${weekIndex}-${dayIndex}`} className="journey-heatmap-placeholder" style={{ gridColumn: weekIndex + 1, gridRow: dayIndex + 1 }} />))}
                        </div>
                    </div>
                </div>
            </div>
            {tooltip && (
                <div
                    className={`journey-heatmap-tooltip ${tooltip.below ? 'is-below' : ''}`}
                    style={{ left: tooltip.left, top: tooltip.top }}
                    role="tooltip"
                >
                    <strong>{tooltip.day.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                    <span>{tooltip.day.entries.length ? `${tooltip.day.entries.length} learning ${tooltip.day.entries.length === 1 ? 'activity' : 'activities'}` : 'No learning activity'}</span>
                    {tooltip.day.entries.length > 0 && (
                        <ul>
                            {Object.entries(tooltip.day.entries.reduce((counts, entry) => {
                                const label = activityLabel(entry.type);
                                counts[label] = (counts[label] || 0) + 1;
                                return counts;
                            }, {})).map(([label, count]) => <li key={label}>{count} {label}{count === 1 ? '' : 's'}</li>)}
                        </ul>
                    )}
                </div>
            )}
            <div className="journey-heatmap-footer">
                <span>Past 6 months</span>
                <div className="journey-heatmap-legend" aria-label="Activity intensity from less to more">
                    <span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} className={`level-${level}`} />)}<span>More</span>
                </div>
            </div>
            {!hasActivity && <p className="journey-heatmap-empty">No learning activity recorded yet. Start learning to build your streak!</p>}
        </div>
    );
}
