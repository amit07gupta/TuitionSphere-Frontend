import { useState } from "react";
import BoardForm from "./BoardForm";

export default function EditBoard({ board, error, isSaving, onClose, onSave }) {
  const [form, setForm] = useState({
    name: board.name,
    code: board.code,
    description: board.description || "",
    status: board.status,
  });

  const submit = (event) => {
    event.preventDefault();
    onSave(board.id, form);
  };

  return (
    <BoardForm
      title="Edit Board"
      form={form}
      setForm={setForm}
      error={error}
      isSaving={isSaving}
      onClose={onClose}
      onSubmit={submit}
    />
  );
}
