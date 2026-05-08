"use client";

import { useState, useCallback, useEffect } from "react";
import { GenerationRecord, Hook } from "@/lib/types";
import { getHistory, clearHistory, addHookToFolder } from "@/lib/storage";
import HookCard from "@/components/HookCard";
import FolderSelector from "@/components/FolderSelector";

function groupByDate(records: GenerationRecord[]): Map<string, GenerationRecord[]> {
  const groups = new Map<string, GenerationRecord[]>();
  for (const r of records) {
    const date = new Date(r.createdAt);
    const key = date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
    const list = groups.get(key) || [];
    list.push(r);
    groups.set(key, list);
  }
  return groups;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<GenerationRecord[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showFolderPicker, setShowFolderPicker] = useState<Hook | null>(null);
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }, []);

  const refresh = useCallback(() => {
    setRecords(getHistory());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    if (confirm("确定清空所有历史记录？")) {
      clearHistory();
      refresh();
    }
  }, [refresh]);

  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => showToast("已复制"));
    },
    [showToast]
  );

  const handleFavorite = useCallback((hook: Hook) => {
    setShowFolderPicker(hook);
  }, []);

  const handleFolderSelect = useCallback(
    (folderId: string) => {
      if (showFolderPicker) {
        addHookToFolder(showFolderPicker, folderId);
        showToast("已收藏");
        setShowFolderPicker(null);
      }
    },
    [showFolderPicker, showToast]
  );

  const groups = groupByDate(records);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-[var(--font-serif)] text-2xl sm:text-3xl text-[var(--color-ink)] brush-stroke inline-block">
          历史记录
        </h1>
        {records.length > 0 && (
          <button onClick={handleClear} className="btn-ghost text-xs">
            清空历史
          </button>
        )}
      </div>

      {records.length === 0 && (
        <div className="text-center py-16 text-[var(--color-ink-light)]/40">
          <p className="font-[var(--font-serif)] text-lg italic">暂无历史记录</p>
          <p className="text-sm mt-2">生成的 Hook 会自动保存在这里</p>
        </div>
      )}

      <div className="space-y-6">
        {Array.from(groups.entries()).map(([date, dayRecords]) => (
          <div key={date}>
            <h2 className="font-[var(--font-serif)] text-sm text-[var(--color-ink-light)]/40 mb-3 tracking-wide">
              {date}
            </h2>
            <div className="space-y-2">
              {dayRecords.map((rec) => {
                const isExpanded = expandedIds.has(rec.id);
                return (
                  <div key={rec.id} className="card-painting overflow-hidden">
                    <button
                      onClick={() => toggleExpand(rec.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-parchment)]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-[var(--color-ink-light)]/30">
                          {new Date(rec.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-sm text-[var(--color-ink)] truncate">
                          {rec.topic}
                        </span>
                        <span className="text-xs text-[var(--color-ink-light)]/40 whitespace-nowrap">
                          {rec.platform} · {rec.contentType}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--color-ink-light)]/30 ml-2">
                        {isExpanded ? "收起" : `展开 ${rec.hooks.length} 条`}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {rec.hooks.map((hook, i) => (
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
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* folder picker modal */}
      {showFolderPicker && (
        <FolderSelector
          onSelect={handleFolderSelect}
          onClose={() => setShowFolderPicker(null)}
        />
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
