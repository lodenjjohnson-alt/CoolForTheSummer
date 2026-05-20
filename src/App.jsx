import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  BookOpen,
  Brain,
  CalendarDays,
  Cross,
  Dumbbell,
  Flame,
  GraduationCap,
  Map,
  Moon,
  PanelLeftClose,
  Radio,
  RefreshCw,
  Shield,
  Trash2,
} from "lucide-react";
import FitnessModule from "./modules/FitnessModule.jsx";
import HockeyModule from "./modules/HockeyModule.jsx";
import SchoolModule from "./modules/SchoolModule.jsx";
import LearningModule from "./modules/LearningModule.jsx";
import SkillTreeModule from "./modules/SkillTreeModule.jsx";
import DisciplineModule from "./modules/DisciplineModule.jsx";
import FaithModule from "./modules/FaithModule.jsx";
import ExperiencesModule from "./modules/ExperiencesModule.jsx";
import ReflectionModule from "./modules/ReflectionModule.jsx";
import RewardsPanel from "./components/RewardsPanel.jsx";

const DAILY_MISSION_STORAGE_KEY = "summer-os-daily-mission-state";
const OPERATION_ARCHIVE_STORAGE_KEY = "summer-os-operation-archive";
const MAX_ARCHIVED_OPERATIONS = 75;

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function makeId(prefix = "operation") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const modules = [
  { key: "fitness", taskId: 1, title: "Fitness Tracker", code: "FIT-01", icon: Dumbbell },
  { key: "hockey", taskId: 2, title: "Hockey Tracker", code: "HKY-02", icon: Shield },
  { key: "school", taskId: 3, title: "Summer School", code: "SCH-03", icon: GraduationCap },
  { key: "learning", taskId: 4, title: "Learning Tracker", code: "INT-04", icon: BookOpen },
  { key: "skills", taskId: 5, title: "Skill Tree", code: "SKL-05", icon: Brain },
  { key: "discipline", taskId: 6, title: "Discipline Tracker", code: "DSC-06", icon: Flame },
  { key: "faith", taskId: 7, title: "Faith Tracker", code: "FTH-07", icon: Cross },
  { key: "experiences", taskId: 8, title: "Experiences", code: "FLD-08", icon: Map },
  { key: "reflection", taskId: 9, title: "Nightly Reflection", code: "AAR-09", icon: Moon },
];

const initialTasks = [
  { id: 1, label: "Execute fitness training", points: 12, done: false },
  { id: 2, label: "Submit hockey development report", points: 12, done: false },
  { id: 3, label: "Complete summer school objective", points: 10, done: false },
  { id: 4, label: "Complete intelligence study block", points: 8, done: false },
  { id: 5, label: "Advance one skill asset", points: 8, done: false },
  { id: 6, label: "Win discipline checkpoint", points: 15, done: false },
  { id: 7, label: "Complete faith formation block", points: 10, done: false },
  { id: 8, label: "Complete field experience", points: 10, done: false },
  { id: 9, label: "File nightly after-action report", points: 15, done: false },
];

function makeFreshTasks() {
  return initialTasks.map((task) => ({ ...task, done: false }));
}

function makeFreshMissionState(date = getLocalDateString()) {
  return { date, tasks: makeFreshTasks(), claimedRewards: [] };
}

function mergeSavedTasks(savedTasks) {
  if (!Array.isArray(savedTasks)) return makeFreshTasks();

  return initialTasks.map((task) => {
    const savedTask = savedTasks.find((item) => item.id === task.id);
    return { ...task, done: Boolean(savedTask?.done) };
  });
}

function mergeClaimedRewards(claimedRewards) {
  return Array.isArray(claimedRewards) ? claimedRewards : [];
}

function calculateScore(tasks) {
  return tasks.reduce((total, task) => total + (task.done ? task.points : 0), 0);
}

function getStatus(score) {
  if (score >= 85) return "Dominant";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Acceptable";
  return "Correction Required";
}

