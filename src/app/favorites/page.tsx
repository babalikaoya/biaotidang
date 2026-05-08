"use client";

import { useState, useCallback, useEffect } from "react";
import { Folder, Hook } from "@/lib/types";
import { getFolders, getHooks, saveHooks, deleteFolder, removeHookFromFavorites } from "@/lib/storage";
import HookCard from "@/components/HookCard";

export default function FavoritesPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }, []);

  const refresh = useCallback(() => {
    setFolders(getFolders());
    setHooks(getHooks());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDeleteFolder = useCallback(
    (id: string, name: string) => {
      if (confirm(`确定删除文件夹「${name}」及其中的所有收藏？`)) {
        deleteFolder(id);
        refresh();
        showToast("已删除");
      }
    },
    [refresh, showToast]
  );

  const handleRemoveHook = useCallback(
    (id: string) => {
      removeHookFromFavorites(id);
      refresh();
    },
    [refresh]
  );

  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => showToast("已复制"));
    },
    [showToast]
  );

  const handleFavorite = useCallback(
    (hook: Hook) => {
      handleRemoveHook(hook.id);
    },
    [handleRemoveHook]
  );

  const getFolderHooks = (folderId: string): Hook[] =>
    hooks.filter((h) => h.folderId === folderId);

  const uncategorizedHooks = hooks.filter((h) => !h.folderId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="font-[var(--font-serif)] text-2xl sm:text-3xl text-[var(--color-ink)] brush-stroke inline-block mb-8">
        收藏夹
      </h1>

      {folders.length === 0 && hooks.length === 0 && (
        <div className="text-center py-16 text-[var(--color-ink-light)]/40">
          <p className="font-[var(--font-serif)] text-lg italic">还没有收藏的 Hook</p>
          <p className="text-sm mt-2">在首页生成后点击 ♡ 收藏</p>
        </div>
      )}

      {/* folders */}
      <div className="space-y-4">
        {folders.map((folder) => {
          const folderHooks = getFolderHooks(folder.id);
          const isExpanded = expandedFolder === folder.id;
          return (
            <div key={folder.id} className="card-painting overflow-hidden">
              <button
                onClick={() => setExpandedFolder(isExpanded ? null : folder.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-parchment)]/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-[var(--font-serif)] text-base text-[var(--color-ink)]">
                    📁 {folder.name}
                  </span>
                  <span className="text-xs text-[var(--color-ink-light)]/40">
                    {folderHooks.length} 条
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-ink-light)]/30">{isExpanded ? "收起" : "展开"}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id, folder.name);
                    }}
                    className="text-xs text-[var(--color-ink-light)]/30 hover:text-[var(--color-crimson)] transition-colors"
                  >
                    删除
                  </button>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  {folderHooks.length === 0 ? (
                    <p className="text-sm text-[var(--color-ink-light)]/40 py-4 text-center">
                      文件夹为空
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {folderHooks.map((hook, i) => (
                        <HookCard
                          key={hook.id}
                          hook={hook}
                          index={i}
                          onFavorite={handleFavorite}
                          onCopy={handleCopy}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* uncategorized */}
      {uncategorizedHooks.length > 0 && (
        <div className="mt-6">
          <h2 className="font-[var(--font-serif)] text-base text-[var(--color-ink-light)]/50 mb-3 brush-stroke inline-block">
            未分类
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {uncategorizedHooks.map((hook, i) => (
              <HookCard
                key={hook.id}
                hook={hook}
                index={i}
                onFavorite={handleFavorite}
                onCopy={handleCopy}
              />
            ))}
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--color-ink)] text-[var(--color-parchment-light)] px-4 py-2 text-sm shadow-lg animate-fade-in-up z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
