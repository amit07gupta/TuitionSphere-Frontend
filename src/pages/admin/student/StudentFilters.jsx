function StudentFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedGrade,
  onGradeChange,
  selectedBoard,
  onBoardChange,
  statusOptions,
  gradeOptions,
  boardOptions,
  filtersActive,
  onClear,
}) {
  return <div className="board-filters student-filter-bar">
    <label>
      <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
      <input type="search" aria-label="Search students" value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search student, parent or phone" />
    </label>
    <select value={selectedStatus} onChange={(event) => onStatusChange(event.target.value)} aria-label="Filter students by status">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
    <select value={selectedGrade} onChange={(event) => onGradeChange(event.target.value)} aria-label="Filter students by grade">{gradeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
    <select value={selectedBoard} onChange={(event) => onBoardChange(event.target.value)} aria-label="Filter students by board">{boardOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
    {filtersActive && <button type="button" onClick={onClear}>Clear filters</button>}
  </div>;
}

export default StudentFilters;
