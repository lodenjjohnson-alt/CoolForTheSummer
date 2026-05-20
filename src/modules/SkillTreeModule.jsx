import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  Brain,
  CheckCircle2,
  Plus,
  Save,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";

const STORAGE_KEY = "summer-os-skill-tree";

const defaultSkills = [
  "Cooking",
  "Coding",
  "Mechanics",
  "French",
  "Leadership",
  "Public speaking",
  "Sales/negotiation",
  "Photography/video",
  "Chess/strategy",
  "Survival/outdoorsmanship",
];

const blankSkillAction = {
  skill: "Cooking",
  action: "",
  xp: "10",
  difficulty: "",
  evidence: "",
  nextStep: "",
};

const blankNewSkill = {
  name: "",
  startingXP: "0",
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

function getLevel(xp) {
  return Math.max(1, Math.floor(Number(xp || 0) / 20) + 1);
}

function getProgressToNextLevel(xp) {
  return Number(xp || 0) % 20;
}

function makeInitialData() {
  return {
    skills: defaultSkills.map((name) => ({
      id: makeId(),
      name,
      xp:
        name === "Coding"
          ? 35
          : name === "French"
          ? 45
          : name === "Leadership"
          ? 30
          : 20,
    })),
    logs: [],
  };
}

function loadSkillTreeData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : makeInitialData();
  } catch {
    return makeInitialData();
  }
}

