import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Compass,
  Map,
  RefreshCw,
  Save,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "summer-os-experiences-data";

const experienceBank = {
  Adventure: [
    "Take a sunrise hike or run.",
    "Explore a new trail or outdoor location.",
    "Do one safe controlled discomfort challenge outdoors.",
  ],
  Family: [
    "Cook or help prepare a meal for the family.",
    "Have a real conversation with a family member.",
    "Do one useful chore before being asked.",
  ],
  Social: [
    "Start one conversation with someone new.",
    "Invite someone into a real activity, not just texting.",
    "Practice one confident introduction.",
  ],
  Service: [
    "Do one quiet service action without announcing it.",
    "Help someone solve a small problem.",
    "Give useful encouragement to someone who needs it.",
  ],
  "Skill-building": [
    "Spend 30 minutes building one useful skill.",
    "Record proof of progress in one skill.",
    "Try a skill drill that is slightly above your level.",
  ],
  Business: [
    "Write one business idea and its first customer step.",
    "Study one company or entrepreneur for 20 minutes.",
    "Find one local problem people might pay to solve.",
  ],
  Outdoors: [
    "Spend one hour outside without your phone.",
    "Go fishing, hiking, camping prep, or route scouting.",
    "Practice one safe survival or outdoor skill.",
  ],
  Faith: [
    "Read one chapter and write one obedience point.",
    "Pray for someone else specifically.",
    "Do one action that strengthens humility or self-control.",
  ],
  "Recovery/fun": [
    "Do a clean recovery activity with no doomscrolling.",
    "Take a walk and decompress without headphones.",
    "Earn and use 20 minutes of guilt-free rest.",
  ],
};

const blankCustomExperience = {
  category: "Adventure",
  suggestion: "",
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

function hashText(text) {
  return String(text)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function generateDailyPlan(date = getLocalDateString()) {
  const seed = hashText(date);
  return Object.entries(experienceBank).map(([category, ideas], index) => ({
    id: `${date}-${category}`,
    date,
    category,
    suggestion: ideas[(seed + index) % ideas.length],
    completed: false,
    result: "",
  }));
}

function loadExperienceData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const today = getLocalDateString();
      return { activeDate: today, plan: generateDailyPlan(today), logs: [] };
    }

    const parsed = JSON.parse(raw);
    const today = getLocalDateString();

    if (!parsed.activeDate || parsed.activeDate !== today) {
      return {
        activeDate: today,
        plan: generateDailyPlan(today),
        logs: parsed.logs || [],
      };
    }

    return parsed;
  } catch {
    const today = getLocalDateString();
    return { activeDate: today, plan: generateDailyPlan(today), logs: [] };
  }
}

