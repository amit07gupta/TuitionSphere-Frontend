import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PortalIcon from "../../components/portal/PortalIcon";
import {
  fetchStudentProfile,
  updateStudentProfile,
  updateStudentPhoto,
  submitProfileCorrection,
} from "../../services/studentProfileApi";
import useAccessibleModal from "../../hooks/useAccessibleModal";

const formatDate = (value) => {
  if (!value) return "Not provided";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Not provided";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
const dateValue = (date) =>
  date instanceof Date && !Number.isNaN(date.getTime())
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";
const parseDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && dateValue(date) === value
    ? date
    : null;
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function DetailItem({ label, value, className = "", wrap = false }) {
  return (
    <div
      className={`min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-3 ${className}`}
    >
      <dt className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </dt>
      <dd
        className={`mt-1 text-xs font-semibold text-brand-navy ${wrap ? "whitespace-pre-wrap break-words leading-5" : "truncate"}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function SectionTitle({ icon, eyebrow, title }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 md:px-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-900">
        <PortalIcon name={icon} className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-brand-gold-dark">
          {eyebrow}
        </p>
        <h2 className="font-heading text-base font-semibold text-brand-navy">
          {title}
        </h2>
      </div>
    </div>
  );
}

function Profile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editable, setEditable] = useState({
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",
  });
  const [requestOpen, setRequestOpen] = useState(false);
  const [request, setRequest] = useState({
    field: "Personal information",
    details: "",
  });
  const [requestMessage, setRequestMessage] = useState("");
  const [photoError, setPhotoError] = useState("");
  const photoInputRef = useRef(null);
  const dialogRef = useAccessibleModal(requestOpen, () =>
    setRequestOpen(false),
  );
  const editDialogRef = useAccessibleModal(editOpen, () => setEditOpen(false));

  useEffect(() => {
    let active = true;
    fetchStudentProfile()
      .then((profile) => {
        if (!active) return;
        setStudent(profile);
        setEditable({
          phone: profile.phone || "",
          dateOfBirth: profile.dateOfBirth || "",
          gender: profile.gender || "",
          address: profile.address || "",
          emergencyContact: profile.emergencyContact || "",
        });
        setPageError("");
      })
      .catch((error) => {
        if (active) setPageError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading)
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading your profile…
      </section>
    );

  if (!student) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <PortalIcon
          name="profile"
          className="mx-auto h-10 w-10 text-brand-navy"
        />
        <h1 className="mt-4 font-heading text-2xl font-bold text-brand-navy">
          Student profile not connected
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {pageError ||
            "Log out and sign in again using a registered student email."}
        </p>
      </section>
    );
  }

  const savePersonalDetails = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!parseDate(editable.dateOfBirth)) {
      setPageError("Enter a valid date of birth before saving your profile.");
      return;
    }
    setSaving(true);
    setPageError("");
    try {
      const updated = await updateStudentProfile({
        dateOfBirth: editable.dateOfBirth,
        gender: editable.gender,
        address: editable.address,
        parentPhone: editable.phone,
        emergencyContact: editable.emergencyContact,
      });
      setStudent(updated);
      setEditOpen(false);
      setRequestMessage("Your profile details have been updated.");
      window.dispatchEvent(new Event("tuitionsphere:student-profile-updated"));
    } catch (error) {
      setPageError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadProfilePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPhotoError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Upload a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 130 * 1024) {
      setPhotoError("Profile photo must be 130 KB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const updated = await updateStudentPhoto(reader.result);
        setStudent(updated);
        setRequestMessage("Profile photo updated successfully.");
        window.dispatchEvent(
          new Event("tuitionsphere:student-profile-updated"),
        );
      } catch (error) {
        setPhotoError(error.message);
      }
    };
    reader.onerror = () =>
      setPhotoError("Unable to read the selected image. Please try again.");
    reader.readAsDataURL(file);
  };

  const submitUpdateRequest = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setPageError("");
    try {
      await submitProfileCorrection(request);
      setRequestOpen(false);
      setRequest({ field: "Personal information", details: "" });
      setRequestMessage("Your profile update request has been saved.");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const personalDetails = [
    ["Full Name", student.name],
    ["Student ID", student.studentCode || student.id],
    ["Date of Birth", formatDate(student.dateOfBirth)],
    ["Gender", student.gender || "Not provided"],
    ["Residential Address", student.address || "Not provided"],
  ];
  const academicDetails = [
    ["Grade & Board", `Grade ${student.grade} · ${student.board}`],
    ["Academic Session", student.academicSession || "Not assigned"],
    ["Assigned Batch", student.batch],
    ["Learning Mode", student.learningMode],
  ];
  const guardianDetails = [
    ["Guardian Name", student.parentName],
    ["Mobile Number", `+91 ${student.phone}`],
    ["Alternate Contact Number", student.emergencyContact ? `+91 ${student.emergencyContact}` : "Not provided"],
    ["Email Address", student.email],
  ];
  const profileSummary = [
    ["Grade", student.grade, "bg-sky-100 text-sky-700"],
    ["Board", student.board, "bg-violet-100 text-violet-700"],
    ["Mode", student.learningMode, "bg-emerald-100 text-emerald-700"],
    ["Subjects", student.subjects.length, "bg-amber-100 text-amber-700"],
  ];
  const missingProfileFields = [
    ["Date of birth", student.dateOfBirth],
    ["Gender", student.gender],
    ["Residential address", student.address],
  ]
    .filter(([, value]) => !value)
    .map(([label]) => label);

  return (
    <div className="grid gap-3">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(30,41,59,0.08)]">
        <div className="h-16 bg-[linear-gradient(120deg,#172642_0%,#263e69_58%,#335f8b_100%)] md:h-20" />
        <span
          aria-hidden="true"
          className="absolute right-8 top-0 h-28 w-28 rounded-full border-[24px] border-white/[0.06]"
        />
        <div className="relative px-4 pb-3 md:px-5 md:pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="group relative -mt-9 h-[78px] w-[78px] shrink-0 md:-mt-11 md:h-[88px] md:w-[88px]">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-white bg-brand-gold font-heading text-xl font-black text-brand-navy shadow-[0_10px_28px_rgba(15,23,42,0.2)]">
                  {student.profilePhoto ? (
                    <img
                      src={student.profilePhoto}
                      alt={`${student.name} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(student.name)
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  aria-label="Upload profile photo"
                  title="Upload profile photo"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-navy text-white shadow-lg transition hover:bg-sky-800"
                >
                  <PortalIcon name="camera" className="h-4 w-4" />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={uploadProfilePhoto}
                  className="sr-only"
                />
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-xl font-bold text-brand-navy md:text-2xl">
                    {student.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {student.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {student.studentCode || student.id} · Grade {student.grade}{" "}
                  {student.board} · Joined {formatDate(student.joinedOn)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setPageError("");
                  setEditOpen(true);
                }}
                className="inline-flex min-h-9 items-center justify-center rounded-xl bg-brand-navy px-3.5 text-[11px] font-bold text-white"
              >
                {student.profileStatus === "Incomplete"
                  ? "Complete profile"
                  : "Edit profile"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPageError("");
                  setRequestOpen(true);
                }}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-[11px] font-bold text-brand-navy transition hover:border-brand-gold hover:bg-amber-50"
              >
                Request official correction
                <PortalIcon name="arrow" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {requestMessage && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700"
        >
          <span>✓ {requestMessage}</span>
          <button
            type="button"
            onClick={() => setRequestMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}
      {pageError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700"
        >
          {pageError}
        </div>
      )}
      {photoError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700"
        >
          <span>{photoError}</span>
          <button
            type="button"
            onClick={() => setPhotoError("")}
            aria-label="Dismiss photo error"
          >
            ×
          </button>
        </div>
      )}

      <section
        className="grid grid-cols-2 gap-2.5 lg:grid-cols-4"
        aria-label="Profile summary"
      >
        {profileSummary.map(([label, value, tone]) => (
          <article
            key={label}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black ${tone}`}
            >
              {String(value).slice(0, 2)}
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {label}
              </p>
              <strong className="mt-0.5 block truncate text-xs text-brand-navy">
                {value}
              </strong>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-3 xl:grid-cols-[1fr_320px] xl:items-start">
        <div className="grid gap-3">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionTitle
              icon="profile"
              eyebrow="Student Record"
              title="Personal Information"
            />
            <dl className="grid gap-2.5 p-4 sm:grid-cols-2">
              {personalDetails.map(([label, value]) => (
                <DetailItem
                  key={label}
                  label={label}
                  value={value}
                  className={label === "Residential Address" ? "sm:col-span-2" : ""}
                  wrap={label === "Residential Address"}
                />
              ))}
            </dl>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionTitle
              icon="materials"
              eyebrow="Enrollment"
              title="Academic Information"
            />
            <dl className="grid gap-2.5 p-4 sm:grid-cols-2">
              {academicDetails.map(([label, value]) => (
                <DetailItem key={label} label={label} value={value} />
              ))}
            </dl>
            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">
                Enrolled Subjects
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {student.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[10px] font-bold text-sky-800"
                  >
                    <PortalIcon name="check" className="h-3.5 w-3.5" />{" "}
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="grid gap-3 xl:content-start">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionTitle
              icon="profile"
              eyebrow="Contact Details"
              title="Parent / Guardian"
            />
            <dl className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-1">
              {guardianDetails.map(([label, value]) => (
                <DetailItem key={label} label={label} value={value} />
              ))}
            </dl>
          </section>

          <section className="rounded-2xl bg-[linear-gradient(145deg,#172642,#263e69)] p-4 text-white shadow-[0_14px_32px_rgba(23,38,66,0.18)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-gold">
              <PortalIcon name="check" className="h-5 w-5" />
            </span>
            <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-gold">
              Profile status
            </p>
            <h2 className="mt-1 font-heading text-base font-semibold">
              {student.profileStatus}
            </h2>
            <p className="mt-1.5 text-[11px] leading-5 text-slate-300">
              {student.profileStatus === "Incomplete"
                ? `Pending: ${missingProfileFields.join(", ") || "required personal details"}.`
                : "Your personal, academic and guardian information is available in one secure record."}
            </p>
            <div className="mt-4 border-t border-white/10 pt-3">
              <span className="text-[9px] uppercase tracking-wider text-slate-400">
                Last reviewed
              </span>
              <strong className="mt-0.5 block text-xs text-white">
                {student.profileUpdatedAt
                  ? new Date(student.profileUpdatedAt).toLocaleDateString(
                      "en-IN",
                      { month: "long", year: "numeric" },
                    )
                  : formatDate(student.joinedOn)}
              </strong>
            </div>
          </section>
        </aside>
      </div>
      {editOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditOpen(false);
          }}
        >
          <section
            ref={editDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-contact-title"
            tabIndex="-1"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl outline-none"
          >
            <header className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-brand-gold-dark">
                  Editable information
                </p>
                <h2
                  id="edit-contact-title"
                  className="mt-1 font-heading text-lg font-semibold text-brand-navy"
                >
                  Personal & contact details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Complete the student profile using accurate information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                aria-label="Close edit form"
                className="rounded-lg bg-slate-100 p-2"
              >
                <PortalIcon name="close" className="h-4 w-4" />
              </button>
            </header>
            <form
              onSubmit={savePersonalDetails}
              className="grid gap-4 p-5 sm:grid-cols-2"
            >
              {pageError && (
                <p
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 sm:col-span-2"
                >
                  {pageError}
                </p>
              )}
              <label className="text-xs font-semibold text-slate-600">
                Date of birth
                <DatePicker
                  selected={parseDate(editable.dateOfBirth)}
                  onChange={(date) =>
                    setEditable({ ...editable, dateOfBirth: dateValue(date) })
                  }
                  maxDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  scrollableYearDropdown
                  yearDropdownItemNumber={18}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm"
                  wrapperClassName="w-full"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Gender
                <select
                  value={editable.gender}
                  onChange={(event) =>
                    setEditable({ ...editable, gender: event.target.value })
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Mobile number
                <input
                  required
                  pattern="[0-9]{10}"
                  value={editable.phone}
                  onChange={(event) =>
                    setEditable({
                      ...editable,
                      phone: event.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Alternate contact number
                <input
                  inputMode="numeric"
                  maxLength="10"
                  value={editable.emergencyContact}
                  onChange={(event) =>
                    setEditable({
                      ...editable,
                      emergencyContact: event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    })
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Email address
                <input
                  required
                  type="email"
                  value={student.email}
                  readOnly
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-slate-100 px-3 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Residential address
                <textarea
                  required
                  rows="1"
                  value={editable.address}
                  onChange={(event) =>
                    setEditable({ ...editable, address: event.target.value })
                  }
                  className="mt-2 h-11 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                />
              </label>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save profile"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {requestOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRequestOpen(false);
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-request-title"
            tabIndex="-1"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] outline-none"
          >
            <header className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-brand-gold-dark">
                  Student Support
                </p>
                <h2
                  id="profile-request-title"
                  className="mt-1 font-heading text-lg font-semibold text-brand-navy"
                >
                  Request profile update
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Administration will verify the requested correction before
                  updating the record.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRequestOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
                aria-label="Close request form"
              >
                <PortalIcon name="close" className="h-4 w-4" />
              </button>
            </header>
            <form onSubmit={submitUpdateRequest} className="p-5">
              {pageError && (
                <p
                  role="alert"
                  className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700"
                >
                  {pageError}
                </p>
              )}
              <label className="text-xs font-semibold text-slate-600">
                Information to update
                <select
                  value={request.field}
                  onChange={(event) =>
                    setRequest({ ...request, field: event.target.value })
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-gold"
                >
                  <option>Contact information</option>
                  <option>Personal information</option>
                  <option>Guardian information</option>
                  <option>Academic information</option>
                  <option>Other correction</option>
                </select>
              </label>
              <label className="mt-4 block text-xs font-semibold text-slate-600">
                Requested correction
                <textarea
                  required
                  minLength="10"
                  maxLength="500"
                  rows="4"
                  value={request.details}
                  onChange={(event) =>
                    setRequest({ ...request, details: event.target.value })
                  }
                  placeholder="Explain what information should be corrected..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-300 p-3 text-sm font-normal outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10"
                />
                <span className="mt-1 block text-right text-[9px] text-slate-400">
                  {request.details.length}/500
                </span>
              </label>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRequestOpen(false)}
                  className="min-h-10 rounded-xl border border-slate-300 px-4 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-10 rounded-xl bg-brand-navy px-4 text-xs font-bold text-white disabled:opacity-50"
                >
                  {saving ? "Sending…" : "Send request"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Profile;
