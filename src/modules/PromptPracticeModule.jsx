import React, { useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Dice5,
  MessageSquare,
  Save,
  Target,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "summer-os-response-practice-logs";

const responsePrompts = [
  { id: 1, category: "Hockey Pressure", text: "You gave up a soft goal early in a showcase game. A teammate says, “You have to have that.” Respond with calm ownership without sounding weak." },
  { id: 2, category: "Hockey Pressure", text: "A coach tells you after practice that you are sliding too much and getting off angle. Respond like a serious goalie who wants correction." },
  { id: 3, category: "Hockey Pressure", text: "A scout asks what separates you from other goalies your age. Give a confident answer without bragging." },
  { id: 4, category: "Hockey Pressure", text: "A teammate blames you for a loss when the team played poorly in front of you. Respond without being defensive." },
  { id: 5, category: "Hockey Pressure", text: "Your goalie coach says your glove looks lazy today. Respond in a way that earns respect." },
  { id: 6, category: "Hockey Pressure", text: "You are pulled from a game. A teammate asks what happened. Respond with composure and accountability." },
  { id: 7, category: "Hockey Pressure", text: "A younger goalie asks you for advice before a tryout. Give him a clear, useful answer." },
  { id: 8, category: "Hockey Pressure", text: "A coach asks why you deserve more starts. Respond with evidence, humility, and confidence." },
  { id: 9, category: "Hockey Pressure", text: "You lose a game in overtime after playing well. A parent says, “Tough break.” Respond with maturity." },
  { id: 10, category: "Hockey Pressure", text: "A teammate is joking about your save percentage. Respond in a way that shows confidence without insecurity." },
  { id: 11, category: "Leadership", text: "A teammate keeps skipping effort during conditioning. Confront him directly but respectfully." },
  { id: 12, category: "Leadership", text: "A younger player is embarrassed after making a mistake in front of the group. Respond as a leader." },
  { id: 13, category: "Leadership", text: "Your group is wasting time before a serious workout. Get everyone moving without sounding annoying." },
  { id: 14, category: "Leadership", text: "Someone asks why you take your goals so seriously. Respond with conviction." },
  { id: 15, category: "Leadership", text: "A friend says discipline is boring and you should relax more. Respond without sounding self-righteous." },
  { id: 16, category: "Leadership", text: "You need to apologize after being too harsh. Say it clearly without overexplaining." },
  { id: 17, category: "Leadership", text: "A teammate asks for honest feedback, but the truth is uncomfortable. Give the feedback cleanly." },
  { id: 18, category: "Leadership", text: "A group decision is going in a lazy direction. Push for the higher standard." },
  { id: 19, category: "Leadership", text: "Someone accuses you of thinking you are better than everyone. Respond with humility and strength." },
  { id: 20, category: "Leadership", text: "A younger kid is copying bad behavior from older players. Correct him without humiliating him." },
  { id: 21, category: "Social Skill", text: "You meet a girl you do not know at a school event. Start a normal conversation without trying too hard." },
  { id: 22, category: "Social Skill", text: "A conversation goes quiet. Restart it with confidence." },
  { id: 23, category: "Social Skill", text: "Someone makes a joke at your expense in front of others. Respond with a calm, witty boundary." },
  { id: 24, category: "Social Skill", text: "You want to join a conversation already happening. Say something natural." },
  { id: 25, category: "Social Skill", text: "A friend is clearly upset but says he is fine. Respond in a way that opens the door without forcing it." },
  { id: 26, category: "Social Skill", text: "Someone gives you a compliment. Accept it confidently without deflecting." },
  { id: 27, category: "Social Skill", text: "You disagree with someone in class. Respond firmly without sounding hostile." },
  { id: 28, category: "Social Skill", text: "You are talking too much about your goals and notice people disengaging. Redirect the conversation." },
  { id: 29, category: "Social Skill", text: "A person you barely know asks what you do for fun. Answer in a way that is interesting but not fake." },
  { id: 30, category: "Social Skill", text: "You need to leave a conversation politely because you have work to do. Say it cleanly." },
  { id: 31, category: "Faith and Character", text: "Someone asks why you pray every day. Give a clear answer without preaching at them." },
  { id: 32, category: "Faith and Character", text: "You lied about something small and need to correct it. Say the truth directly." },
  { id: 33, category: "Faith and Character", text: "You took something that was not yours and need to make it right. Respond with accountability." },
  { id: 34, category: "Faith and Character", text: "A friend mocks Christianity around you. Respond with confidence and restraint." },
  { id: 35, category: "Faith and Character", text: "You failed morally and feel disappointed. State how you will respond without making excuses." },
  { id: 36, category: "Faith and Character", text: "Someone asks what kind of man you are trying to become. Answer from your values." },
  { id: 37, category: "Faith and Character", text: "You are tempted to cut a corner because nobody would know. Talk yourself through the right decision." },
  { id: 38, category: "Faith and Character", text: "A teammate is gossiping about someone. Redirect the conversation." },
  { id: 39, category: "Faith and Character", text: "You need to forgive someone who annoyed you. Say what you would tell yourself." },
  { id: 40, category: "Faith and Character", text: "A coach asks what integrity means to you. Give a concise answer." },
  { id: 41, category: "Discipline", text: "You wake up tired and want to scroll in bed. Write the command you give yourself." },
  { id: 42, category: "Discipline", text: "You are bored before homework and want to waste time. Respond to yourself with a strict reset." },
  { id: 43, category: "Discipline", text: "You see sugary food after dinner and want to overeat. Practice the response that protects the standard." },
  { id: 44, category: "Discipline", text: "You miss a planned workout. Explain the correction without self-pity." },
  { id: 45, category: "Discipline", text: "You have 20 minutes of free time and feel tempted to waste it. Decide what you say and do." },
  { id: 46, category: "Discipline", text: "You are rationalizing a bad habit by saying, “Just once.” Counter that thought." },
  { id: 47, category: "Discipline", text: "You feel unmotivated because progress is slow. Respond like a disciplined person." },
  { id: 48, category: "Discipline", text: "You catch yourself making excuses. State the truth and next action." },
  { id: 49, category: "Discipline", text: "You are alone with no accountability. Give yourself the standard." },
  { id: 50, category: "Discipline", text: "You failed the same habit again. Respond with correction, not drama." },
  { id: 51, category: "Academics", text: "A teacher asks why your assignment is late. Respond honestly and professionally." },
  { id: 52, category: "Academics", text: "You need to ask for help in advanced precalculus without sounding helpless." },
  { id: 53, category: "Academics", text: "A classmate asks how you stay productive. Give a useful answer." },
  { id: 54, category: "Academics", text: "You disagree with feedback on an essay. Respond respectfully and intelligently." },
  { id: 55, category: "Academics", text: "You need to email a teacher about improving your grade. Say the core message." },
  { id: 56, category: "Academics", text: "You are assigned a group project and nobody is leading. Take initiative." },
  { id: 57, category: "Academics", text: "Someone says school does not matter if you are chasing hockey. Respond with a long-term view." },
  { id: 58, category: "Academics", text: "You get a bad test grade. Explain your correction plan." },
  { id: 59, category: "Academics", text: "You need to present a controversial idea in class. Open with balance and credibility." },
  { id: 60, category: "Academics", text: "A teacher asks what your project proposal is. Explain it in under 30 seconds." },
  { id: 61, category: "Business and Money", text: "A potential customer asks why they should hire your mowing or cleaning service. Give your pitch." },
  { id: 62, category: "Business and Money", text: "Someone says your business idea is too small to matter. Respond with strategic confidence." },
  { id: 63, category: "Business and Money", text: "You need to negotiate a fair price without sounding desperate." },
  { id: 64, category: "Business and Money", text: "A customer complains about the quality of your work. Respond professionally." },
  { id: 65, category: "Business and Money", text: "You are pitching a newsletter idea to inform the public about FDA-related updates. Make the pitch clear." },
  { id: 66, category: "Business and Money", text: "An adult asks what your long-term financial goal is. Answer ambitiously but realistically." },
  { id: 67, category: "Business and Money", text: "You made a beginner investing mistake. Explain what you learned." },
  { id: 68, category: "Business and Money", text: "You need to ask someone for advice or mentorship. Practice the ask." },
  { id: 69, category: "Business and Money", text: "A friend wants you to spend money impulsively. Respond with discipline." },
  { id: 70, category: "Business and Money", text: "You need to explain why reputation matters in business. Give a concise answer." },
  { id: 71, category: "Family", text: "Your younger sibling is annoying you while you are trying to work. Respond firmly without being cruel." },
  { id: 72, category: "Family", text: "Your parents question whether you are too focused on your goals. Respond with respect and clarity." },
  { id: 73, category: "Family", text: "You need to thank your mom or dad for supporting your hockey path. Say it directly." },
  { id: 74, category: "Family", text: "A family member interrupts your routine. Set a boundary without disrespect." },
  { id: 75, category: "Family", text: "You were impatient with your sibling and need to apologize." },
  { id: 76, category: "Family", text: "Your parents give advice you do not want to hear. Respond maturely." },
  { id: 77, category: "Family", text: "You need to explain your summer plan to your family so they understand it." },
  { id: 78, category: "Family", text: "Your sibling wants attention while you are exhausted. Respond with patience." },
  { id: 79, category: "Family", text: "You made a mess or left something undone at home. Own it and fix it." },
  { id: 80, category: "Family", text: "A parent asks what you need from them this summer. Answer clearly." },
  { id: 81, category: "Mental Toughness", text: "You are uncertain about not returning to Culver. Speak to yourself with faith and courage." },
  { id: 82, category: "Mental Toughness", text: "You feel behind other goalies. Respond without comparison or panic." },
  { id: 83, category: "Mental Toughness", text: "You are nervous before a major camp. Give yourself a pre-performance speech." },
  { id: 84, category: "Mental Toughness", text: "You overthink after a mistake. Give yourself a reset phrase." },
  { id: 85, category: "Mental Toughness", text: "You feel like your future is unclear. Respond with control over the next action." },
  { id: 86, category: "Mental Toughness", text: "You are criticized by someone whose opinion stings. Respond internally with maturity." },
  { id: 87, category: "Mental Toughness", text: "You feel average. Tell yourself what standard you will execute today." },
  { id: 88, category: "Mental Toughness", text: "You are afraid of failing publicly. Respond with courage." },
  { id: 89, category: "Mental Toughness", text: "You are tired of correcting the same weakness. Respond with persistence." },
  { id: 90, category: "Mental Toughness", text: "You need to explain your identity after a bad day. Say it without pretending." },
  { id: 91, category: "Public Speaking", text: "You are asked to introduce yourself to a room of serious adults. Give a strong introduction." },
  { id: 92, category: "Public Speaking", text: "You need to open a school presentation on food lobbying and public awareness. Write the first 30 seconds." },
  { id: 93, category: "Public Speaking", text: "Someone challenges your proposal during Q&A. Respond calmly and intelligently." },
  { id: 94, category: "Public Speaking", text: "You lose your train of thought during a presentation. Recover smoothly." },
  { id: 95, category: "Public Speaking", text: "You need to close a speech with authority. Practice the final lines." },
  { id: 96, category: "Public Speaking", text: "You are asked a question you do not know the answer to. Respond honestly without losing credibility." },
  { id: 97, category: "Public Speaking", text: "You need to explain a complex issue simply to younger students." },
  { id: 98, category: "Public Speaking", text: "You are asked why your newsletter solution matters. Give the strongest answer." },
  { id: 99, category: "Public Speaking", text: "You need to speak more slowly and clearly. Write a response you can deliver with control." },
  { id: 100, category: "Public Speaking", text: "You need to persuade people who do not already agree with you. Open with common ground." },
];

const blankPractice = {
  response: "",
  selfGrade: "",
  correction: "",
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

function getRandomPrompt(excludedId = null) {
  const availablePrompts = responsePrompts.filter((prompt) => prompt.id !== excludedId);
  const pool = availablePrompts.length > 0 ? availablePrompts : responsePrompts;
  return pool[Math.floor(Math.random() * pool.length)];
}

function loadPracticeLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function PromptPracticeModule({ onSave }) {
  const [currentPrompt, setCurrentPrompt] = useState(() => getRandomPrompt());
  const [practice, setPractice] = useState(blankPractice);
  const [logs, setLogs] = useState(() => loadPracticeLogs());
  const [selectedLogId, setSelectedLogId] = useState("");
  const [hasSubmittedCurrentPrompt, setHasSubmittedCurrentPrompt] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const selectedLog = logs.find((log) => log.id === selectedLogId) ?? logs[0] ?? null;
  const practicedToday = logs.filter((log) => log.date === getLocalDateString()).length;

  const categoryStats = useMemo(() => {
    return responsePrompts.reduce((stats, prompt) => {
      stats[prompt.category] = (stats[prompt.category] || 0) + 1;
      return stats;
    }, {});
  }, []);

  const responseWordCount = practice.response
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const canSave = practice.response.trim().length >= 25;

  function updateField(field, value) {
    setPractice((prev) => ({ ...prev, [field]: value }));
  }

  function generateNextPrompt() {
    if (!hasSubmittedCurrentPrompt && practice.response.trim()) {
      const confirmed = window.confirm(
        "You have an unsaved response. Save it before generating a new prompt?"
      );
      if (!confirmed) return;
    }

    setCurrentPrompt((prev) => getRandomPrompt(prev?.id));
    setPractice(blankPractice);
    setHasSubmittedCurrentPrompt(false);
  }

  function savePractice() {
    if (!canSave) return;

    const newLog = {
      id: makeId(),
      date: getLocalDateString(),
      createdAt: new Date().toLocaleString(),
      promptId: currentPrompt.id,
      category: currentPrompt.category,
      prompt: currentPrompt.text,
      response: practice.response.trim(),
      selfGrade: practice.selfGrade,
      correction: practice.correction.trim(),
      wordCount: responseWordCount,
    };

    setLogs((prev) => [newLog, ...prev]);
    setSelectedLogId(newLog.id);
    setHasSubmittedCurrentPrompt(true);
    onSave?.(newLog);
  }

  function deleteLog(id) {
    const confirmed = window.confirm("Delete this practice response?");
    if (!confirmed) return;

    setLogs((prev) => prev.filter((log) => log.id !== id));
    if (selectedLogId === id) setSelectedLogId("");
  }

  function clearLogs() {
    const confirmed = window.confirm("Clear all response practice logs?");
    if (!confirmed) return;

    setLogs([]);
    setSelectedLogId("");
  }

  return (
    <div className="prompt-practice-module">
      <div className="module-status-grid">
        <div className="mini-stat"><MessageSquare size={20} /><div><span>Prompt Bank</span><strong>{responsePrompts.length}</strong></div></div>
        <div className="mini-stat"><CheckCircle2 size={20} /><div><span>Completed Today</span><strong>{practicedToday}</strong></div></div>
        <div className="mini-stat"><Archive size={20} /><div><span>Total Responses</span><strong>{logs.length}</strong></div></div>
        <div className="mini-stat"><Target size={20} /><div><span>Categories</span><strong>{Object.keys(categoryStats).length}</strong></div></div>
      </div>

      <div className="prompt-practice-layout">
        <div className="prompt-practice-card prompt-practice-main">
          <div className="prompt-practice-header">
            <div><p>Response Drill</p><h3>{currentPrompt.category}</h3></div>
            <span>#{String(currentPrompt.id).padStart(3, "0")}</span>
          </div>

          <div className="generated-prompt"><p>{currentPrompt.text}</p></div>
          <div className="response-standard"><span>Standard:</span><strong>Calm. Direct. Honest. Controlled.</strong></div>

          <div className="prompt-practice-form">
            <label>
              <span>Your practiced response</span>
              <textarea
                value={practice.response}
                onChange={(event) => {
                  updateField("response", event.target.value);
                  setHasSubmittedCurrentPrompt(false);
                }}
                placeholder="Write exactly what you would say. Minimum 25 characters."
              />
            </label>

            <div className="prompt-practice-row">
              <label>
                <span>Self-grade</span>
                <select value={practice.selfGrade} onChange={(event) => updateField("selfGrade", event.target.value)}>
                  <option value="">Choose</option>
                  <option value="Needs work">Needs work</option>
                  <option value="Solid">Solid</option>
                  <option value="Strong">Strong</option>
                  <option value="Elite">Elite</option>
                </select>
              </label>

              <label>
                <span>Correction</span>
                <input value={practice.correction} onChange={(event) => updateField("correction", event.target.value)} placeholder="What would make it sharper?" />
              </label>
            </div>
          </div>

          <div className="prompt-practice-meta">
            <span>{responseWordCount} words</span>
            <span>{canSave ? "Ready to save" : "Write a real response first"}</span>
          </div>

          <div className="module-actions">
            <button className="primary-action" onClick={savePractice} disabled={!canSave}><Save size={18} /> Save Practice Response</button>
            <button className="secondary-action" onClick={generateNextPrompt}><Dice5 size={18} /> Generate Random Prompt</button>
          </div>
        </div>

        <div className="prompt-practice-card">
          <div className="prompt-practice-header"><div><p>Archive Viewer</p><h3>Past Responses</h3></div></div>
          {logs.length === 0 ? <p className="muted">No response practice saved yet.</p> : (
            <div className="prompt-log-list">
              {logs.slice(0, 12).map((log) => (
                <button key={log.id} className={`prompt-log-button ${selectedLog?.id === log.id ? "selected" : ""}`} onClick={() => setSelectedLogId(log.id)}>
                  <strong>{log.category}</strong>
                  <span>{log.date} · {log.selfGrade || "Ungraded"}</span>
                </button>
              ))}
            </div>
          )}
          <div className="module-actions compact"><button className="secondary-action" onClick={clearLogs}>Clear Logs</button></div>
        </div>
      </div>

      <div className="prompt-practice-card">
        <div className="prompt-practice-header"><div><p>Selected Response</p><h3>{selectedLog ? selectedLog.category : "No Response Selected"}</h3></div></div>
        {!selectedLog ? <p className="muted">Select a saved response to review it.</p> : (
          <div className="prompt-log-detail">
            <div className="prompt-log-actions"><button className="danger-action" onClick={() => deleteLog(selectedLog.id)}><Trash2 size={16} /> Delete</button></div>
            <p><span>Prompt:</span> {selectedLog.prompt}</p>
            <p><span>Response:</span> {selectedLog.response}</p>
            {selectedLog.selfGrade && <p><span>Self-grade:</span> {selectedLog.selfGrade}</p>}
            {selectedLog.correction && <p><span>Correction:</span> {selectedLog.correction}</p>}
            <p><span>Saved:</span> {selectedLog.createdAt} · {selectedLog.wordCount} words</p>
          </div>
        )}
      </div>
    </div>
  );
}
