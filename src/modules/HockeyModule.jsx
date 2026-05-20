import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Eye,
  Film,
  Goal,
  Save,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const STORAGE_KEY = "summer-os-hockey-logs";

const blankHockeyEntry = {
  trainingType: "Ice",
  mainFocus: "",
  improved: "",
  brokeDown: "",
  technicalCorrection: "",
  nextSessionFocus: "",
  confidence: "",
  intensity: "",
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

function loadHockeyLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function HockeyModule({ onSave }) {
  const [entry, setEntry] = useState(blankHockeyEntry);
  const [logs, setLogs] = useState(() => loadHockeyLogs());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const latestLog = logs[0];

  const averageConfidence = useMemo(() => {
    const valid = logs
      .map((log) => Number(log.confidence))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (valid.length === 0) return null;

    const average = valid.reduce((sum, value) => sum + value, 0) / valid.length;
    return average.toFixed(1);
  }, [logs]);

  const trainingTypeCounts = useMemo(() => {
    return logs.reduce((counts, log) => {
      const type = log.trainingType || "Unknown";
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {});
  }, [logs]);

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
    setEntry(blankHockeyEntry);

    if (onSave) {
      onSave(newLog);
    }
  }

  function clearLogs() {
    const confirmed = window.confirm("Clear all hockey logs?");
    if (!confirmed) return;
    setLogs([]);
  }

  return (
    <div className="hockey-module">
      <div className="module-status-grid">
        <div className="mini-stat">
          <Shield size={20} />
          <div>
            <span>Total Logs</span>
            <strong>{logs.length}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <Target size={20} />
          <div>
            <span>Latest Focus</span>
            <strong>{latestLog?.mainFocus || "None"}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <Goal size={20} />
          <div>
            <span>Avg Confidence</span>
            <strong>
              {averageConfidence ? `${averageConfidence}/10` : "None"}
            </strong>
          </div>
        </div>
      </div>

      <div className="hockey-form">
        <label>
          <span>Training Type</span>
          <select
            value={entry.trainingType}
            onChange={(event) => updateField("trainingType", event.target.value)}
          >
            <option>Ice</option>
            <option>Off-ice</option>
            <option>Film</option>
            <option>Eyes</option>
            <option>Goalie coach</option>
            <option>Game</option>
            <option>Recovery</option>
          </select>
        </label>

        <label>
          <span>Main Focus</span>
          <input
            value={entry.mainFocus}
            onChange={(event) => updateField("mainFocus", event.target.value)}
            placeholder="Patience, glove, depth, tracking"
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

        <label>
          <span>Intensity</span>
          <input
            value={entry.intensity}
            onChange={(event) => updateField("intensity", event.target.value)}
            placeholder="1-10"
          />
        </label>

        <label className="full-width">
          <span>What Improved</span>
          <textarea
            value={entry.improved}
            onChange={(event) => updateField("improved", event.target.value)}
            placeholder="What got better today? Use evidence, not vibes."
          />
        </label>

        <label className="full-width">
          <span>What Broke Down</span>
          <textarea
            value={entry.brokeDown}
            onChange={(event) => updateField("brokeDown", event.target.value)}
            placeholder="What failed under speed, fatigue, pressure, or repetition?"
          />
        </label>

        <label className="full-width">
          <span>Technical Correction</span>
          <textarea
            value={entry.technicalCorrection}
            onChange={(event) =>
              updateField("technicalCorrection", event.target.value)
            }
            placeholder="One specific correction: depth, hands, feet, patience, angle, tracking, rebound control."
          />
        </label>

        <label className="full-width">
          <span>Next Session Focus</span>
          <textarea
            value={entry.nextSessionFocus}
            onChange={(event) =>
              updateField("nextSessionFocus", event.target.value)
            }
            placeholder="What is the next practice target?"
          />
        </label>

        <label className="full-width">
          <span>Extra Notes</span>
          <textarea
            value={entry.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Film notes, drills, coach feedback, mental state, or game details."
          />
        </label>
      </div>

      <div className="module-actions">
        <button className="primary-action" onClick={saveEntry}>
          <Save size={18} />
          Save Hockey Report
        </button>

        <button className="secondary-action" onClick={clearLogs}>
          Clear Logs
        </button>
      </div>

      <div className="hockey-breakdown">
        <h3>Training Breakdown</h3>

        {Object.keys(trainingTypeCounts).length === 0 ? (
          <p className="muted">No training types logged yet.</p>
        ) : (
          <div className="training-type-grid">
            {Object.entries(trainingTypeCounts).map(([type, count]) => (
              <div key={type} className="training-type-card">
                <span>{type}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="recent-logs">
        <h3>Recent Hockey Reports</h3>

        {logs.length === 0 ? (
          <p className="muted">No hockey reports filed yet.</p>
        ) : (
          logs.slice(0, 5).map((log) => (
            <div key={log.id} className="hockey-log">
              <div className="hockey-log-header">
                <div>
                  <strong>{log.trainingType || "Hockey Report"}</strong>
                  <span>{log.date}</span>
                </div>

                <div className="hockey-log-score">
                  <span>Confidence</span>
                  <strong>{log.confidence || "N/A"}</strong>
                </div>
              </div>

              <div className="hockey-log-grid">
                <p>
                  <Target size={14} />
                  Focus: {log.mainFocus || "None"}
                </p>
                <p>
                  <Eye size={14} />
                  Next: {log.nextSessionFocus || "None"}
                </p>
                <p>
                  <TrendingUp size={14} />
                  Improved: {log.improved || "None"}
                </p>
                <p>
                  <TrendingDown size={14} />
                  Broke down: {log.brokeDown || "None"}
                </p>
                <p>
                  <ClipboardList size={14} />
                  Correction: {log.technicalCorrection || "None"}
                </p>
                <p>
                  <Film size={14} />
                  Notes: {log.notes || "None"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