function makeOperationSnapshot(missionState, source = "manual") {
  const tasks = mergeSavedTasks(missionState.tasks);
  const score = calculateScore(tasks);
  const completedTasks = tasks.filter((task) => task.done);
  const missedTasks = tasks.filter((task) => !task.done);
  const claimedRewards = mergeClaimedRewards(missionState.claimedRewards);

  return {
    id: makeId("operation"),
    date: missionState.date || getLocalDateString(),
    archivedAt: new Date().toLocaleString(),
    source,
    score,
    status: getStatus(score),
    completedCount: completedTasks.length,
    totalCount: tasks.length,
    completedTasks,
    missedTasks,
    claimedRewards,
    tasks,
  };
}

function loadDailyMissionState() {
  const today = getLocalDateString();

  try {
    const raw = localStorage.getItem(DAILY_MISSION_STORAGE_KEY);
    if (!raw) return makeFreshMissionState(today);

    const parsed = JSON.parse(raw);
    return {
      date: parsed?.date || today,
      tasks: mergeSavedTasks(parsed?.tasks),
      claimedRewards: mergeClaimedRewards(parsed?.claimedRewards),
    };
  } catch {
    return makeFreshMissionState(today);
  }
}

function loadOperationArchive() {
  try {
    const raw = localStorage.getItem(OPERATION_ARCHIVE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function shouldAutoArchive(missionState) {
  return (
    missionState.tasks.some((task) => task.done) ||
    mergeClaimedRewards(missionState.claimedRewards).length > 0
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState("fitness");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [missionState, setMissionState] = useState(() => loadDailyMissionState());
  const [operationArchive, setOperationArchive] = useState(() => loadOperationArchive());
  const [selectedOperationId, setSelectedOperationId] = useState("");

  const tasks = missionState.tasks;
  const operationDate = missionState.date;
  const claimedRewards = mergeClaimedRewards(missionState.claimedRewards);

  useEffect(() => {
    localStorage.setItem(DAILY_MISSION_STORAGE_KEY, JSON.stringify(missionState));
  }, [missionState]);

  useEffect(() => {
    localStorage.setItem(OPERATION_ARCHIVE_STORAGE_KEY, JSON.stringify(operationArchive));
  }, [operationArchive]);

  useEffect(() => {
    function resetIfDateChanged() {
      const today = getLocalDateString();

      setMissionState((prev) => {
        if (prev.date === today) return prev;

        if (shouldAutoArchive(prev)) {
          const snapshot = makeOperationSnapshot(prev, "automatic rollover");
          setOperationArchive((archive) => [snapshot, ...archive].slice(0, MAX_ARCHIVED_OPERATIONS));
        }

        return makeFreshMissionState(today);
      });
    }

    resetIfDateChanged();
    const intervalId = window.setInterval(resetIfDateChanged, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const score = useMemo(() => calculateScore(tasks), [tasks]);
  const completed = tasks.filter((task) => task.done).length;
  const active = modules.find((module) => module.key === activeModule) ?? modules[0];
  const ActiveIcon = active.icon;
  const selectedOperation =
    operationArchive.find((operation) => operation.id === selectedOperationId) ??
    operationArchive[0] ??
    null;

  function completeTask(taskId) {
    setMissionState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId ? { ...task, done: true } : task
      ),
    }));
  }

  function claimReward(tier) {
    setMissionState((prev) => {
      const alreadyClaimed = mergeClaimedRewards(prev.claimedRewards).some(
        (reward) => reward.tierId === tier.id
      );

      if (alreadyClaimed) return prev;

      return {
        ...prev,
        claimedRewards: [
          ...mergeClaimedRewards(prev.claimedRewards),
          {
            id: makeId("reward"),
            tierId: tier.id,
            title: tier.title,
            points: tier.points,
            claimedAt: new Date().toLocaleString(),
          },
        ],
      };
    });
  }

  function startNewOperation() {
    const confirmed = window.confirm(
      "Archive the current operation and start a new operation? This resets today's mission checklist and reward claims."
    );
    if (!confirmed) return;

    setMissionState((prev) => {
      const snapshot = makeOperationSnapshot(prev, "manual start new operation");
      setOperationArchive((archive) => [snapshot, ...archive].slice(0, MAX_ARCHIVED_OPERATIONS));
      setSelectedOperationId(snapshot.id);
      return makeFreshMissionState(getLocalDateString());
    });
  }

  function deleteArchivedOperation(operationId) {
    const confirmed = window.confirm("Delete this archived operation?");
    if (!confirmed) return;

    setOperationArchive((archive) => archive.filter((operation) => operation.id !== operationId));
    if (selectedOperationId === operationId) setSelectedOperationId("");
  }

  function clearOperationArchive() {
    const confirmed = window.confirm("Clear the entire operation archive?");
    if (!confirmed) return;

    setOperationArchive([]);
    setSelectedOperationId("");
  }

  function renderActiveModule() {
    const onSave = () => completeTask(active.taskId);

    if (activeModule === "fitness") return <FitnessModule onSave={onSave} />;
    if (activeModule === "hockey") return <HockeyModule onSave={onSave} />;
    if (activeModule === "school") return <SchoolModule onSave={onSave} />;
    if (activeModule === "learning") return <LearningModule onSave={onSave} />;
    if (activeModule === "skills") return <SkillTreeModule onSave={onSave} />;
    if (activeModule === "discipline") return <DisciplineModule onSave={onSave} />;
    if (activeModule === "faith") return <FaithModule onSave={onSave} />;
    if (activeModule === "experiences") return <ExperiencesModule onSave={onSave} />;
    if (activeModule === "reflection") return <ReflectionModule onSave={onSave} />;

    return (
      <p className="muted">
        This module shell is ready. Next, build this tracker as its own separate file.
      </p>
    );
  }

  return (
    <div className="app">
      {sidebarOpen && (
        <button
          className="overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close command rail"
        />
      )}

      <aside className={`command-rail ${sidebarOpen ? "open" : ""}`}>
        <div className="rail-header">
          <div>
            <p className="eyebrow">Module Select</p>
            <h2>Command Rail</h2>
          </div>

          <button className="icon-button" onClick={() => setSidebarOpen(false)}>
            <PanelLeftClose size={20} />
          </button>
        </div>

        <nav className="module-list">
          {modules.map((module) => {
            const Icon = module.icon;
            const selected = activeModule === module.key;

            return (
              <button
                key={module.key}
                className={`module-button ${selected ? "selected" : ""}`}
                onClick={() => {
                  setActiveModule(module.key);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={22} />
                <div>
                  <p>{module.code}</p>
                  <strong>{module.title}</strong>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {!sidebarOpen && (
        <button
          className="pull-tab"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open command rail"
        >
          <span />
          <span />
          <span />
        </button>
      )}

      <main className="shell">
        <header className="hero">
          <div>
            <div className="interface-label">
              <Radio size={16} />
              Active Command Interface
            </div>

            <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              Summer OS
            </motion.h1>

            <p className="slogan">Cool for the summer.</p>

            <p className="date-line">
              <CalendarDays size={16} />
              Operation Date: {operationDate}
            </p>
          </div>

          <div className="score-card">
            <p>Readiness Score</p>
            <strong>{score}</strong>
            <span>{getStatus(score)}</span>
          </div>
        </header>

        <section className="grid">
          <div className="panel wide">
            <h2>Today's Mission</h2>

            <div className="task-grid">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`task ${task.done ? "complete" : ""}`}
                  aria-label={`${task.label}: ${task.done ? "complete" : "incomplete"}`}
                >
                  <strong>{task.label}</strong>
                  <span>{task.done ? "Logged" : "Requires module log"} · {task.points} points</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>Active Module</h2>

            <div className="active-module">
              <ActiveIcon size={30} />
              <div>
                <p>{active.code}</p>
                <strong>{active.title}</strong>
              </div>
            </div>

            {renderActiveModule()}
          </div>
        </section>

        <RewardsPanel
          score={score}
          claimedRewards={claimedRewards}
          onClaimReward={claimReward}
        />

        <section className="panel operation-control-panel">
          <div className="section-title">
            <Archive size={24} />
            <h2>Operation Control</h2>
          </div>

          <p className="muted">
            Archive the current mission board and reset the daily checklist when you want to begin a new operation.
          </p>

          <div className="module-actions">
            <button className="primary-action" onClick={startNewOperation}>
              <RefreshCw size={18} />
              Start New Operation
            </button>

            <button className="secondary-action" onClick={clearOperationArchive}>
              Clear Archive
            </button>
          </div>
        </section>

        <section className="panel operation-archive-panel">
          <div className="section-title">
            <Archive size={24} />
            <h2>Operation Archive</h2>
          </div>

          {operationArchive.length === 0 ? (
            <p className="muted">No archived operations yet.</p>
          ) : (
            <div className="operation-archive-layout">
              <div className="operation-archive-list">
                {operationArchive.map((operation) => (
                  <button
                    key={operation.id}
                    className={`operation-archive-button ${selectedOperation?.id === operation.id ? "selected" : ""}`}
                    onClick={() => setSelectedOperationId(operation.id)}
                  >
                    <strong>{operation.date}</strong>
                    <span>{operation.score} pts · {operation.status}</span>
                    <small>{operation.completedCount}/{operation.totalCount} missions</small>
                  </button>
                ))}
              </div>

              {selectedOperation && (
                <div className="operation-archive-detail">
                  <div className="operation-archive-detail-header">
                    <div>
                      <p>Archived Operation</p>
                      <h3>{selectedOperation.date}</h3>
                      <span>{selectedOperation.archivedAt} · {selectedOperation.source}</span>
                    </div>

                    <button
                      className="danger-action small"
                      onClick={() => deleteArchivedOperation(selectedOperation.id)}
                      aria-label="Delete archived operation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="operation-score-grid">
                    <div><span>Score</span><strong>{selectedOperation.score}</strong></div>
                    <div><span>Status</span><strong>{selectedOperation.status}</strong></div>
                    <div><span>Complete</span><strong>{selectedOperation.completedCount}/{selectedOperation.totalCount}</strong></div>
                  </div>

                  {Array.isArray(selectedOperation.claimedRewards) && selectedOperation.claimedRewards.length > 0 && (
                    <div className="operation-claimed-rewards">
                      <h4>Claimed Rewards</h4>
                      {selectedOperation.claimedRewards.map((reward) => (
                        <p key={reward.id}>{reward.title} · {reward.points} pts</p>
                      ))}
                    </div>
                  )}

                  <div className="operation-task-columns">
                    <div>
                      <h4>Completed Missions</h4>
                      {selectedOperation.completedTasks.length === 0 ? (
                        <p className="muted">None completed.</p>
                      ) : (
                        selectedOperation.completedTasks.map((task) => (
                          <p key={task.id} className="operation-task-line complete">{task.label}</p>
                        ))
                      )}
                    </div>

                    <div>
                      <h4>Missed Missions</h4>
                      {selectedOperation.missedTasks.length === 0 ? (
                        <p className="muted">No missed missions.</p>
                      ) : (
                        selectedOperation.missedTasks.map((task) => (
                          <p key={task.id} className="operation-task-line missed">{task.label}</p>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-title">
            <Archive size={24} />
            <h2>Build Status</h2>
          </div>

          <p className="muted">
            Rewards system active. Operation archive active. Daily mission tasks are locked to module logs. Completed objectives: {completed}/{tasks.length}.
          </p>
        </section>
      </main>
    </div>
  );
}
