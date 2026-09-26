# TuitionSphere localStorage reference

This document describes browser `localStorage` used by the current frontend. Every value in `localStorage` is physically stored as a string. Values marked `JSON array` must be written with `JSON.stringify(array)` and read with `JSON.parse(value)`.

## UI preferences

| Key                           | Value                                     | Purpose                                                                                          |
| ----------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `tuitionsphere_admin_theme`   | `"light"`, `"dark"`, or legacy `"system"` | Shared Admin/Tutor theme on the current browser. Current profile UI exposes Light and Dark only. |
| `tuitionsphere_admin_sidebar` | `"collapsed"` or `"expanded"`             | Admin sidebar state.                                                                             |
| `tuitionsphere_tutor_sidebar` | `"collapsed"` or `"expanded"`             | Tutor sidebar state.                                                                             |
| `tuitionsphere_read_notices`  | JSON array of notice IDs                  | Notices read by the student in this browser. Example: `["notice-id-1"]`.                         |

## Academic and operational data

| Key                                | Value type | Main fields in each record                                                                                                                                               |
| ---------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tuitionsphere_academic_sessions`  | JSON array | `id`, `name`, `startDate`, `endDate`, `status`                                                                                                                           |
| `tuitionsphere_boards`             | JSON array | `id`, `name`, `code`, `status`                                                                                                                                           |
| `tuitionsphere_grades`             | JSON array | `id`, `name`/`gradeName`, `value`, `numericValue`, `boardIds`, `status`                                                                                                  |
| `tuitionsphere_subjects`           | JSON array | `id`, `name`, `code`, `gradeIds`, `boardId`, `streams`, `status`                                                                                                         |
| `tuitionsphere_admin_tutors`       | JSON array | `id`, `name`, `email`, `phone`, `employeeCode`, `gradeIds`, `boardIds`, `subjectIds`, `modes`, `streams`, `status`                                                       |
| `tuitionsphere_admin_programs`     | JSON array | `id`, `name`, `grades`, `boards`, `subjects`, `status`, `description`                                                                                                    |
| `tuitionsphere_admin_batches`      | JSON array | `id`, `academicSessionId`, `name`, `gradeId`, `grade`, `boardId`, `board`, `stream`, `subjectIds`, `subjects`, `tutorAssignments`, `mode`, `capacity`, `status`          |
| `tuitionsphere_fee_plans`          | JSON array | `id`, `name`, `academicSessionId`, `gradeId`, `admissionFee`, `tuitionFee`, `billingFrequency`, `installments`, `dueDay`, `lateFee`, `gracePeriodDays`, `status`         |
| `tuitionsphere_demo_setup`         | JSON array | `id`, academic session/grade/board/tutor references, date range, weekdays, slots, mode, capacity, `status`                                                               |
| `tuitionsphere_published_schedule` | JSON array | `id`, `batchId`, `subject`, `tutorId`, `scheduleType`, `date` or `startDate`/`endDate`, `repeatDays`, `startTime`, `endTime`, `mode`, `location`, `meetingUrl`, `status` |

Example academic session:

```json
[
  {
    "id": "session-id",
    "name": "2026-2027",
    "startDate": "2026-04-01",
    "endDate": "2027-03-31",
    "status": "Active"
  }
]
```

Example batch:

```json
[
  {
    "id": "batch-id",
    "academicSessionId": "session-id",
    "name": "Batch 1",
    "gradeId": "grade-id",
    "grade": "8",
    "boardId": "board-id",
    "board": "CBSE",
    "stream": "",
    "subjectIds": ["subject-id"],
    "subjects": ["Mathematics"],
    "tutorAssignments": [{ "subjectId": "subject-id", "tutorId": "tutor-id" }],
    "mode": "Offline",
    "capacity": 20,
    "status": "Active"
  }
]
```

Example schedule:

```json
[
  {
    "id": "schedule-id",
    "batchId": "batch-id",
    "subject": "Mathematics",
    "tutorId": "tutor-id",
    "scheduleType": "Recurring",
    "startDate": "2026-09-01",
    "endDate": "2026-09-30",
    "repeatDays": ["monday", "wednesday"],
    "startTime": "16:00",
    "endTime": "17:00",
    "mode": "Offline",
    "location": "Room A-3",
    "meetingUrl": "",
    "status": "Scheduled"
  }
]
```

## Leads, admissions, and students

| Key                              | Value type | Main fields in each record                                                                                                                                               |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tuitionsphere_leads`            | JSON array | `id`, `type`, `source`, `studentName`/`name`, `parentName`, `phone`, `email`, `grade`, `board`, `status`, scheduling/follow-up fields, `createdAt`, `updatedAt`          |
| `tuitionsphere_lead_responses`   | JSON array | `id`, `token`, `leadId`, `type`, `status`, `response`, `message`, `createdAt`, `answeredAt`                                                                              |
| `tuitionsphere_admissions`       | JSON array | `id`, `leadId`, `candidateStudentId`, student/contact fields, `academicSessionId`, `stage`, `admissionStatus`, `documents`, `allocation`, `feeSetup`, timestamps         |
| `tuitionsphere_students`         | JSON array | `id`, `admissionId`, profile/contact fields, `gradeId`, `grade`, `boardId`, `board`, `batchId`, `batch`, subjects, `learningMode`, `profileStatus`, `status`, `joinedOn` |
| `tuitionsphere_enrollments`      | JSON array | `id`, `admissionId`, `studentId`, `batchId`, `academicSessionId`, `academicSessionName`, `grade`, `board`, `enrolledOn`, `status`                                        |
| `tuitionsphere_profile_requests` | JSON array | `id`, `studentId`, `field`, `details`, `status`                                                                                                                          |

