import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  Clock,
  FileText,
  Lightbulb,
  Save,
  Target,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "summer-os-learning-logs";

const learningCategories = [
  "Business/finance",
  "History",
  "Theology",
  "Coding/tech",
  "Writing",
  "Public speaking",
  "French",
  "Science",
  "Philosophy",
];

const blankLearningEntry = {
  category: "Business/finance",
  topic: "",
  sourceType: "Book",
  resourceTitle: "",
  timeSpent: "",
  keyTakeaway: "",
  nextAction: "",
  difficulty: "",
  confidence: "",
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

function loadLearningLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function parseMinutes(timeSpent) {
  if (!timeSpent) return 0;

  const match = String(timeSpent).match(/\d+(\.\d+)?/);
  if (!match) return 0;

  const value = Number(match[0]);
  return Number.isFinite(value) ? value : 0;
}

export default function LearningModule({ onSave }) {
  const [entry, setEntry] = useState(blankLearningEntry);
  const [logs, setLogs] = useState(() => loadLearningLogs());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const totalMinutes = useMemo(() => {
    return logs.reduce((total, log) => total + parseMinutes(log.timeSpent), 0);
  }, [logs]);

  const categoryCounts = useMemo(() => {
    return logs.reduce((counts, log) => {
      const category = log.category || "Uncategorized";
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});
  }, [logs]);

  const topCategory = useMemo(() => {
    const entries = Object.entries(categoryCounts);
    if (entries.length === 0) return null;

    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }, [categoryCounts]);

  const latestLog = logs[0];

  function updateField(field, value) {
    setEntry((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function saveEntry() {
    const hasData = Object.values(entry).some((value) => String(value).trim());

    if (!hasData) return;

    const newLog = {
      id: makeId(),
      date: getLocalDateString(),
      createdAt: new Date().toLocaleString(),
      ...entry,
    };

    setLogs((prev) => [newLog, ...prev]);
    setEntry(blankLearningEntry);

    if (onSave) {
      onSave(newLog);
    }
  }

  function deleteLog(id) {
    const confirmed = window.confirm("Delete this learning log?");
    if (!confirmed) return;

    setLogs((prev) => prev.filter((log) => log.id !== id));
  }

  function clearLogs() {
    const confirmed = window.confirm("Clear all learning logs?");
    if (!confirmed) return;

    setLogs([]);
  }

  return (
    <div className="learning-module">
      <div className="module-status-grid">
        <div className="mini-stat">
          <BookOpen size={20} />
          <div>
            <span>Total Logs</span>
            <strong>{logs.length}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <Clock size={20} />
          <div>
            <span>Total Minutes</span>
            <strong>{totalMinutes}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <Brain size={20} />
          <div>
            <span>Top Category</span>
            <strong>{topCategory || "None"}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <Target size={20} />
          <div>
            <span>Latest Topic</span>
            <strong>{latestLog?.topic || "None"}</strong>
          </div>
        </div>
      </div>

      <div className="learning-form">
        <label>
          <span>Category</span>
          <select
            value={entry.category}
            onChange={(event) => updateField("category", event.target.value)}
          >
            {learningCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Topic</span>
          <input
            value={entry.topic}
            onChange={(event) => updateField("topic", event.target.value)}
            placeholder="What did you study?"
          />
        </label>

        <label>
          <span>Source Type</span>
          <select
            value={entry.sourceType}
            onChange={(event) => updateField("sourceType", event.target.value)}
          >
            <option>Book</option>
            <option>Article</option>
            <option>Course</option>
            <option>Video</option>
            <option>Podcast</option>
            <option>Practice</option>
            <option>Conversation</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          <span>Resource Title</span>
          <input
            value={entry.resourceTitle}
            onChange={(event) => updateField("resourceTitle", event.target.value)}
            placeholder="Book, video, article, course, etc."
          />
        </label>

        <label>
          <span>Time Spent</span>
          <input
            value={entry.timeSpent}
            onChange={(event) => updateField("timeSpent", event.target.value)}
            placeholder="30 min"
          />
        </label>

        <label>
          <span>Difficulty</span>
          <input
            value={entry.difficulty}
            onChange={(event) => updateField("difficulty", event.target.value)}
            placeholder="1-10"
          />
        </label>

        <label>
          <span>Confidence</span>
          <input
            value={entry.confidence}
            onChange={(event) => updateField("confidence", event.target.value)}
            placeholder="1-10"
          />
        </label>

        <label className="full-width">
          <span>Key Takeaway</span>
          <textarea
            value={entry.keyTakeaway}
            onChange={(event) => updateField("keyTakeaway", event.target.value)}
            placeholder="What is the one idea worth remembering?"
          />
        </label>

        <label className="full-width">
          <span>Next Action</span>
          <textarea
            value={entry.nextAction}
            onChange={(event) => updateField("nextAction", event.target.value)}
            placeholder="What should you study, review, practice, or build next?"
          />
        </label>

        <label className="full-width">
          <span>Notes</span>
          <textarea
            value={entry.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Definitions, questions, examples, quotes, or connections."
          />
        </label>
      </div>

      <div className="module-actions">
        <button className="primary-action" onClick={saveEntry}>
          <Save size={18} />
          Save Learning Report
        </button>

        <button className="secondary-action" onClick={clearLogs}>
          Clear Logs
        </button>
      </div>

      <div className="learning-breakdown">
        <h3>Category Breakdown</h3>

        {Object.keys(categoryCounts).length === 0 ? (
          <p className="muted">No learning categories logged yet.</p>
        ) : (
          <div className="learning-category-grid">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div key={category} className="learning-category-card">
                <span>{category}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="recent-logs">
        <h3>Recent Learning Reports</h3>

        {logs.length === 0 ? (
          <p className="muted">No learning reports filed yet.</p>
        ) : (
          logs.slice(0, 6).map((log) => (
            <div key={log.id} className="learning-log">
              <div className="learning-log-header">
                <div>
                  <strong>{log.topic || "Learning Report"}</strong>
                  <span>
                    {log.date} · {log.category}
                  </span>
                </div>

                <button
                  className="danger-action small"
                  onClick={() => deleteLog(log.id)}
                  aria-label="Delete learning log"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="learning-log-grid">
                <p>
                  <FileText size={14} />
                  Source: {log.sourceType || "None"}
                </p>
                <p>
                  <Clock size={14} />
                  Time: {log.timeSpent || "None"}
                </p>
                <p>
                  <Brain size={14} />
                  Confidence: {log.confidence || "None"}
                </p>
                <p>
                  <Target size={14} />
                  Difficulty: {log.difficulty || "None"}
                </p>
              </div>

              {log.resourceTitle && (
                <p className="learning-note">
                  <span>Resource:</span> {log.resourceTitle}
                </p>
              )}

              {log.keyTakeaway && (
                <p className="learning-note">
                  <span>Key Takeaway:</span> {log.keyTakeaway}
                </p>
              )}

              {log.nextAction && (
                <p className="learning-note">
                  <span>Next Action:</span> {log.nextAction}
                </p>
              )}

              {log.notes && (
                <p className="learning-note">
                  <span>Notes:</span> {log.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="learning-categories-reference">
        <h3>Built-In Categories</h3>

        <div className="learning-chip-grid">
          {learningCategories.map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
