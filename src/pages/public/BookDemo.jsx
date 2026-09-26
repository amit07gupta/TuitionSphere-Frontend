import { useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import useDemoSetup from "../../hooks/useDemoSetup";
import { createDemoRequest } from "../../services/demoRequestApi";

const fieldClass =
  "h-12 w-full rounded-xl border border-slate-300 bg-slate-50/70 px-4 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/15 disabled:cursor-not-allowed disabled:bg-slate-100";
const labelClass = "flex flex-col gap-2 text-sm font-semibold text-[#34415a]";
const namePattern = /^[A-Za-z.' -]+$/;

const initialValues = {
  studentName: "",
  parentName: "",
  email: "",
  phone: "",
  grade: "",
  board: "",
  stream: "",
  demoDate: "",
  demoSlotKey: "",
  consent: false,
};

function toDateValue(date) {
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fromDateValue(value) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function validate(values) {
  const errors = {};

  if (!values.studentName.trim()) errors.studentName = "Student name is required.";
  else if (values.studentName.trim().length < 2) errors.studentName = "Enter at least 2 characters.";
  else if (!namePattern.test(values.studentName.trim())) errors.studentName = "Use letters only.";

  if (!values.parentName.trim()) errors.parentName = "Parent name is required.";
  else if (values.parentName.trim().length < 2) errors.parentName = "Enter at least 2 characters.";
  else if (!namePattern.test(values.parentName.trim())) errors.parentName = "Use letters only.";

  if (!values.email.trim()) errors.email = "Email address is required.";
  else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!/^[6-9]\d{9}$/.test(values.phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (!values.grade) errors.grade = "Select the student grade.";
  if (!values.board) errors.board = "Select the education board.";
  if (Number(values.grade) >= 11 && !values.stream) errors.stream = "Select the student stream.";
  if (!values.demoDate) errors.demoDate = "Select a preferred date.";
  else if (values.demoDate < toDateValue(new Date())) errors.demoDate = "Select today or a future date.";
  if (!values.demoSlotKey) errors.demoSlotKey = "Select an available demo slot.";
  if (!values.consent) errors.consent = "Please accept the contact consent.";

  return errors;
}

function uniqueById(records) {
  return Array.from(new Map(records.filter(Boolean).map((record) => [record.id, record])).values());
}

function BookDemo() {
  const demoSetups = useDemoSetup(true);
  const navigate = useNavigate();
  const formRef = useRef(null);
  const submittingRef = useRef(false);
  const [params] = useSearchParams();
  const [values, setValues] = useState({
    ...initialValues,
    grade: params.get("grade") ?? params.get("class") ?? "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const configuredGrades = Array.from(demoSetups.reduce((records, setup) => {
    if (!setup.grade) return records;
    const existing = records.get(setup.grade.id);
    records.set(setup.grade.id, {
      ...setup.grade,
      boardIds: [...new Set([...(existing?.boardIds || []), ...(setup.boardIds || [])])],
    });
    return records;
  }, new Map()).values());
  const configuredBoards = uniqueById(demoSetups.flatMap((setup) => setup.boardRecords || []));
  const grades = configuredGrades.sort((first, second) => Number(first.value) - Number(second.value));
  const boards = configuredBoards;
  const gradeRecord = grades.find((grade) => String(grade.value) === values.grade);
  const boardRecord = boards.find((board) => board.code === values.board);
  const availableBoards = gradeRecord
    ? uniqueById(
      demoSetups
        .filter((setup) => setup.gradeId === gradeRecord.id || setup.gradeIds?.includes(gradeRecord.id))
        .flatMap((setup) => setup.boardRecords || []),
    )
    : boards;
  const needsStream = Number(values.grade) >= 11;
  const matchingSetups = demoSetups.filter((setup) => gradeRecord && boardRecord
    && (setup.gradeId === gradeRecord.id || setup.gradeIds?.includes(gradeRecord.id))
    && setup.boardIds?.includes(boardRecord.id)
    && (!needsStream || setup.stream === values.stream || setup.streams?.includes(values.stream))
    && (setup.demoEndDate || setup.bookingEndDate) >= toDateValue(new Date()));
  const selectedDateSetups = matchingSetups.filter((setup) => values.demoDate
    && values.demoDate >= (setup.demoStartDate || setup.bookingStartDate)
    && values.demoDate <= (setup.demoEndDate || setup.bookingEndDate)
    && setup.availableDays?.includes(fromDateValue(values.demoDate)?.toLocaleDateString("en-US", { weekday: "long" })));
  const availableSlots = selectedDateSetups.flatMap((setup) => {
    const slots = setup.timeSlots?.length
      ? setup.timeSlots
      : [{ id: "SLOT-1", startTime: setup.startTime, endTime: setup.endTime, capacity: setup.capacity }];
    return slots.map((slot) => {
      return { setup, slot, remaining: Number(slot.capacity || 1) };
    }).filter(({ remaining }) => remaining > 0);
  });
  const minimumDate = new Date();
  minimumDate.setHours(0, 0, 0, 0);
  const maximumDate = matchingSetups.length
    ? new Date(`${matchingSetups.reduce((latest, setup) => (setup.demoEndDate || setup.bookingEndDate) > latest ? (setup.demoEndDate || setup.bookingEndDate) : latest, matchingSetups[0].demoEndDate || matchingSetups[0].bookingEndDate)}T00:00:00`)
    : new Date(minimumDate.getFullYear(), minimumDate.getMonth(), minimumDate.getDate() + 30);
  const isAvailableDate = (date) => {
    const value = toDateValue(date);
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    return matchingSetups.some((setup) => value >= (setup.demoStartDate || setup.bookingStartDate)
      && value <= (setup.demoEndDate || setup.bookingEndDate)
      && setup.availableDays?.includes(weekday));
  };

  const update = (name, value) => {
    setValues((current) => {
      if (name === "grade") {
        return { ...current, grade: value, board: "", stream: "", demoDate: "", demoSlotKey: "" };
      }
      if (name === "board") {
        return { ...current, board: value, stream: "", demoDate: "", demoSlotKey: "" };
      }
      if (name === "stream") return { ...current, stream: value, demoDate: "", demoSlotKey: "" };
      if (name === "demoDate") return { ...current, demoDate: value, demoSlotKey: "" };
      return { ...current, [name]: value };
    });

    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const firstInvalidField = Object.keys(nextErrors)[0];
      window.requestAnimationFrame(() => {
        formRef.current?.querySelector(`[name="${firstInvalidField}"]`)?.focus();
      });
      return;
    }

    const selectedSlot = availableSlots.find(({ setup, slot }) => `${setup.id}::${slot.id}` === values.demoSlotKey);
    if (!selectedSlot) return;
    const { setup: selectedSetup, slot } = selectedSlot;
    const normalizedEmail = values.email.trim().toLowerCase();
    submittingRef.current = true;
    setSubmitting(true);
    setFormError("");

    try {
      await createDemoRequest({
        studentName: values.studentName.trim(),
        parentName: values.parentName.trim(),
        email: normalizedEmail,
        phone: values.phone,
        demoDate: values.demoDate,
        demoSetupId: selectedSetup.id,
        demoSlotId: slot.id,
        gradeId: gradeRecord.id,
        boardId: boardRecord.id,
        stream: values.stream || null,
      });

      navigate("/thank-you?type=demo");
    } catch (error) {
      setFormError(error.message);
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[calc(100svh-64px)] bg-[radial-gradient(circle_at_15%_10%,rgba(45,66,112,0.1),transparent_26%),radial-gradient(circle_at_90%_15%,rgba(232,163,61,0.16),transparent_25%),#f7f8fb] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold-dark">
            Personalised Academic Guidance
          </p>
          <h1 className="mt-2 font-heading text-[30px] font-bold tracking-[-0.035em] text-brand-navy md:text-[40px]">
            Schedule your free demo
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#68758c]">
            Fill in a few details and our team will confirm your demo slot on WhatsApp.
          </p>
        </header>

        <form
          ref={formRef}
          noValidate
          onSubmit={submit}
          className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(27,42,74,0.12)]"
        >
          <div className="grid gap-6 px-5 py-6 md:px-8 md:py-7">
            <section>
              <SectionTitle number="01" title="Student details" text="Basic information required to contact you." />
              <div className="grid gap-4">
                <TextField
                  name="studentName"
                  label="Student Name"
                  value={values.studentName}
                  onChange={(event) => update("studentName", event.target.value)}
                  placeholder="Enter student name"
                  error={errors.studentName}
                />

                <TextField
                  name="parentName"
                  label="Parent / Guardian Name"
                  value={values.parentName}
                  onChange={(event) => update("parentName", event.target.value)}
                  placeholder="Enter parent or guardian name"
                  error={errors.parentName}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    <span>Email Address <RequiredMark /></span>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={(event) => update("email", event.target.value)}
                      placeholder="Enter your email"
                      className={`${fieldClass} ${errors.email ? "border-red-400 ring-4 ring-red-100" : ""}`}
                    />
                    <FieldError message={errors.email} />
                  </label>

                  <label className={labelClass}>
                    <span>Phone Number <RequiredMark /></span>
                    <span
                      className={`flex h-12 overflow-hidden rounded-xl border bg-slate-50/70 focus-within:ring-4 focus-within:ring-brand-gold/15 ${
                        errors.phone ? "border-red-400 ring-4 ring-red-100" : "border-slate-300"
                      }`}
                    >
                      <span className="flex items-center border-r border-slate-300 bg-brand-cream px-3 font-semibold text-brand-navy">
                        +91
                      </span>
                      <input
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength="10"
                        value={values.phone}
                        onChange={(event) => update("phone", event.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit mobile number"
                        className="min-w-0 flex-1 bg-transparent px-3 font-normal outline-none"
                      />
                    </span>
                    <FieldError message={errors.phone} />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    name="grade"
                    label="Grade"
                    value={values.grade}
                    onChange={(event) => update("grade", event.target.value)}
                    error={errors.grade}
                  >
                    <option value="">Select grade</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={String(grade.value)}>
                        {grade.name}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    name="board"
                    label="Board"
                    value={values.board}
                    onChange={(event) => update("board", event.target.value)}
                    disabled={!values.grade}
                    error={errors.board}
                  >
                    <option value="">{values.grade ? "Select board" : "Select grade first"}</option>
                    {availableBoards.map((board) => (
                      <option key={board.id} value={board.code}>
                        {board.code}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </div>
            </section>

            <section>
              <div className="grid gap-4">
                {needsStream && (
                  <SelectField
                    name="stream"
                    label="Stream"
                    value={values.stream}
                    onChange={(event) => update("stream", event.target.value)}
                    disabled={!values.board}
                    error={errors.stream}
                  >
                    <option value="">{values.board ? "Select stream" : "Select board first"}</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                  </SelectField>
                )}

                <label className={labelClass}>
                  <span>Preferred Demo Date <RequiredMark /></span>
                  <input type="hidden" name="demoDate" value={values.demoDate} />
                  <DatePicker
                    selected={fromDateValue(values.demoDate)}
                    onChange={(date) => update("demoDate", toDateValue(date))}
                    minDate={minimumDate}
                    maxDate={maximumDate}
                    filterDate={isAvailableDate}
                    disabled={!matchingSetups.length}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    className={`${fieldClass} ${errors.demoDate ? "border-red-400 ring-4 ring-red-100" : ""}`}
                    wrapperClassName="w-full"
                  />
                  <FieldError message={errors.demoDate} />
                </label>

                <SelectField
                  name="demoSlotKey"
                  label="Available Demo Slot"
                  value={values.demoSlotKey}
                  onChange={(event) => update("demoSlotKey", event.target.value)}
                  disabled={!values.demoDate || !availableSlots.length}
                  error={errors.demoSlotKey}
                >
                  <option value="">
                    {!values.demoDate ? "Select date first" : availableSlots.length ? "Select available slot" : "No matching slot available"}
                  </option>
                  {availableSlots.map(({ setup, slot, remaining }) => (
                    <option key={`${setup.id}-${slot.id}`} value={`${setup.id}::${slot.id}`}>
                      {slot.startTime}–{slot.endTime} · {setup.mode} · {remaining} seat{remaining === 1 ? "" : "s"} left
                    </option>
                  ))}
                </SelectField>
              </div>
            </section>
          </div>

          <footer className="border-t border-slate-200 bg-slate-50 px-5 py-5 md:px-8">
            {formError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                {formError}
              </div>
            )}
            <label
              className={`flex items-start gap-3 rounded-xl border bg-white p-3 text-xs leading-5 text-slate-600 ${
                errors.consent ? "border-red-400 ring-4 ring-red-100" : "border-slate-200"
              }`}
            >
              <input
                name="consent"
                type="checkbox"
                checked={values.consent}
                onChange={(event) => update("consent", event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand-navy"
              />
              <span>
                I agree to be contacted on WhatsApp regarding demo scheduling and course information.
                <FieldError message={errors.consent} />
              </span>
            </label>

            <div className="mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-brand-navy px-7 text-base font-bold text-white shadow-[0_10px_24px_rgba(27,42,74,0.2)] transition hover:-translate-y-0.5 hover:bg-[#24385f] hover:shadow-[0_14px_30px_rgba(27,42,74,0.25)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold text-brand-navy transition group-hover:translate-x-0.5">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                )}
                {submitting ? "Submitting…" : "Schedule My Free Demo"}
              </button>

              <p className="mt-3 text-center text-[11px] text-slate-500">
                Free demo · No payment commitment · Confirmation within one working day
              </p>
            </div>
          </footer>
        </form>
      </div>
    </section>
  );
}

function SectionTitle({ number, title, text }) {
  return (
    <header className="mb-5 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-xs font-bold text-brand-gold">
        {number}
      </span>
      <div>
        <h2 className="font-heading text-lg font-semibold text-brand-navy">{title}</h2>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">{text}</p>
      </div>
    </header>
  );
}

function FieldError({ message }) {
  return message ? (
    <span className="mt-1 block text-xs font-medium text-red-600" role="alert">
      {message}
    </span>
  ) : null;
}

function RequiredMark() {
  return (
    <span className="text-red-500" aria-hidden="true">
      *
    </span>
  );
}

function TextField({ name, label, value, onChange, placeholder, error }) {
  return (
    <label className={labelClass}>
      <span>{label} <RequiredMark /></span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${fieldClass} ${error ? "border-red-400 ring-4 ring-red-100" : ""}`}
      />
      <FieldError message={error} />
    </label>
  );
}

function SelectField({ name, label, value, onChange, disabled = false, error, children }) {
  return (
    <label className={labelClass}>
      <span>{label} <RequiredMark /></span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${fieldClass} ${error ? "border-red-400 ring-4 ring-red-100" : ""}`}
      >
        {children}
      </select>
      <FieldError message={error} />
    </label>
  );
}

export default BookDemo;
