import { useState } from "react";
import SubjectForm, { emptySubjectForm } from "./SubjectForm";
export default function NewSubject(props) {
  const [form, setForm] = useState(emptySubjectForm);
  return <SubjectForm {...props} title="Add Subject" form={form} setForm={setForm} onSubmit={(event) => { event.preventDefault(); props.onSave(form); }} />;
}

