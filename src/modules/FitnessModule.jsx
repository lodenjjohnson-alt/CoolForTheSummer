import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Battery,
  Bed,
  Dumbbell,
  Flame,
  HeartPulse,
  Save,
  Timer,
} from "lucide-react";

const STORAGE_KEY = "summer-os-fitness-logs";

const blankFitnessEntry = {
  workoutType: "",
  duration: "",
  sleepHours: "",
  energyLevel: "",
  whoopStrain: "",
  whoopRecovery: "",
  hrv: "",
  restingHeartRate: "",
  sleepPerformance: "",
  caloriesBurned: "",
  soreness: "",
  notes: "",
};

function todayISO() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function loadFitnessLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function FitnessModule({ onSave }) {
  const [entry, setEntry] = useState(blankFitnessEntry);
  const [logs, setLogs] = useState(() => loadFitnessLogs());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const latestLog = logs[0];

  const averageEnergy = useMemo(() => {
    const valid = logs
      .map((log) => Number(log.energyLevel))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (valid.length === 0) return null;

    const average = valid.reduce((sum, value) => sum + value, 0) / valid.length;
    return average.toFixed(1);
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
      id: crypto.randomUUID(),
      date: todayISO(),
      createdAt: new Date().toLocaleString(),
      ...entry,
    };

    setLogs((prev) => [newLog, ...prev]);
    setEntry(blankFitnessEntry);

    if (onSave) {
      onSave(newLog);
    }
  }

  function clearLogs() {
    const confirmed = window.confirm("Clear all fitness logs?");
    if (!confirmed) return;
    setLogs([]);
  }

  return (
    <div className="fitness-module">
      <div className="module-status-grid">
        <div className="mini-stat">
          <Dumbbell size={20} />
          <div>
            <span>Total Logs</span>
            <strong>{logs.length}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <Battery size={20} />
          <div>
            <span>Avg Energy</span>
            <strong>{averageEnergy ? `${averageEnergy}/10` : "None"}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <HeartPulse size={20} />
          <div>
            <span>Latest Recovery</span>
            <strong>{latestLog?.whoopRecovery || "None"}</strong>
          </div>
        </div>
      </div>

      <div className="fitness-form">
        <label>
          <span>Workout Type</span>
          <input
            value={entry.workoutType}
            onChange={(event) => updateField("workoutType", event.target.value)}
            placeholder="Lift, sprint, mobility, conditioning"
          />
        </label>

        <label>
          <span>Duration</span>
          <input
            value={entry.duration}
            onChange={(event) => updateField("duration", event.target.value)}
            placeholder="60 min"
          />
        </label>

        <label>
          <span>Sleep Hours</span>
          <input
            value={entry.sleepHours}
            onChange={(event) => updateField("sleepHours", event.target.value)}
            placeholder="8.2"
          />
        </label>

        <label>
          <span>Energy Level</span>
          <input
            value={entry.energyLevel}
            onChange={(event) => updateField("energyLevel", event.target.value)}
            placeholder="1-10"
          />
        </label>

        <label>
          <span>WHOOP Strain</span>
          <input
            value={entry.whoopStrain}
            onChange={(event) => updateField("whoopStrain", event.target.value)}
            placeholder="14.7"
          />
        </label>

        <label>
          <span>WHOOP Recovery %</span>
          <input
            value={entry.whoopRecovery}
            onChange={(event) => updateField("whoopRecovery", event.target.value)}
            placeholder="82"
          />
        </label>

        <label>
          <span>HRV</span>
          <input
            value={entry.hrv}
            onChange={(event) => updateField("hrv", event.target.value)}
            placeholder="ms"
          />
        </label>

        <label>
          <span>Resting Heart Rate</span>
          <input
            value={entry.restingHeartRate}
            onChange={(event) =>
              updateField("restingHeartRate", event.target.value)
            }
            placeholder="bpm"
          />
        </label>

        <label>
          <span>Sleep Performance %</span>
          <input
            value={entry.sleepPerformance}
            onChange={(event) =>
              updateField("sleepPerformance", event.target.value)
            }
            placeholder="93"
          />
        </label>

        <label>
          <span>Calories Burned</span>
          <input
            value={entry.caloriesBurned}
            onChange={(event) =>
              updateField("caloriesBurned", event.target.value)
            }
            placeholder="optional"
          />
        </label>

        <label>
          <span>Soreness</span>
          <input
            value={entry.soreness}
            onChange={(event) => updateField("soreness", event.target.value)}
            placeholder="1-10 or notes"
          />
        </label>

        <label className="full-width">
          <span>Training Notes</span>
          <textarea
            value={entry.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="What happened? What needs adjustment?"
          />
        </label>
      </div>

      <div className="module-actions">
        <button className="primary-action" onClick={saveEntry}>
          <Save size={18} />
          Save Fitness Report
        </button>

        <button className="secondary-action" onClick={clearLogs}>
          Clear Logs
        </button>
      </div>

      <div className="recent-logs">
        <h3>Recent Fitness Reports</h3>

        {logs.length === 0 ? (
          <p className="muted">No fitness reports filed yet.</p>
        ) : (
          logs.slice(0, 5).map((log) => (
            <div key={log.id} className="fitness-log">
              <div className="fitness-log-header">
                <strong>{log.workoutType || "Fitness Report"}</strong>
                <span>{log.date}</span>
              </div>

              <div className="fitness-log-grid">
                <p>
                  <Timer size={14} />
                  Duration: {log.duration || "None"}
                </p>
                <p>
                  <Bed size={14} />
                  Sleep: {log.sleepHours || "None"}
                </p>
                <p>
                  <Battery size={14} />
                  Energy: {log.energyLevel || "None"}
                </p>
                <p>
                  <Activity size={14} />
                  Strain: {log.whoopStrain || "None"}
                </p>
                <p>
                  <HeartPulse size={14} />
                  Recovery: {log.whoopRecovery || "None"}
                </p>
                <p>
                  <Flame size={14} />
                  Calories: {log.caloriesBurned || "None"}
                </p>
              </div>

              {log.notes && <p className="log-notes">{log.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
