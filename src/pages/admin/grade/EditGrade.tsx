import { useState } from "react";
import GradeForm from "./GradeForm";

export default function EditGrade({ grade, boards, error, isSaving, onClose, onSave }) {
  const [form, setForm] = useState({
    name: grade.name,
    value: grade.value,
    boardIds: grade.boardIds,
    learningStage: grade.learningStage,
    status: grade.status,
  });

  const submit = (event) => {
    event.preventDefault();
    onSave(grade.id, form);
  };

  return (
    <GradeForm
      title="Edit Grade"
      form={form}
      setForm={setForm}
      boards={boards}
      error={error}
      isSaving={isSaving}
      onClose={onClose}
      onSubmit={submit}
    />
  );
}

