import { useId, useState } from "react";
export default function SearchableSelection({
  label,
  items,
  selected,
  onToggle,
  getLabel,
  emptyText = "No options available.",
}) {
  const [search, setSearch] = useState("");
  const id = useId();
  const visible = items.filter((item) =>
    getLabel(item).toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <fieldset className="tutor-selection sm:col-span-2">
      <legend>
        {label} <span>{selected.length} selected</span>
      </legend>
      <input
        type="search"
        aria-label={"Search " + label}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={"Search " + label.toLowerCase()}
      />
      <div className="tutor-selection-list">
        {visible.map((item) => (
          <label key={item.id} htmlFor={id + item.id}>
            <input
              id={id + item.id}
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={(e) => onToggle(item.id, e.target.checked)}
            />
            <span>{getLabel(item)}</span>
          </label>
        ))}
        {!visible.length && (
          <p>{items.length ? "No matching options." : emptyText}</p>
        )}
      </div>
    </fieldset>
  );
}
