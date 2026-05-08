"use client";

import { useState, useCallback } from "react";
import { Hook, Platform, ContentType } from "@/lib/types";
import { addHookToFolder } from "@/lib/storage";
import HookCard from "@/components/HookCard";
import FolderSelector from "@/components/FolderSelector";

const PLATFORMS: Platform[] = ["小红书", "抖音", "B站"];
const CONTENT_TYPES: ContentType[] = ["视频", "图文", "教程", "观点"];

export default function HomePage() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("小红书");
  const [contentType, setContentType] = useState<ContentType>("视频");
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [error, setError] = useState("");
  const [showFolderPicker, setShowFolderPicker] = useState<Hook | null>(null);
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate-hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), platform, contentType }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "生成失败");
      }

      const data = await res.json();
      const now = new Date().toISOString();

      const newHooks: Hook[] = data.hooks.map((h: any, i: number) => ({
        ...h,
        id: `${Date.now()}-${i}`,
        platform,
        contentType,
        topic: topic.trim(),
        createdAt: now,
        folderId: null,
        isFavorite: false,
      }));

      setHooks(newHooks);

      // save to history
      const { addHistory } = await import("@/lib/storage");
      addHistory({
        id: `gen-${Date.now()}`,
        topic: topic.trim(),
        platform,
        contentType,
        hooks: newHooks,
        createdAt: now,
      });
    } catch (err: any) {
      setError(err.message || "请求失败，请检查 API Key 是否配置");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* header */}
      <div className="text-center mb-10">
        <h1 className="font-[var(--font-serif)] text-3xl sm:text-4xl md:text-5xl text-[var(--color-ink)] tracking-wide brush-stroke inline-block">
          标题党
        </h1>
        <p className="mt-3 text-sm text-[var(--color-ink-light)]/60 font-[var(--font-sans)]">
          输入主题，AI 一键生成 8 条爆款 Hook
        </p>
      </div>

      {/* form */}
      <div className="card-painting p-5 sm:p-6 mb-8">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="输入你的内容主题，比如：AI绘画入门、周末北京周边游..."
          className="input-painting text-base sm:text-lg mb-4"
          onKeyDown={(e) => e.key === "Enter" && !loading && handleGenerate()}
        />

        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex-1 min-w-40">
            <label className="block text-xs text-[var(--color-ink-light)]/60 mb-1.5 tracking-wide uppercase">
              平台
            </label>
            <div className="flex gap-1">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`flex-1 py-2 text-sm border transition-all ${
                    platform === p
                      ? "border-[var(--color-ochre)] bg-[var(--color-ochre)]/5 text-[var(--color-ochre-dark)]"
                      : "border-[var(--color-card-border)] text-[var(--color-ink-light)]/70 hover:border-[var(--color-ochre-light)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-40">
            <label className="block text-xs text-[var(--color-ink-light)]/60 mb-1.5 tracking-wide uppercase">
              内容类型
            </label>
            <div className="flex gap-1">
              {CONTENT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setContentType(t)}
                  className={`flex-1 py-2 text-sm border transition-all ${
                    contentType === t
                      ? "border-[var(--color-ochre)] bg-[var(--color-ochre)]/5 text-[var(--color-ochre-dark)]"
                      : "border-[var(--color-card-border)] text-[var(--color-ink-light)]/70 hover:border-[var(--color-ochre-light)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="btn-primary w-full"
        >
          {loading ? "生成中..." : "生成 8 条爆款 Hook"}
        </button>

        {error && (
          <p className="mt-3 text-sm text-[var(--color-crimson)] text-center">{error}</p>
        )}
      </div>

      {/* results */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card-painting p-5 animate-pulse">
              <div className="h-3 w-12 bg-[var(--color-parchment)] rounded mb-3" />
              <div className="h-5 w-full bg-[var(--color-parchment)] rounded mb-2" />
              <div className="h-5 w-3/4 bg-[var(--color-parchment)] rounded mb-3" />
              <div className="h-2 w-full bg-[var(--color-parchment)] rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && hooks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[var(--font-serif)] text-lg text-[var(--color-ink)]">
              为你生成的 8 条 Hook
            </h2>
            <button
              onClick={() => {
                const texts = hooks.map((h) => h.text).join("\n");
                navigator.clipboard.writeText(texts);
                showToast("已全部复制");
              }}
              className="btn-ghost text-xs"
            >
              复制全部
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hooks.map((hook, i) => (
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

      {!loading && hooks.length === 0 && !error && (
        <div className="text-center py-16 text-[var(--color-ink-light)]/40">
          <p className="font-[var(--font-serif)] text-lg italic">
            输入主题，开始创作
          </p>
        </div>
      )}

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
