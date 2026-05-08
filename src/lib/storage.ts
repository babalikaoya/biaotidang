import { Folder, Hook, GenerationRecord } from "./types";

const KEYS = {
  folders: "bd_folders",
  hooks: "bd_hooks",
  history: "bd_history",
};

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Folders ──

export function getFolders(): Folder[] {
  return getItem<Folder[]>(KEYS.folders, []);
}

export function saveFolders(folders: Folder[]): void {
  setItem(KEYS.folders, folders);
}

export function createFolder(name: string): Folder {
  const folders = getFolders();
  const folder: Folder = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };
  folders.push(folder);
  saveFolders(folders);
  return folder;
}

export function deleteFolder(id: string): void {
  const folders = getFolders().filter((f) => f.id !== id);
  saveFolders(folders);
  // remove folder reference from hooks
  const hooks = getHooks().map((h) =>
    h.folderId === id ? { ...h, folderId: null, isFavorite: false } : h
  );
  saveHooks(hooks);
}

// ── Hooks (favorites) ──

export function getHooks(): Hook[] {
  return getItem<Hook[]>(KEYS.hooks, []);
}

export function saveHooks(hooks: Hook[]): void {
  setItem(KEYS.hooks, hooks);
}

export function addHookToFolder(hook: Hook, folderId: string): void {
  const hooks = getHooks();
  const existing = hooks.find((h) => h.id === hook.id);
  if (existing) {
    existing.folderId = folderId;
    existing.isFavorite = true;
    existing.createdAt = new Date().toISOString();
  } else {
    hooks.unshift({ ...hook, folderId, isFavorite: true, createdAt: new Date().toISOString() });
  }
  saveHooks(hooks);
}

export function removeHookFromFavorites(id: string): void {
  const hooks = getHooks().filter((h) => h.id !== id);
  saveHooks(hooks);
}

// ── History ──

export function getHistory(): GenerationRecord[] {
  return getItem<GenerationRecord[]>(KEYS.history, []);
}

export function addHistory(record: GenerationRecord): void {
  const history = getHistory();
  history.unshift(record);
  // keep last 200 records
  setItem(KEYS.history, history.slice(0, 200));
}

export function clearHistory(): void {
  setItem(KEYS.history, []);
}
