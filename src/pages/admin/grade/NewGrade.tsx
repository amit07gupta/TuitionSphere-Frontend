import { useState } from "react";
import GradeForm, { emptyGradeForm } from "./GradeForm";

export default function NewGrade({ boards, error, isSaving, onClose, onSave }) {
  const [form, setForm] = useState({
    ...emptyGradeForm,
    boardIds: boards.map((board) => board.id),
  });

  const submit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <GradeForm
      title="Add Grade"
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

