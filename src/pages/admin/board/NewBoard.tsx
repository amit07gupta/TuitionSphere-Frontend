import { useState } from "react";
import BoardForm, { emptyBoardForm } from "./BoardForm";

export default function NewBoard({ error, isSaving, onClose, onSave }) {
  const [form, setForm] = useState(emptyBoardForm);

  const submit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <BoardForm
      title="Add Board"
      form={form}
      setForm={setForm}
      error={error}
      isSaving={isSaving}
      onClose={onClose}
      onSubmit={submit}
    />
  );
}

