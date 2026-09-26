export default function DemoSetupFilters({grades,boards,tutors,values,onChange,onClear}) {
 const eligibleBoards=boards.filter(b=>!values.grade||grades.find(g=>g.id===values.grade)?.boardIds.includes(b.id));
 const eligibleTutors=tutors.filter(t=>(!values.grade||t.gradeIds.includes(values.grade))&&(!values.board||t.boardIds.includes(values.board))&&(!values.mode||!t.mode.length||t.mode.includes(values.mode)));
 return <div className="board-filters demo-filters"><label><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input type="search" aria-label="Search demo setups" placeholder="Search setup name" value={values.search} onChange={e=>onChange('search',e.target.value)}/></label>
 {[['grade','Grade',grades.map(g=>[g.id,g.name])],['board','Board',eligibleBoards.map(b=>[b.id,b.code])],['tutor','Tutor',eligibleTutors.map(t=>[t.id,t.name])],['mode','Mode',[['Online','Online'],['Offline','Offline']]],['status','Status',[['Active','Active'],['Inactive','Inactive']]]].map(([key,label,options])=><select key={key} aria-label={label} value={values[key]} onChange={e=>onChange(key,e.target.value)}><option value="">{label}</option>{options.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select>)}
 {Object.values(values).some(Boolean)&&<button type="button" onClick={onClear}>Clear filters</button>}</div>;
}
