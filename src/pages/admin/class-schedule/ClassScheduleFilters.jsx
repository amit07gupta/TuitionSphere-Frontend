const filterClass = 'schedule-filter-control';

function ClassScheduleFilters({ search, onSearchChange, batches, grades, boards, filters, onFilterChange, onClear }) {
  const filtersActive = search || Object.values(filters).some((value) => value !== 'all');
  const select = (name, label, options) => <select value={filters[name]} onChange={(event) => onFilterChange(name, event.target.value)} aria-label={`Filter by ${label.toLowerCase()}`} className={filterClass}><option value="all">{label}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;

  return <div className="board-filters schedule-filters">
    <label><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg><input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search batch, subject, tutor or topic" aria-label="Search class schedules" className={filterClass} /></label>
    {select('grade', 'Grade', grades)}
    {select('board', 'Board', boards)}
    {select('batch', 'Batch', batches.map((item) => ({ value: item.id, label: item.name })))}
    {select('mode', 'Mode', [{ value: 'Online', label: 'Online' }, { value: 'Offline', label: 'Offline' }])}
    {select('status', 'Status', [{ value: 'Scheduled', label: 'Scheduled' }, { value: 'Completed', label: 'Completed' }, { value: 'Cancelled', label: 'Cancelled' }])}
    {filtersActive && <button type="button" onClick={onClear}>Clear filters</button>}
  </div>;
}

export default ClassScheduleFilters;