export default function ExperiencesModule({ onSave }) {
  const [data, setData] = useState(() => loadExperienceData());
  const [customExperience, setCustomExperience] = useState(blankCustomExperience);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const completedToday = useMemo(() => {
    return data.plan.filter((item) => item.completed).length;
  }, [data.plan]);

  const categoryCounts = useMemo(() => {
    return data.logs.reduce((counts, log) => {
      counts[log.category] = (counts[log.category] || 0) + 1;
      return counts;
    }, {});
  }, [data.logs]);

  const topCategory = useMemo(() => {
    const entries = Object.entries(categoryCounts);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }, [categoryCounts]);

  function updatePlanResult(id, result) {
    setData((prev) => ({
      ...prev,
      plan: prev.plan.map((item) => (item.id === id ? { ...item, result } : item)),
    }));
  }

  function completeExperience(item) {
    const newLog = {
      id: makeId(),
      date: getLocalDateString(),
      createdAt: new Date().toLocaleString(),
      category: item.category,
      suggestion: item.suggestion,
      result: item.result || "Completed",
    };

    setData((prev) => ({
      ...prev,
      plan: prev.plan.map((experience) =>
        experience.id === item.id ? { ...experience, completed: true } : experience
      ),
      logs: [newLog, ...prev.logs],
    }));

    onSave?.(newLog);
  }

  function regeneratePlan() {
    const confirmed = window.confirm("Generate a fresh experience plan for today?");
    if (!confirmed) return;

    const today = getLocalDateString();
    setData((prev) => ({
      ...prev,
      activeDate: today,
      plan: generateDailyPlan(`${today}-${Date.now()}`),
    }));
  }

  function addCustomExperience() {
    if (!customExperience.suggestion.trim()) return;

    const newItem = {
      id: makeId(),
      date: getLocalDateString(),
      category: customExperience.category,
      suggestion: customExperience.suggestion.trim(),
      completed: false,
      result: "",
    };

    setData((prev) => ({ ...prev, plan: [newItem, ...prev.plan] }));
    setCustomExperience(blankCustomExperience);
  }

  function deleteLog(id) {
    const confirmed = window.confirm("Delete this experience log?");
    if (!confirmed) return;
    setData((prev) => ({ ...prev, logs: prev.logs.filter((log) => log.id !== id) }));
  }

  function clearLogs() {
    const confirmed = window.confirm("Clear all experience logs?");
    if (!confirmed) return;
    setData((prev) => ({ ...prev, logs: [] }));
  }

  return (
    <div className="experiences-module">
      <div className="module-status-grid">
        <div className="mini-stat"><Map size={20} /><div><span>Today</span><strong>{completedToday}/{data.plan.length}</strong></div></div>
        <div className="mini-stat"><CheckCircle2 size={20} /><div><span>Total Logs</span><strong>{data.logs.length}</strong></div></div>
        <div className="mini-stat"><Target size={20} /><div><span>Top Category</span><strong>{topCategory || "None"}</strong></div></div>
        <div className="mini-stat"><CalendarDays size={20} /><div><span>Plan Date</span><strong>{data.activeDate}</strong></div></div>
      </div>

      <div className="experiences-card">
        <div className="experiences-card-header"><p>Daily Field Orders</p><h3>Experience Suggestions</h3></div>
        <div className="module-actions">
          <button className="secondary-action" onClick={regeneratePlan}><RefreshCw size={18} /> Regenerate Today</button>
          <button className="secondary-action" onClick={clearLogs}>Clear Logs</button>
        </div>

        <div className="experience-plan-grid">
          {data.plan.map((item) => (
            <div key={item.id} className={`experience-card ${item.completed ? "completed" : ""}`}>
              <div className="experience-card-top"><span>{item.category}</span>{item.completed && <CheckCircle2 size={18} />}</div>
              <p>{item.suggestion}</p>
              <textarea value={item.result} onChange={(event) => updatePlanResult(item.id, event.target.value)} placeholder="Result, evidence, or notes" />
              <button className="primary-action" onClick={() => completeExperience(item)} disabled={item.completed}><Save size={18} /> {item.completed ? "Completed" : "Complete Field Order"}</button>
            </div>
          ))}
        </div>
      </div>

      <div className="experiences-card">
        <div className="experiences-card-header"><p>Manual Order</p><h3>Add Custom Experience</h3></div>
        <div className="experiences-form">
          <label><span>Category</span><select value={customExperience.category} onChange={(event) => setCustomExperience((prev) => ({ ...prev, category: event.target.value }))}>{Object.keys(experienceBank).map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="full-width"><span>Experience</span><textarea value={customExperience.suggestion} onChange={(event) => setCustomExperience((prev) => ({ ...prev, suggestion: event.target.value }))} placeholder="Add a custom field order." /></label>
        </div>
        <div className="module-actions"><button className="primary-action" onClick={addCustomExperience}><Sparkles size={18} /> Add Experience</button></div>
      </div>

      <div className="experiences-card">
        <div className="experiences-card-header"><p>Action History</p><h3>Recent Experience Logs</h3></div>
        {data.logs.length === 0 ? <p className="muted">No experiences completed yet.</p> : (
          <div className="experience-log-list">
            {data.logs.slice(0, 10).map((log) => (
              <div key={log.id} className="experience-log">
                <div className="experience-log-header"><div><strong>{log.category}</strong><span>{log.date}</span></div><button className="danger-action small" onClick={() => deleteLog(log.id)} aria-label="Delete experience log"><Trash2 size={14} /></button></div>
                <p><Compass size={14} /> {log.suggestion}</p>
                {log.result && <p><span>Result:</span> {log.result}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
