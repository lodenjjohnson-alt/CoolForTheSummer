import React, { useMemo, useRef, useState } from "react";
import { Download, FileUp, HardDrive, ShieldAlert, Trash2 } from "lucide-react";

const BACKUP_VERSION = 1;

const knownStorageKeys = [
  "summer-os-daily-mission-state",
  "summer-os-operation-archive",
  "summer-os-xp-state",
  "summer-os-fitness-logs",
  "summer-os-hockey-logs",
  "summer-os-school-data",
  "summer-os-learning-logs",
  "summer-os-skill-tree",
  "summer-os-discipline-logs",
  "summer-os-faith-logs",
  "summer-os-experiences-data",
  "summer-os-reflection-logs",
];

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getSummerOsKeys() {
  const keys = new Set(knownStorageKeys);

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key && key.startsWith("summer-os-")) {
      keys.add(key);
    }
  }

  return [...keys].sort();
}

function collectBackupData() {
  const keys = getSummerOsKeys();
  const data = {};

  keys.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  });

  return data;
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function validateBackup(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Backup file is not valid JSON data.");
  }

  if (!payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) {
    throw new Error("Backup file does not contain a valid data object.");
  }

  Object.entries(payload.data).forEach(([key, value]) => {
    if (!key.startsWith("summer-os-")) {
      throw new Error(`Backup includes an unsupported key: ${key}`);
    }

    if (typeof value !== "string") {
      throw new Error(`Backup value for ${key} is not valid.`);
    }

    JSON.parse(value);
  });

  return true;
}

export default function BackupPanel() {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("Backup protects your Summer OS data stored in this browser.");
  const [lastImportedAt, setLastImportedAt] = useState("");

  const backupStats = useMemo(() => {
    const data = collectBackupData();
    const keys = Object.keys(data);
    const size = new Blob([JSON.stringify(data)]).size;

    return {
      keys: keys.length,
      sizeKb: Math.max(1, Math.round(size / 1024)),
    };
  }, [status, lastImportedAt]);

  function exportBackup() {
    const backup = {
      app: "Summer OS",
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      exportedDate: getLocalDateString(),
      data: collectBackupData(),
    };

    const filename = `summer-os-backup-${getLocalDateString()}.json`;
    downloadTextFile(filename, JSON.stringify(backup, null, 2));
    setStatus(`Exported ${Object.keys(backup.data).length} data sections.`);
  }

  function openImportPicker() {
    fileInputRef.current?.click();
  }

  async function importBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      validateBackup(backup);

      const confirmed = window.confirm(
        "Import this backup? This will overwrite current Summer OS data in this browser and reload the app."
      );
      if (!confirmed) return;

      Object.entries(backup.data).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      setLastImportedAt(new Date().toLocaleString());
      setStatus(`Imported ${Object.keys(backup.data).length} data sections. Reloading...`);
      window.location.reload();
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
    }
  }

  function clearAllSummerOsData() {
    const firstConfirm = window.confirm(
      "Clear all Summer OS data from this browser? Export a backup first if you want to keep it."
    );
    if (!firstConfirm) return;

    const typed = window.prompt('Type "CLEAR" to permanently clear Summer OS data from this browser.');
    if (typed !== "CLEAR") {
      setStatus("Clear cancelled.");
      return;
    }

    getSummerOsKeys().forEach((key) => localStorage.removeItem(key));
    setStatus("All Summer OS data cleared. Reloading...");
    window.location.reload();
  }

  return (
    <section className="panel backup-panel">
      <div className="section-title">
        <HardDrive size={24} />
        <h2>Backup System</h2>
      </div>

      <div className="backup-summary-grid">
        <div>
          <span>Data Sections</span>
          <strong>{backupStats.keys}</strong>
        </div>
        <div>
          <span>Approx Size</span>
          <strong>{backupStats.sizeKb} KB</strong>
        </div>
      </div>

      <p className="muted">{status}</p>

      <div className="backup-actions">
        <button className="primary-action" onClick={exportBackup}>
          <Download size={18} />
          Export Backup
        </button>

        <button className="secondary-action" onClick={openImportPicker}>
          <FileUp size={18} />
          Import Backup
        </button>

        <button className="danger-action" onClick={clearAllSummerOsData}>
          <Trash2 size={18} />
          Clear All Data
        </button>
      </div>

      <div className="backup-warning">
        <ShieldAlert size={18} />
        <p>
          Backups contain your saved logs, scores, archive, XP, and rewards. Store the file somewhere private.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="backup-file-input"
        onChange={importBackup}
      />
    </section>
  );
}