Example enrollment:

```json
[
  {
    "id": "ENR-001",
    "admissionId": "admission-id",
    "studentId": "student-id",
    "batchId": "batch-id",
    "academicSessionId": "session-id",
    "academicSessionName": "2026-2027",
    "grade": "8",
    "board": "CBSE",
    "enrolledOn": "2026-09-15",
    "status": "Active"
  }
]
```

## Fees, attendance, assignments, and communication

| Key                                    | Value type | Main fields in each record                                                                                                                                                                     |
| -------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tuitionsphere_fee_records`            | JSON array | `id`, `admissionId`, `studentId`, student/session/plan references, `installment`, `amount`, `discount`, `dueDate`, `gracePeriodDays`, `lateFee`, `paidOn`, `method`, `transactionId`, `status` |
| `tuitionsphere_attendance_records`     | JSON array | `id`, `studentId`, `studentName`, `batchId`, `classId`, `date`, `subject`, `topic`, `startTime`, `endTime`, `status`, optional `leaveRequestId`                                                |
| `tuitionsphere_leave_requests`         | JSON array | `id`, `studentId`, `studentName`, `batchId`, `grade`, `board`, `fromDate`, `toDate`, `reason`, `affectedSessions`, `status`, `rejectionReason`, timestamps                                     |
| `tuitionsphere_assignments`            | JSON array | Assignment records; normally `id`, `title`, batch/subject/tutor references, `instructions`, `dueDate`, `totalMarks`, attachment fields, `status`, timestamps                                   |
| `tuitionsphere_assignment_submissions` | JSON array | Submission records; normally `id`, `assignmentId`, `studentId`, file/content fields, `submittedAt`, `marks`, `feedback`, review status                                                         |
| `tuitionsphere_notices`                | JSON array | `id`, `title`, `message`/`description`, audience fields, `publishDate`, `expiryDate`, `status`, timestamps                                                                                     |
| `tuitionsphere_portal_notifications`   | JSON array | `id`, `studentId`, `title`, `message`, `type`, `status`, `createdAt`                                                                                                                           |
| `tuitionsphere_reviews`                | JSON array | `id`, `studentId`, `reviewType`, `targetId`, rating/comment fields, `submittedByRole`, `publicConsent`, `status`, `rejectionReason`, timestamps                                                |

Example attendance record:

```json
[
  {
    "id": "ATT-001",
    "studentId": "student-id",
    "studentName": "Student Name",
    "batchId": "batch-id",
    "classId": "schedule-id",
    "date": "2026-09-15",
    "subject": "Mathematics",
    "topic": "Algebra",
    "startTime": "16:00",
    "endTime": "17:00",
    "status": "Present"
  }
]
```

Example portal notification:

```json
[
  {
    "id": "NTF-001",
    "studentId": "student-id",
    "title": "Batch updated",
    "message": "You have been transferred to Batch 2.",
    "type": "schedule",
    "status": "Unread",
    "createdAt": "2026-09-15T10:00:00.000Z"
  }
]
```

## Legacy authentication data

| Key                         | Value type | Main fields                                                                                            |
| --------------------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| `tuitionsphere_admin_users` | JSON array | `id`, `name`, `email`, `phone`, `role`, `status`, legacy `password`, `mustChangePassword`, `createdAt` |

This key belongs to the old browser-only login implementation. Do not store real passwords or authentication tokens in `localStorage`. Current authentication should use the backend database, hashed passwords, and the existing authenticated API flow.

## Reading and writing values

```js
// Read one JSON array
const batches = JSON.parse(
  localStorage.getItem("tuitionsphere_admin_batches") || "[]",
);

// Save one JSON array
localStorage.setItem("tuitionsphere_admin_batches", JSON.stringify(batches));

// Read a plain string preference
const theme = localStorage.getItem("tuitionsphere_admin_theme") || "light";
```

To inspect all TuitionSphere values in the current browser, run this in DevTools Console:

```js
Object.fromEntries(
  Object.keys(localStorage)
    .filter((key) => key.startsWith("tuitionsphere_"))
    .sort()
    .map((key) => {
      const raw = localStorage.getItem(key);
      try {
        return [key, JSON.parse(raw)];
      } catch {
        return [key, raw];
      }
    }),
);
```

To create a portable JSON backup in the Console:

```js
copy(
  JSON.stringify(
    Object.fromEntries(
      Object.keys(localStorage)
        .filter((key) => key.startsWith("tuitionsphere_"))
        .map((key) => [key, localStorage.getItem(key)]),
    ),
    null,
    2,
  ),
);
```

The copied backup retains the exact stored strings. Restore only into a compatible development build and never import the legacy `tuitionsphere_admin_users` key into production.
