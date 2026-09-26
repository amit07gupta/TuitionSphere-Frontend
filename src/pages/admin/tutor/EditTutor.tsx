import { useState } from "react";
import TutorForm from "./TutorForm";
export default function EditTutor({ tutor, ...props }) { const [form, setForm] = useState({ ...tutor, qualification: tutor.qualification || "", experience: tutor.experience ?? "" }); return <TutorForm {...props} title="Edit Tutor" form={form} setForm={setForm} onSubmit={(event) => { event.preventDefault(); props.onSave(tutor.id, form); }} />; }

