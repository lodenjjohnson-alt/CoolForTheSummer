import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "summer-os-school-data";

const blankClass = {
  name: "",
  teacher: "",
  platform: "",
  targetGrade: "",
  notes: "",
};

const blankAssignment = {
  title: "",
  dueDate: "",
  grade: "",
  status: "Not started",
  notes: "",
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadSchoolData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getDaysUntilDue(dueDate) {
  if (!dueDate) return null;

  const today = new Date(`${getLocalDateString()}T00:00:00`);
  const due = new Date(`${dueDate}T00:00:00`);
  const difference = due.getTime() - today.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function parseGradeNumber(grade) {
  if (!grade) return null;

  const match = String(grade).match(/\\d+(\\.\\d+)?/);
  if (!match) return null;

  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

export default function SchoolModule({ onSave }) {
  const [classes, setClasses] = useState(() => loadSchoolData());
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classForm, setClassForm] = useState(blankClass);
  const [assignmentForm, setAssignmentForm] = useState(blankAssignment);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
  }, [classes]);

  const selectedClass =
    classes.find((classFile) => classFile.id === selectedClassId) ??
    classes[0] ??
    null;

  const totalAssignments = useMemo(() => {
    return classes.reduce(
      (total, classFile) => total + classFile.assignments.length,
      0
    );
  }, [classes]);

  const completedAssignments = useMemo(() => {
    return classes.reduce((total, classFile) => {
      return (
        total +
        classFile.assignments.filter(
          (assignment) =>
            assignment.status === "Submitted" || assignment.status === "Graded"
        ).length
      );
    }, 0);
  }, [classes]);

  const dueSoonCount = useMemo(() => {
    return classes.reduce((total, classFile) => {
      return (
        total +
        classFile.assignments.filter((assignment) => {
          const days = getDaysUntilDue(assignment.dueDate);
          return days !== null && days >= 0 && days <= 7;
        }).length
      );
    }, 0);
  }, [classes]);

  const averageGrade = useMemo(() => {
    const grades = classes
      .flatMap((classFile) => classFile.assignments)
      .map((assignment) => parseGradeNumber(assignment.grade))
      .filter((grade) => grade !== null);

    if (grades.length === 0) return null;

    const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    return average.toFixed(1);
  }, [classes]);

  function updateClassForm(field, value) {
    setClassForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateAssignmentForm(field, value) {
    setAssignmentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function createClassFile() {
    if (!classForm.name.trim()) return;

    const newClass = {
      id: makeId(),
      createdAt: new Date().toLocaleString(),
      ...classForm,
      name: classForm.name.trim(),
      assignments: [],
    };

    setClasses((prev) => [newClass, ...prev]);
    setSelectedClassId(newClass.id);
    setClassForm(blankClass);

    if (onSave) {
      onSave(newClass);
    }
  }

  function addAssignment() {
    if (!selectedClass || !assignmentForm.title.trim()) return;

    const newAssignment = {
      id: makeId(),
      createdAt: new Date().toLocaleString(),
      ...assignmentForm,
      title: assignmentForm.title.trim(),
    };

    setClasses((prev) =>
      prev.map((classFile) =>
        classFile.id === selectedClass.id
          ? {
              ...classFile,
              assignments: [newAssignment, ...classFile.assignments],
            }
          : classFile
      )
    );

    setAssignmentForm(blankAssignment);

    if (onSave) {
      onSave(newAssignment);
    }
  }

  function updateAssignmentStatus(classId, assignmentId, status) {
    setClasses((prev) =>
      prev.map((classFile) =>
        classFile.id === classId
          ? {
              ...classFile,
              assignments: classFile.assignments.map((assignment) =>
                assignment.id === assignmentId
                  ? { ...assignment, status }
                  : assignment
              ),
            }
          : classFile
      )
    );
  }

  function deleteAssignment(classId, assignmentId) {
    const confirmed = window.confirm("Delete this assignment?");
    if (!confirmed) return;

    setClasses((prev) =>
      prev.map((classFile) =>
        classFile.id === classId
          ? {
              ...classFile,
              assignments: classFile.assignments.filter(
                (assignment) => assignment.id !== assignmentId
              ),
            }
          : classFile
      )
    );
  }

  function deleteClass(classId) {
    const confirmed = window.confirm("Delete this class file and all assignments?");
    if (!confirmed) return;

    setClasses((prev) => prev.filter((classFile) => classFile.id !== classId));

    if (selectedClassId === classId) {
      setSelectedClassId("");
    }
  }

  function clearAllSchoolData() {
    const confirmed = window.confirm("Clear all school data?");
    if (!confirmed) return;

    setClasses([]);
    setSelectedClassId("");
  }

  return (
    <div className="school-module">
      <div className="module-status-grid">
        <div className="mini-stat">
          <GraduationCap size={20} />
          <div>
            <span>Class Files</span>
            <strong>{classes.length}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <ClipboardList size={20} />
          <div>
            <span>Assignments</span>
            <strong>{totalAssignments}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <CalendarDays size={20} />
          <div>
            <span>Due Soon</span>
            <strong>{dueSoonCount}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <CheckCircle2 size={20} />
          <div>
            <span>Completed</span>
            <strong>{completedAssignments}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <Award size={20} />
          <div>
            <span>Avg Grade</span>
            <strong>{averageGrade ? `${averageGrade}%` : "None"}</strong>
          </div>
        </div>
      </div>

      <div className="school-card">
        <h3>Create Class File</h3>

        <div className="school-form">
          <label>
            <span>Class Name</span>
            <input
              value={classForm.name}
              onChange={(event) => updateClassForm("name", event.target.value)}
              placeholder="Biology, Algebra, English"
            />
          </label>

          <label>
            <span>Teacher</span>
            <input
              value={classForm.teacher}
              onChange={(event) => updateClassForm("teacher", event.target.value)}
              placeholder="Optional"
            />
          </label>

          <label>
            <span>Platform</span>
            <input
              value={classForm.platform}
              onChange={(event) =>
                updateClassForm("platform", event.target.value)
              }
              placeholder="Canvas, Google Classroom, Apex, etc."
            />
          </label>

          <label>
            <span>Target Grade</span>
            <input
              value={classForm.targetGrade}
              onChange={(event) =>
                updateClassForm("targetGrade", event.target.value)
              }
              placeholder="A, 95%, pass"
            />
          </label>

          <label className="full-width">
            <span>Class Notes</span>
            <textarea
              value={classForm.notes}
              onChange={(event) => updateClassForm("notes", event.target.value)}
              placeholder="What matters for this class?"
            />
          </label>
        </div>

        <div className="module-actions">
          <button className="primary-action" onClick={createClassFile}>
            <FileText size={18} />
            Create Class File
          </button>

          <button className="secondary-action" onClick={clearAllSchoolData}>
            Clear School Data
          </button>
        </div>
      </div>

      {classes.length > 0 && (
        <div className="school-layout">
          <div className="class-list">
            <h3>Class Files</h3>

            {classes.map((classFile) => (
              <button
                key={classFile.id}
                className={`class-file-button ${
                  selectedClass?.id === classFile.id ? "selected" : ""
                }`}
                onClick={() => setSelectedClassId(classFile.id)}
              >
                <strong>{classFile.name}</strong>
                <span>{classFile.assignments.length} assignments</span>
              </button>
            ))}
          </div>

          <div className="school-card">
            {selectedClass ? (
              <>
                <div className="selected-class-header">
                  <div>
                    <h3>{selectedClass.name}</h3>
                    <p>
                      {selectedClass.teacher || "No teacher"} ·{" "}
                      {selectedClass.platform || "No platform"}
                    </p>
                    <p>Target: {selectedClass.targetGrade || "None"}</p>
                  </div>

                  <button
                    className="danger-action"
                    onClick={() => deleteClass(selectedClass.id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>

                {selectedClass.notes && (
                  <p className="class-notes">{selectedClass.notes}</p>
                )}

                <div className="school-form">
                  <label>
                    <span>Assignment</span>
                    <input
                      value={assignmentForm.title}
                      onChange={(event) =>
                        updateAssignmentForm("title", event.target.value)
                      }
                      placeholder="Module 1 quiz, essay draft, exam"
                    />
                  </label>

                  <label>
                    <span>Due Date</span>
                    <input
                      type="date"
                      value={assignmentForm.dueDate}
                      onChange={(event) =>
                        updateAssignmentForm("dueDate", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    <span>Grade</span>
                    <input
                      value={assignmentForm.grade}
                      onChange={(event) =>
                        updateAssignmentForm("grade", event.target.value)
                      }
                      placeholder="A, 92%, pending"
                    />
                  </label>

                  <label>
                    <span>Status</span>
                    <select
                      value={assignmentForm.status}
                      onChange={(event) =>
                        updateAssignmentForm("status", event.target.value)
                      }
                    >
                      <option>Not started</option>
                      <option>In progress</option>
                      <option>Submitted</option>
                      <option>Graded</option>
                    </select>
                  </label>

                  <label className="full-width">
                    <span>Assignment Notes</span>
                    <textarea
                      value={assignmentForm.notes}
                      onChange={(event) =>
                        updateAssignmentForm("notes", event.target.value)
                      }
                      placeholder="What needs to be done?"
                    />
                  </label>
                </div>

                <div className="module-actions">
                  <button className="primary-action" onClick={addAssignment}>
                    <Plus size={18} />
                    Add Assignment
                  </button>
                </div>

                <div className="assignment-list">
                  <h3>Assignments</h3>

                  {selectedClass.assignments.length === 0 ? (
                    <p className="muted">No assignments added yet.</p>
                  ) : (
                    selectedClass.assignments.map((assignment) => {
                      const daysUntilDue = getDaysUntilDue(assignment.dueDate);

                      return (
                        <div key={assignment.id} className="assignment-card">
                          <div className="assignment-header">
                            <div>
                              <strong>{assignment.title}</strong>
                              <span>
                                Due: {assignment.dueDate || "No due date"}
                                {daysUntilDue !== null
                                  ? ` · ${daysUntilDue} days`
                                  : ""}
                              </span>
                            </div>

                            <button
                              className="danger-action small"
                              onClick={() =>
                                deleteAssignment(selectedClass.id, assignment.id)
                              }
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="assignment-meta">
                            <label>
                              <span>Status</span>
                              <select
                                value={assignment.status}
                                onChange={(event) =>
                                  updateAssignmentStatus(
                                    selectedClass.id,
                                    assignment.id,
                                    event.target.value
                                  )
                                }
                              >
                                <option>Not started</option>
                                <option>In progress</option>
                                <option>Submitted</option>
                                <option>Graded</option>
                              </select>
                            </label>

                            <p>
                              <span>Grade</span>
                              <strong>{assignment.grade || "Pending"}</strong>
                            </p>
                          </div>

                          {assignment.notes && (
                            <p className="assignment-notes">{assignment.notes}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <p className="muted">Select a class file.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
