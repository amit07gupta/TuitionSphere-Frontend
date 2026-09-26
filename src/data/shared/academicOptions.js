const primarySubjects = {
  CBSE: [
    "English",
    "Hindi / Second Language",
    "Mathematics",
    "Environmental Studies (EVS)",
    "Computer Studies",
    "General Knowledge",
  ],
  ICSE: [
    "English",
    "Hindi / Second Language",
    "Mathematics",
    "Environmental Studies (EVS)",
    "Computer Studies",
    "General Knowledge",
  ],
};

const middleSubjects = {
  CBSE: [
    "English",
    "Hindi / Second Language",
    "Mathematics",
    "Science",
    "Social Science",
    "Computer Studies",
  ],
  ICSE: [
    "English",
    "Hindi / Second Language",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History & Civics",
    "Geography",
    "Computer Studies",
  ],
};

const boardPreparationSubjects = {
  CBSE: ["English", "Hindi / Second Language", "Mathematics", "Science", "Social Science", "Computer Applications"],
  ICSE: ["English", "Hindi / Second Language", "Mathematics", "Physics", "Chemistry", "Biology", "History & Civics", "Geography", "Computer Applications"],
};

export const seniorSubjectsByStream = {
  Science: ["English", "Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"],
  Commerce: ["English", "Accountancy", "Business Studies", "Economics", "Mathematics"],
};

export const foundationSubjectsByBoard = {
  primary: primarySubjects,
  middle: middleSubjects,
};

export function getSubjectsForGradeAndBoard(grade, board, stream = "") {
  const gradeNumber = Number(grade);
  if (!primarySubjects[board] || !gradeNumber) return [];
  if (gradeNumber <= 5) return primarySubjects[board];
  if (gradeNumber <= 8) return middleSubjects[board];
  if (gradeNumber <= 10) return boardPreparationSubjects[board];
  return seniorSubjectsByStream[stream] || [];
}

export { boardPreparationSubjects };
