import { useState } from "react";
import SubjectForm from "./SubjectForm";
export default function EditSubject({ subject, ...props }) {
  const [form, setForm] = useState({ name: subject.name, code: subject.code, boardId: subject.boardId, gradeIds: subject.gradeIds, streams: subject.streams || [], status: subject.status });
  return <SubjectForm {...props} title="Edit Subject" form={form} setForm={setForm} onSubmit={(event) => { event.preventDefault(); props.onSave(subject.id, form); }} />;
}

