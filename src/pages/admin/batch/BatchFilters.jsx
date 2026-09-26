export default function BatchFilters({search,setSearch,gradeFilter,setGradeFilter,boardFilter,setBoardFilter,subjectFilter,setSubjectFilter,modeFilter,setModeFilter,statusFilter,setStatusFilter,boards,grades,subjects,modes,onClear}) {
 const grade=grades.find(g=>g.id===gradeFilter);
 const eligibleBoards=boards.filter(b=>gradeFilter==='all'||grade?.boardIds.includes(b.id));
 const eligibleSubjects=subjects.filter(s=>(gradeFilter==='all'||s.gradeIds.includes(gradeFilter))&&(boardFilter==='all'||s.boardId===boardFilter));
 return <div className="board-filters batch-filters"><label><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input type="search" aria-label="Search batches" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search batch name or subject"/></label>
 <select aria-label="Grade" value={gradeFilter} onChange={e=>{setGradeFilter(e.target.value);setBoardFilter('all');setSubjectFilter('all');}}><option value="all">Grade</option>{grades.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>
 <select aria-label="Board" value={boardFilter} onChange={e=>{setBoardFilter(e.target.value);setSubjectFilter('all');}}><option value="all">Board</option>{eligibleBoards.map(b=><option key={b.id} value={b.id}>{b.code}</option>)}</select>
 <select aria-label="Subject" value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)}><option value="all">Subject</option>{eligibleSubjects.map(s=><option key={s.id} value={s.id}>{s.name} · {boards.find(b=>b.id===s.boardId)?.code}</option>)}</select>
 <select aria-label="Mode" value={modeFilter} onChange={e=>setModeFilter(e.target.value)}><option value="all">Mode</option>{modes.map(m=><option key={m}>{m}</option>)}</select>
 <select aria-label="Status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">Status</option><option>Active</option><option>Inactive</option></select>
 {(search||[gradeFilter,boardFilter,subjectFilter,modeFilter,statusFilter].some(v=>v!=='all'))&&<button type="button" onClick={onClear}>Clear filters</button>}</div>;
}
