import { createPortal } from "react-dom";
import useAccessibleModal from "../../../hooks/useAccessibleModal";
export default function TutorDetails({tutor,boards,grades,subjects,onClose}) {
 const ref=useAccessibleModal(true,onClose);
 const names=(ids,items,key="name")=>ids.map(id=>items.find(i=>i.id===id)?.[key]||id).join(", ")||"—";
 const entries=[["Employee Code",tutor.employeeCode],["Designation",tutor.designation],["Email",tutor.email],["Phone",tutor.phone],["Qualification",tutor.qualification],["Experience",tutor.experience == null ? "—" : tutor.experience+" years"],["Joining Date",tutor.joinedOn],["Status",tutor.status],["Boards",names(tutor.boardIds,boards,"code")],["Grades",names(tutor.gradeIds,grades)],["Subjects",names(tutor.subjectIds,subjects)],["Streams",tutor.streams.join(", ")],["Teaching Mode",tutor.mode.join(", ")],["Availability",tutor.availability]];
 return createPortal(<div className="tutor-details-backdrop"><section ref={ref} role="dialog" aria-modal="true" aria-labelledby="tutor-details-title" tabIndex={-1} className="tutor-details"><header><div><p>TUTOR DETAILS</p><h2 id="tutor-details-title">{tutor.name}</h2></div><button onClick={onClose} aria-label="Close tutor details">×</button></header><dl>{entries.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||"—"}</dd></div>)}</dl><footer><button onClick={onClose}>Close</button></footer></section></div>,document.body);
}
