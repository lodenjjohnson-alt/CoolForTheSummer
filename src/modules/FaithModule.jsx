import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Cross,
  Heart,
  Save,
  ShieldCheck,
  Target,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "summer-os-faith-logs";

const virtueOptions = [
  "Discipline",
  "Humility",
  "Courage",
  "Patience",
  "Self-control",
  "Honesty",
  "Gratitude",
  "Service",
  "Faithfulness",
];

const blankFaithEntry = {
  scriptureRead: "Pass",
  prayerCompleted: "Pass",
  passage: "",
  virtueTrained: "Discipline",
  reflection: "",
  obeyed: "",
  fellShort: "",
  improvement: "",
  prayerFocus: "",
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

function loadFaithLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getPassRate(logs, key) {
  if (logs.length === 0) return null;
  const passes = logs.filter((log) => log[key] === "Pass").length;
  return Math.round((passes / logs.length) * 100);
}

function getMostCommonVirtue(logs) {
  const counts = logs.reduce((result, log) => {
    if (!log.virtueTrained) return result;
    result[log.virtueTrained] = (result[log.virtueTrained] || 0) + 1;
    return result;
  }, {});

  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export default function FaithModule({ onSave }) {
  const [entry, setEntry] = useState(blankFaithEntry);
  const [logs, setLogs] = useState(() => loadFaithLogs());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const latestLog = logs[0];
  const scriptureRate = useMemo(() => getPassRate(logs, "scriptureRead"), [logs]);
  const prayerRate = useMemo(() => getPassRate(logs, "prayerCompleted"), [logs]);
  const topVirtue = useMemo(() => getMostCommonVirtue(logs), [logs]);

  const completeDays = useMemo(() => {
    return logs.filter(
      (log) => log.scriptureRead === "Pass" && log.prayerCompleted === "Pass"
    ).length;
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
    setEntry(blankFaithEntry);
    onSave?.(newLog);
  }

  function deleteLog(id) {
    const confirmed = window.confirm("Delete this faith reflection?");
    if (!confirmed) return;
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }

  function clearLogs() {
    const confirmed = window.confirm("Clear all faith logs?");
    if (!confirmed) return;
    setLogs([]);
  }

  return (
    <div className="faith-module">
      <div className="module-status-grid">
        <div className="mini-stat"><Cross size={20} /><div><span>Total Logs</span><strong>{logs.length}</strong></div></div>
        <div className="mini-stat"><BookOpen size={20} /><div><span>Scripture Rate</span><strong>{scriptureRate === null ? "None" : `${scriptureRate}%`}</strong></div></div>
        <div className="mini-stat"><Heart size={20} /><div><span>Prayer Rate</span><strong>{prayerRate === null ? "None" : `${prayerRate}%`}</strong></div></div>
        <div className="mini-stat"><CheckCircle2 size={20} /><div><span>Complete Days</span><strong>{completeDays}</strong></div></div>
        <div className="mini-stat"><ShieldCheck size={20} /><div><span>Top Virtue</span><strong>{topVirtue || "None"}</strong></div></div>
        <div className="mini-stat"><Target size={20} /><div><span>Latest Passage</span><strong>{latestLog?.passage || "None"}</strong></div></div>
      </div>

      <div className="faith-layout">
        <div className="faith-card">
          <div className="faith-card-header"><p>Daily Formation</p><h3>Faith Reflection</h3></div>

          <div className="faith-form">
            <label><span>Scripture Reading</span><select value={entry.scriptureRead} onChange={(event) => updateField("scriptureRead", event.target.value)}><option>Pass</option><option>Fail</option></select></label>
            <label><span>Prayer</span><select value={entry.prayerCompleted} onChange={(event) => updateField("prayerCompleted", event.target.value)}><option>Pass</option><option>Fail</option></select></label>
            <label><span>Passage / Topic</span><input value={entry.passage} onChange={(event) => updateField("passage", event.target.value)} placeholder="Romans 12, Proverbs, prayer topic" /></label>
            <label><span>Virtue Trained</span><select value={entry.virtueTrained} onChange={(event) => updateField("virtueTrained", event.target.value)}>{virtueOptions.map((virtue) => <option key={virtue}>{virtue}</option>)}</select></label>
            <label className="full-width"><span>Daily Reflection</span><textarea value={entry.reflection} onChange={(event) => updateField("reflection", event.target.value)} placeholder="What did God reveal?" /></label>
            <label className="full-width"><span>Where I Obeyed</span><textarea value={entry.obeyed} onChange={(event) => updateField("obeyed", event.target.value)} placeholder="Where did I act rightly today?" /></label>
            <label className="full-width"><span>Where I Fell Short</span><textarea value={entry.fellShort} onChange={(event) => updateField("fellShort", event.target.value)} placeholder="Where did I need correction?" /></label>
            <label className="full-width"><span>What I Need To Improve</span><textarea value={entry.improvement} onChange={(event) => updateField("improvement", event.target.value)} placeholder="One clear spiritual correction for tomorrow." /></label>
            <label className="full-width"><span>Prayer Focus</span><textarea value={entry.prayerFocus} onChange={(event) => updateField("prayerFocus", event.target.value)} placeholder="Who or what am I praying for?" /></label>
          </div>

          <div className="module-actions">
            <button className="primary-action" onClick={saveEntry}><Save size={18} /> Save Faith Reflection</button>
            <button className="secondary-action" onClick={clearLogs}>Clear Logs</button>
          </div>
        </div>

        <div className="faith-card">
          <div className="faith-card-header"><p>Virtue Map</p><h3>Formation Focus</h3></div>
          {logs.length === 0 ? <p className="muted">No faith data logged yet.</p> : (
            <div className="faith-virtue-list">
              {virtueOptions.map((virtue) => {
                const count = logs.filter((log) => log.virtueTrained === virtue).length;
                const percent = logs.length > 0 ? (count / logs.length) * 100 : 0;
                return (
                  <div key={virtue} className="faith-virtue-row">
                    <div className="faith-virtue-top"><strong>{virtue}</strong><span>{count}</span></div>
                    <div className="faith-virtue-bar"><div style={{ width: `${percent}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="faith-card">
        <div className="faith-card-header"><p>Action History</p><h3>Recent Faith Reflections</h3></div>
        {logs.length === 0 ? <p className="muted">No faith reflections filed yet.</p> : (
          <div className="faith-log-list">
            {logs.slice(0, 8).map((log) => (
              <div key={log.id} className="faith-log">
                <div className="faith-log-header"><div><strong>{log.passage || "Faith Reflection"}</strong><span>{log.date} · Scripture {log.scriptureRead} · Prayer {log.prayerCompleted}</span></div><button className="danger-action small" onClick={() => deleteLog(log.id)} aria-label="Delete faith reflection"><Trash2 size={14} /></button></div>
                {log.virtueTrained && <p><span>Virtue:</span> {log.virtueTrained}</p>}
                {log.reflection && <p><span>Reflection:</span> {log.reflection}</p>}
                {log.obeyed && <p><span>Obeyed:</span> {log.obeyed}</p>}
                {log.fellShort && <p><span>Fell short:</span> {log.fellShort}</p>}
                {log.improvement && <p><span>Improve:</span> {log.improvement}</p>}
                {log.prayerFocus && <p><span>Prayer focus:</span> {log.prayerFocus}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
