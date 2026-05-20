import React, { useEffect, useMemo, useState } from "react";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  FileText,
  Moon,
  Save,
  ShieldCheck,
  Target,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "summer-os-reflection-logs";

const blankReflection = {
  biggestWin: "",
  biggestFailure: "",
  distraction: "",
  prevention: "",
  hockeyImprovement: "",
  hockeyCorrection: "",
  honoredGod: "",
  fellShort: "",
  nonNegotiables: "",
  identityStatement: "",
  tomorrowFocus: "",
  dayScore: "",
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

function loadReflectionLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function ReflectionModule({ onSave }) {
  const [reflection, setReflection] = useState(blankReflection);
  const [logs, setLogs] = useState(() => loadReflectionLogs());
  const [selectedLogId, setSelectedLogId] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const latestLog = logs[0];
  const selectedLog = logs.find((log) => log.id === selectedLogId) ?? latestLog ?? null;

  const averageDayScore = useMemo(() => {
    const scores = logs
      .map((log) => Number(log.dayScore))
      .filter((score) => Number.isFinite(score) && score > 0);

    if (scores.length === 0) return null;
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return average.toFixed(1);
  }, [logs]);

  const correctionCount = useMemo(() => {
    return logs.filter((log) => String(log.prevention || "").trim()).length;
  }, [logs]);

  function updateField(field, value) {
    setReflection((prev) => ({ ...prev, [field]: value }));
  }

  function saveReflection() {
    const hasData = Object.values(reflection).some((value) => String(value).trim());
    if (!hasData) return;

    const newLog = {
      id: makeId(),
      date: getLocalDateString(),
      createdAt: new Date().toLocaleString(),
      ...reflection,
    };

    setLogs((prev) => [newLog, ...prev]);
    setSelectedLogId(newLog.id);
    setReflection(blankReflection);
    onSave?.(newLog);
  }

  function loadIntoEditor(log) {
    if (!log) return;
    setReflection({
      biggestWin: log.biggestWin || "",
      biggestFailure: log.biggestFailure || "",
      distraction: log.distraction || "",
      prevention: log.prevention || "",
      hockeyImprovement: log.hockeyImprovement || "",
      hockeyCorrection: log.hockeyCorrection || "",
      honoredGod: log.honoredGod || "",
      fellShort: log.fellShort || "",
      nonNegotiables: log.nonNegotiables || "",
      identityStatement: log.identityStatement || "",
      tomorrowFocus: log.tomorrowFocus || "",
      dayScore: log.dayScore || "",
    });
  }

  function deleteLog(id) {
    const confirmed = window.confirm("Delete this reflection?");
    if (!confirmed) return;
    setLogs((prev) => prev.filter((log) => log.id !== id));
    if (selectedLogId === id) setSelectedLogId("");
  }

  function clearLogs() {
    const confirmed = window.confirm("Clear all reflection logs?");
    if (!confirmed) return;
    setLogs([]);
    setSelectedLogId("");
  }

  return (
    <div className="reflection-module">
      <div className="module-status-grid">
        <div className="mini-stat"><Moon size={20} /><div><span>Total Reports</span><strong>{logs.length}</strong></div></div>
        <div className="mini-stat"><CalendarDays size={20} /><div><span>Latest Date</span><strong>{latestLog?.date || "None"}</strong></div></div>
        <div className="mini-stat"><Target size={20} /><div><span>Avg Day Score</span><strong>{averageDayScore ? `${averageDayScore}/10` : "None"}</strong></div></div>
        <div className="mini-stat"><ShieldCheck size={20} /><div><span>Corrections</span><strong>{correctionCount}</strong></div></div>
      </div>

      <div className="reflection-layout">
        <div className="reflection-card">
          <div className="reflection-card-header"><p>After-Action Report</p><h3>Nightly Reflection</h3></div>

          <div className="reflection-form">
            <label className="full-width"><span>Biggest Win</span><textarea value={reflection.biggestWin} onChange={(event) => updateField("biggestWin", event.target.value)} placeholder="What was your biggest win today?" /></label>
            <label className="full-width"><span>Biggest Failure</span><textarea value={reflection.biggestFailure} onChange={(event) => updateField("biggestFailure", event.target.value)} placeholder="What was your biggest failure today?" /></label>
            <label className="full-width"><span>What Distracted Me</span><textarea value={reflection.distraction} onChange={(event) => updateField("distraction", event.target.value)} placeholder="What pulled you away from the mission?" /></label>
            <label className="full-width"><span>How I Will Prevent It Tomorrow</span><textarea value={reflection.prevention} onChange={(event) => updateField("prevention", event.target.value)} placeholder="What system correction prevents the same failure?" /></label>
            <label><span>Hockey Improvement</span><textarea value={reflection.hockeyImprovement} onChange={(event) => updateField("hockeyImprovement", event.target.value)} placeholder="What improved?" /></label>
            <label><span>Hockey Correction</span><textarea value={reflection.hockeyCorrection} onChange={(event) => updateField("hockeyCorrection", event.target.value)} placeholder="What needs correction?" /></label>
            <label className="full-width"><span>How I Honored God</span><textarea value={reflection.honoredGod} onChange={(event) => updateField("honoredGod", event.target.value)} placeholder="Where did you act faithfully?" /></label>
            <label className="full-width"><span>Where I Fell Short Spiritually</span><textarea value={reflection.fellShort} onChange={(event) => updateField("fellShort", event.target.value)} placeholder="Where do you need repentance or correction?" /></label>
            <label className="full-width"><span>Tomorrow's Three Non-Negotiables</span><textarea value={reflection.nonNegotiables} onChange={(event) => updateField("nonNegotiables", event.target.value)} placeholder="Three must-do actions for tomorrow." /></label>
            <label className="full-width"><span>Identity Statement</span><textarea value={reflection.identityStatement} onChange={(event) => updateField("identityStatement", event.target.value)} placeholder="Who are you becoming?" /></label>
            <label><span>Tomorrow Focus</span><input value={reflection.tomorrowFocus} onChange={(event) => updateField("tomorrowFocus", event.target.value)} placeholder="One main target" /></label>
            <label><span>Day Score</span><input value={reflection.dayScore} onChange={(event) => updateField("dayScore", event.target.value)} placeholder="1-10" /></label>
          </div>

          <div className="module-actions">
            <button className="primary-action" onClick={saveReflection}><Save size={18} /> Save After-Action Report</button>
            <button className="secondary-action" onClick={clearLogs}>Clear Logs</button>
          </div>
        </div>

        <div className="reflection-card">
          <div className="reflection-card-header"><p>Archive Viewer</p><h3>Past Inputs</h3></div>
          {logs.length === 0 ? <p className="muted">No reflections saved yet.</p> : (
            <div className="reflection-archive-list">
              {logs.slice(0, 12).map((log) => (
                <button key={log.id} className={`reflection-archive-button ${selectedLog?.id === log.id ? "selected" : ""}`} onClick={() => setSelectedLogId(log.id)}>
                  <strong>{log.date}</strong>
                  <span>{log.tomorrowFocus || log.biggestWin || "Reflection saved"}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="reflection-card">
        <div className="reflection-card-header"><p>Selected Report</p><h3>{selectedLog ? selectedLog.date : "No Report Selected"}</h3></div>
        {!selectedLog ? <p className="muted">Select a saved reflection to review it.</p> : (
          <div className="reflection-log">
            <div className="reflection-log-actions">
              <button className="secondary-action" onClick={() => loadIntoEditor(selectedLog)}><FileText size={16} /> Load Into Editor</button>
              <button className="danger-action" onClick={() => deleteLog(selectedLog.id)}><Trash2 size={16} /> Delete</button>
            </div>
            {selectedLog.biggestWin && <p><span>Win:</span> {selectedLog.biggestWin}</p>}
            {selectedLog.biggestFailure && <p><span>Failure:</span> {selectedLog.biggestFailure}</p>}
            {selectedLog.distraction && <p><span>Distraction:</span> {selectedLog.distraction}</p>}
            {selectedLog.prevention && <p><span>Prevention:</span> {selectedLog.prevention}</p>}
            {selectedLog.hockeyImprovement && <p><span>Hockey improvement:</span> {selectedLog.hockeyImprovement}</p>}
            {selectedLog.hockeyCorrection && <p><span>Hockey correction:</span> {selectedLog.hockeyCorrection}</p>}
            {selectedLog.honoredGod && <p><span>Honored God:</span> {selectedLog.honoredGod}</p>}
            {selectedLog.fellShort && <p><span>Fell short:</span> {selectedLog.fellShort}</p>}
            {selectedLog.nonNegotiables && <p><span>Non-negotiables:</span> {selectedLog.nonNegotiables}</p>}
            {selectedLog.identityStatement && <p><span>Identity:</span> {selectedLog.identityStatement}</p>}
            {selectedLog.tomorrowFocus && <p><span>Tomorrow focus:</span> {selectedLog.tomorrowFocus}</p>}
            {selectedLog.dayScore && <p><span>Day score:</span> {selectedLog.dayScore}/10</p>}
          </div>
        )}
      </div>
    </div>
  );
}
