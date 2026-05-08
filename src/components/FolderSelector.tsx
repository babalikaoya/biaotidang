"use client";

import { useState } from "react";
import { Folder } from "@/lib/types";
import { getFolders, createFolder } from "@/lib/storage";

interface Props {
  onSelect: (folderId: string) => void;
  onClose: () => void;
}

export default function FolderSelector({ onSelect, onClose }: Props) {
  const [folders, setFolders] = useState<Folder[]>(() => getFolders());
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const folder = createFolder(name);
    setFolders(getFolders());
    setNewName("");
    onSelect(folder.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="card-painting p-6 w-full max-w-sm mx-4 animate-fade-in-up">
        <h3 className="font-[var(--font-serif)] text-lg text-[var(--color-ink)] mb-4">
          收藏到文件夹
        </h3>

        {folders.length === 0 && (
          <p className="text-sm text-[var(--color-ink-light)]/60 mb-4">
            还没有文件夹，创建一个吧
          </p>
        )}

        <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelect(f.id)}
              className="w-full text-left px-3 py-2 text-sm text-[var(--color-ink-light)] hover:bg-[var(--color-parchment)] rounded transition-colors"
            >
              📁 {f.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="新建文件夹名称"
            className="input-painting text-sm flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button onClick={handleCreate} className="btn-ghost text-sm whitespace-nowrap">
            新建
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="btn-ghost text-sm">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
