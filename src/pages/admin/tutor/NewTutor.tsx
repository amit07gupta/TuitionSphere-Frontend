import { useState } from "react";
import TutorForm, { emptyTutorForm } from "./TutorForm";
export default function NewTutor(props) { const [form, setForm] = useState(emptyTutorForm); return <TutorForm {...props} title="Add Tutor" form={form} setForm={setForm} onSubmit={(event) => { event.preventDefault(); props.onSave(form); }} />; }