export default function SkillTreeModule({ onSave }) {
  const [data, setData] = useState(() => loadSkillTreeData());
  const [skillAction, setSkillAction] = useState(blankSkillAction);
  const [newSkill, setNewSkill] = useState(blankNewSkill);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const sortedSkills = useMemo(() => {
    return [...data.skills].sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0));
  }, [data.skills]);

  const totalXP = useMemo(() => {
    return data.skills.reduce((sum, skill) => sum + Number(skill.xp || 0), 0);
  }, [data.skills]);

  const highestSkill = sortedSkills[0] ?? null;
  const totalActions = data.logs.length;
  const averageLevel =
    data.skills.length > 0
      ? (
          data.skills.reduce((sum, skill) => sum + getLevel(skill.xp), 0) /
          data.skills.length
        ).toFixed(1)
      : "0";

  function updateActionField(field, value) {
    setSkillAction((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateNewSkillField(field, value) {
    setNewSkill((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function saveSkillAction() {
    const hasData = Object.values(skillAction).some((value) =>
      String(value).trim()
    );

    if (!hasData) return;

    const xpGain = Number(skillAction.xp) || 0;

    const newLog = {
      id: makeId(),
      date: getLocalDateString(),
      createdAt: new Date().toLocaleString(),
      ...skillAction,
      xpGain,
    };

    setData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.name === skillAction.skill
          ? { ...skill, xp: Math.max(0, Number(skill.xp || 0) + xpGain) }
          : skill
      ),
      logs: [newLog, ...prev.logs],
    }));

    setSkillAction(blankSkillAction);

    if (onSave) {
      onSave(newLog);
    }
  }

  function addNewSkill() {
    if (!newSkill.name.trim()) return;

    const exists = data.skills.some(
      (skill) => skill.name.toLowerCase() === newSkill.name.trim().toLowerCase()
    );

    if (exists) return;

    const skill = {
      id: makeId(),
      name: newSkill.name.trim(),
      xp: Number(newSkill.startingXP) || 0,
    };

    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));

    setSkillAction((prev) => ({
      ...prev,
      skill: skill.name,
    }));

    setNewSkill(blankNewSkill);
  }

  function deleteSkill(skillId) {
    const confirmed = window.confirm(
      "Delete this skill? Logs will remain, but the skill will leave the tree."
    );

    if (!confirmed) return;

    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== skillId),
    }));
  }

  function deleteLog(logId) {
    const confirmed = window.confirm("Delete this skill action log?");
    if (!confirmed) return;

    setData((prev) => ({
      ...prev,
      logs: prev.logs.filter((log) => log.id !== logId),
    }));
  }

  function resetSkillTree() {
    const confirmed = window.confirm("Reset the entire skill tree?");
    if (!confirmed) return;

    setData(makeInitialData());
    setSkillAction(blankSkillAction);
    setNewSkill(blankNewSkill);
  }

  const skillOptions = data.skills.map((skill) => skill.name);

  return (
    <div className="skill-tree-module">
      <div className="module-status-grid">
        <div className="mini-stat">
          <Brain size={20} />
          <div>
            <span>Total Skills</span>
            <strong>{data.skills.length}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <Award size={20} />
          <div>
            <span>Total XP</span>
            <strong>{totalXP}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <TrendingUp size={20} />
          <div>
            <span>Top Skill</span>
            <strong>{highestSkill?.name || "None"}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <Target size={20} />
          <div>
            <span>Avg Level</span>
            <strong>{averageLevel}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <CheckCircle2 size={20} />
          <div>
            <span>Actions</span>
            <strong>{totalActions}</strong>
          </div>
        </div>
      </div>

      <div className="skill-command-layout">
        <div className="skill-command-column">
          <div className="skill-panel">
            <div className="skill-panel-header">
              <div>
                <p>Skill Command</p>
                <h3>Log Action</h3>
              </div>
            </div>

            <div className="skill-form compact">
              <label>
                <span>Skill</span>
                <select
                  value={skillAction.skill}
                  onChange={(event) =>
                    updateActionField("skill", event.target.value)
                  }
                >
                  {skillOptions.map((skill) => (
                    <option key={skill}>{skill}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>XP Gain</span>
                <input
                  value={skillAction.xp}
                  onChange={(event) => updateActionField("xp", event.target.value)}
                  placeholder="10"
                />
              </label>

              <label>
                <span>Difficulty</span>
                <input
                  value={skillAction.difficulty}
                  onChange={(event) =>
                    updateActionField("difficulty", event.target.value)
                  }
                  placeholder="1-10"
                />
              </label>

              <label className="full-width">
                <span>Action Completed</span>
                <textarea
                  value={skillAction.action}
                  onChange={(event) =>
                    updateActionField("action", event.target.value)
                  }
                  placeholder="What did you do?"
                />
              </label>

              <label className="full-width">
                <span>Evidence</span>
                <textarea
                  value={skillAction.evidence}
                  onChange={(event) =>
                    updateActionField("evidence", event.target.value)
                  }
                  placeholder="What proves improvement?"
                />
              </label>

              <label className="full-width">
                <span>Next Step</span>
                <textarea
                  value={skillAction.nextStep}
                  onChange={(event) =>
                    updateActionField("nextStep", event.target.value)
                  }
                  placeholder="What should happen next?"
                />
              </label>
            </div>

            <div className="module-actions">
              <button className="primary-action" onClick={saveSkillAction}>
                <Save size={18} />
                Save Skill Action
              </button>

              <button className="secondary-action" onClick={resetSkillTree}>
                Reset Tree
              </button>
            </div>
          </div>

          <div className="skill-panel">
            <div className="skill-panel-header">
              <div>
                <p>Expansion</p>
                <h3>Add New Skill</h3>
              </div>
            </div>

            <div className="skill-form compact">
              <label>
                <span>Skill Name</span>
                <input
                  value={newSkill.name}
                  onChange={(event) =>
                    updateNewSkillField("name", event.target.value)
                  }
                  placeholder="New skill"
                />
              </label>

              <label>
                <span>Starting XP</span>
                <input
                  value={newSkill.startingXP}
                  onChange={(event) =>
                    updateNewSkillField("startingXP", event.target.value)
                  }
                  placeholder="0"
                />
              </label>
            </div>

            <div className="module-actions">
              <button className="primary-action" onClick={addNewSkill}>
                <Plus size={18} />
                Add Skill
              </button>
            </div>
          </div>
        </div>

        <div className="skill-panel skill-roster-panel">
          <div className="skill-panel-header">
            <div>
              <p>Asset Roster</p>
              <h3>Skill Levels</h3>
            </div>
          </div>

          <div className="skill-roster">
            {sortedSkills.map((skill, index) => {
              const level = getLevel(skill.xp);
              const progress = getProgressToNextLevel(skill.xp);
              const percent = Math.min(100, (progress / 20) * 100);

              return (
                <div key={skill.id} className="skill-row">
                  <div className="skill-rank">#{index + 1}</div>

                  <div className="skill-main">
                    <div className="skill-row-top">
                      <strong>{skill.name}</strong>
                      <span>Level {level}</span>
                    </div>

                    <div className="skill-progress-bar">
                      <div style={{ width: `${percent}%` }} />
                    </div>

                    <p>
                      {skill.xp} XP · {20 - progress} XP until next level
                    </p>
                  </div>

                  <button
                    className="danger-action small"
                    onClick={() => deleteSkill(skill.id)}
                    aria-label="Delete skill"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="skill-panel">
        <div className="skill-panel-header">
          <div>
            <p>Action History</p>
            <h3>Recent Skill Actions</h3>
          </div>
        </div>

        {data.logs.length === 0 ? (
          <p className="muted">No skill actions logged yet.</p>
        ) : (
          <div className="skill-log-list">
            {data.logs.slice(0, 8).map((log) => (
              <div key={log.id} className="skill-log">
                <div className="skill-log-header">
                  <div>
                    <strong>{log.skill}</strong>
                    <span>
                      {log.date} · +{log.xpGain} XP
                    </span>
                  </div>

                  <button
                    className="danger-action small"
                    onClick={() => deleteLog(log.id)}
                    aria-label="Delete skill log"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {log.action && (
                  <p>
                    <span>Action:</span> {log.action}
                  </p>
                )}

                {log.evidence && (
                  <p>
                    <span>Evidence:</span> {log.evidence}
                  </p>
                )}

                {log.nextStep && (
                  <p>
                    <span>Next:</span> {log.nextStep}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
