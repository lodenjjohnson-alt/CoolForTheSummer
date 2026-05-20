import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Clock,
  Flame,
  Save,
  ShieldCheck,
  Target,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "summer-os-discipline-logs";

const weaknessOptions = [
  "Doomscrolling",
  "Sugar/overeating",
  "Lustful content/thoughts",
  "Skipped training",
  "Procrastination",
  "Lying/excuses",
  "Wasted morning",
  "Poor sleep discipline",
];

const timeOptions = [
  "Morning",
  "Before school/work",
  "Lunch",
  "Afternoon",
  "Before training",
  "After training",
  "Dinner",
  "Homework block",
  "Night",
  "In bed",
  "Weekend",
];

const blankDisciplineEntry = {
  weakness: "Doomscrolling",
  severity: "",
  timeOfDay: "Night",
  whatHappened: "",
  trigger: "",
  response: "",
  correction: "",
  preventionRule: "",
  result: "Needs correction",
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

function loadDisciplineLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getMostCommonValue(logs, key) {
  const counts = logs.reduce((result, log) => {
    const value = log[key];
    if (!value) return result;
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});

  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export default function DisciplineModule({ onSave }) {
  const [entry, setEntry] = useState(blankDisciplineEntry);
  const [logs, setLogs] = useState(() => loadDisciplineLogs());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const topWeakness = useMemo(() => getMostCommonValue(logs, "weakness"), [logs]);
  const topTrigger = useMemo(() => getMostCommonValue(logs, "trigger"), [logs]);
  const topTime = useMemo(() => getMostCommonValue(logs, "timeOfDay"), [logs]);

  const correctionCount = useMemo(() => {
    return logs.filter((log) => String(log.correction || "").trim()).length;
  }, [logs]);

  const averageSeverity = useMemo(() => {
    const valid = logs
      .map((log) => Number(log.severity))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (valid.length === 0) return null;
    const average = valid.reduce((sum, value) => sum + value, 0) / valid.length;
    return average.toFixed(1);
  }, [logs]);

  const resultCounts = useMemo(() => {
    return logs.reduce((counts, log) => {
      const result = log.result || "Unmarked";
      counts[result] = (counts[result] || 0) + 1;
      return counts;
    }, {});
  }, [logs]);

  function updateField(field, value) {
    setEntry((prev) => ({ ...prev, [field]: value }));
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
    setEntry(blankDisciplineEntry);
    onSave?.(newLog);
  }

  function deleteLog(id) {
    const confirmed = window.confirm("Delete this discipline journal?");
    if (!confirmed) return;
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }

  function clearLogs() {
    const confirmed = window.confirm("Clear all discipline logs?");
    if (!confirmed) return;
    setLogs([]);
  }

  return (
    <div className="discipline-module">
      <div className="module-status-grid">
        <div className="mini-stat"><Flame size={20} /><div><span>Total Logs</span><strong>{logs.length}</strong></div></div>
        <div className="mini-stat"><AlertTriangle size={20} /><div><span>Top Weakness</span><strong>{topWeakness || "None"}</strong></div></div>
        <div className="mini-stat"><Brain size={20} /><div><span>Top Trigger</span><strong>{topTrigger || "None"}</strong></div></div>
        <div className="mini-stat"><Clock size={20} /><div><span>Top Time</span><strong>{topTime || "None"}</strong></div></div>
        <div className="mini-stat"><Target size={20} /><div><span>Avg Severity</span><strong>{averageSeverity ? `${averageSeverity}/10` : "None"}</strong></div></div>
        <div className="mini-stat"><ShieldCheck size={20} /><div><span>Corrections</span><strong>{correctionCount}</strong></div></div>
      </div>

      <div className="discipline-layout">
        <div className="discipline-card">
          <div className="discipline-card-header"><p>Failure Journal</p><h3>Log Discipline Event</h3></div>

          <div className="discipline-form">
            <label><span>Weakness</span><select value={entry.weakness} onChange={(event) => updateField("weakness", event.target.value)}>{weaknessOptions.map((weakness) => <option key={weakness}>{weakness}</option>)}</select></label>
            <label><span>Severity</span><input value={entry.severity} onChange={(event) => updateField("severity", event.target.value)} placeholder="1-10" /></label>
            <label><span>Time of Day</span><select value={entry.timeOfDay} onChange={(event) => updateField("timeOfDay", event.target.value)}>{timeOptions.map((time) => <option key={time}>{time}</option>)}</select></label>
            <label><span>Result</span><select value={entry.result} onChange={(event) => updateField("result", event.target.value)}><option>Needs correction</option><option>Corrected quickly</option><option>Prevented</option><option>Major failure</option></select></label>
            <label className="full-width"><span>What Happened</span><textarea value={entry.whatHappened} onChange={(event) => updateField("whatHappened", event.target.value)} placeholder="What happened? Keep it honest and useful." /></label>
            <label className="full-width"><span>Trigger</span><textarea value={entry.trigger} onChange={(event) => updateField("trigger", event.target.value)} placeholder="What caused it?" /></label>
            <label className="full-width"><span>Response</span><textarea value={entry.response} onChange={(event) => updateField("response", event.target.value)} placeholder="What did you do immediately after?" /></label>
            <label className="full-width"><span>Correction</span><textarea value={entry.correction} onChange={(event) => updateField("correction", event.target.value)} placeholder="What correction prevents this from repeating?" /></label>
            <label className="full-width"><span>Prevention Rule</span><textarea value={entry.preventionRule} onChange={(event) => updateField("preventionRule", event.target.value)} placeholder="Example: No phone in bed." /></label>
          </div>

          <div className="module-actions">
            <button className="primary-action" onClick={saveEntry}><Save size={18} /> Save Discipline Journal</button>
            <button className="secondary-action" onClick={clearLogs}>Clear Logs</button>
          </div>
        </div>

        <div className="discipline-card">
          <div className="discipline-card-header"><p>Pattern Readout</p><h3>Weakness Map</h3></div>
          {logs.length === 0 ? <p className="muted">No discipline data logged yet.</p> : (
            <div className="discipline-pattern-list">
              {weaknessOptions.map((weakness) => {
                const count = logs.filter((log) => log.weakness === weakness).length;
                const percent = logs.length > 0 ? (count / logs.length) * 100 : 0;
                return (
                  <div key={weakness} className="discipline-pattern-row">
                    <div className="discipline-pattern-top"><strong>{weakness}</strong><span>{count}</span></div>
                    <div className="discipline-pattern-bar"><div style={{ width: `${percent}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}

          {Object.keys(resultCounts).length > 0 && (
            <div className="discipline-result-grid">
              {Object.entries(resultCounts).map(([result, count]) => <div key={result} className="discipline-result-card"><span>{result}</span><strong>{count}</strong></div>)}
            </div>
          )}
        </div>
      </div>

      <div className="discipline-card">
        <div className="discipline-card-header"><p>Action History</p><h3>Recent Discipline Journals</h3></div>
        {logs.length === 0 ? <p className="muted">No discipline journals filed yet.</p> : (
          <div className="discipline-log-list">
            {logs.slice(0, 8).map((log) => (
              <div key={log.id} className="discipline-log">
                <div className="discipline-log-header"><div><strong>{log.weakness}</strong><span>{log.date} · {log.timeOfDay} · Severity {log.severity || "N/A"}</span></div><button className="danger-action small" onClick={() => deleteLog(log.id)} aria-label="Delete discipline journal"><Trash2 size={14} /></button></div>
                {log.whatHappened && <p><span>What happened:</span> {log.whatHappened}</p>}
                {log.trigger && <p><span>Trigger:</span> {log.trigger}</p>}
                {log.response && <p><span>Response:</span> {log.response}</p>}
                {log.correction && <p><span>Correction:</span> {log.correction}</p>}
                {log.preventionRule && <p><span>Rule:</span> {log.preventionRule}</p>}
                {log.result && <p><span>Result:</span> {log.result}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
