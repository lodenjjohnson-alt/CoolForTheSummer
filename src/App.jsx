import SkillTreeModule from "./modules/SkillTreeModule.jsx";
import LearningModule from "./modules/LearningModule.jsx";
import SchoolModule from "./modules/SchoolModule.jsx";
import HockeyModule from "./modules/HockeyModule.jsx";
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
import FitnessModule from "./modules/FitnessModule.jsx";
import React, { useMemo, useState } from "react";
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
  Shield,
} from "lucide-react";

const modules = [
  { key: "fitness", title: "Fitness Tracker", code: "FIT-01", icon: Dumbbell },
  { key: "hockey", title: "Hockey Tracker", code: "HKY-02", icon: Shield },
  { key: "school", title: "Summer School", code: "SCH-03", icon: GraduationCap },
  { key: "learning", title: "Learning Tracker", code: "INT-04", icon: BookOpen },
  { key: "skills", title: "Skill Tree", code: "SKL-05", icon: Brain },
  { key: "discipline", title: "Discipline Tracker", code: "DSC-06", icon: Flame },
  { key: "faith", title: "Faith Tracker", code: "FTH-07", icon: Cross },
  { key: "experiences", title: "Experiences", code: "FLD-08", icon: Map },
  { key: "reflection", title: "Nightly Reflection", code: "AAR-09", icon: Moon },
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

function getStatus(score) {
  if (score >= 85) return "Dominant";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Acceptable";
  return "Correction Required";
}

export default function App() {
  const [activeModule, setActiveModule] = useState("fitness");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);

  const score = useMemo(() => {
    return tasks.reduce((total, task) => total + (task.done ? task.points : 0), 0);
  }, [tasks]);

  const completed = tasks.filter((task) => task.done).length;
  const active = modules.find((module) => module.key === activeModule) ?? modules[0];
  const ActiveIcon = active.icon;

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
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

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Summer OS
            </motion.h1>

            <p className="slogan">Cool for the summer.</p>

            <p className="date-line">
              <CalendarDays size={16} />
             Operation Date: {getLocalDateString()}
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
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`task ${task.done ? "complete" : ""}`}
                >
                  <strong>{task.label}</strong>
                  <span>{task.points} points</span>
                </button>
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

{activeModule === "fitness" ? (
  <FitnessModule
    onSave={() => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === 1 ? { ...task, done: true } : task
        )
      );
    }}
  />
) : activeModule === "hockey" ? (
  <HockeyModule
    onSave={() => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === 2 ? { ...task, done: true } : task
        )
      );
    }}
  />
) : activeModule === "school" ? (
  <SchoolModule
    onSave={() => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === 3 ? { ...task, done: true } : task
        )
      );
    }}
  />
) : activeModule === "learning" ? (
  <LearningModule
    onSave={() => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === 4 ? { ...task, done: true } : task
        )
      );
    }}
  />
) : activeModule === "skills" ? (
  <SkillTreeModule
    onSave={() => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === 5 ? { ...task, done: true } : task
        )
      );
    }}
  />
) : (
  <p className="muted">
    This module shell is ready. Next, build this tracker as its own
    separate file.
  </p>
)}
          </div>
        </section>

        <section className="panel">
          <div className="section-title">
            <Archive size={24} />
            <h2>Next Build Step</h2>
          </div>

          <p className="muted">
            Once this deploys successfully, create{" "}
            <strong>src/modules/FitnessModule.jsx</strong>.
          </p>

          <p className="muted">
            Completed objectives: {completed}/{tasks.length}
          </p>
        </section>
      </main>
    </div>
  );
}
