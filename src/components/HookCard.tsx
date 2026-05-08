"use client";

import { useState } from "react";
import { Hook } from "@/lib/types";

const STYLE_COLORS: Record<string, string> = {
  "悬念型": "border-l-[var(--color-crimson)] bg-[var(--color-crimson)]/5",
  "痛点型": "border-l-[var(--color-ultramarine)] bg-[var(--color-ultramarine)]/5",
  "反差型": "border-l-[var(--color-forest)] bg-[var(--color-forest)]/5",
  "权威型": "border-l-[var(--color-ochre)] bg-[var(--color-ochre)]/5",
  "故事型": "border-l-[#7c3a6a] bg-[#7c3a6a]/5",
  "数据型": "border-l-[#4a6a7c] bg-[#4a6a7c]/5",
  "情绪型": "border-l-[#c04040] bg-[#c04040]/5",
  "指令型": "border-l-[#5c4a3a] bg-[#5c4a3a]/5",
};

interface Props {
  hook: Hook;
  index: number;
  onFavorite: (hook: Hook) => void;
  onCopy: (text: string) => void;
}

export default function HookCard({ hook, index, onFavorite, onCopy }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(hook.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`card-painting p-4 sm:p-5 border-l-4 ${STYLE_COLORS[hook.style] || "border-l-[var(--color-card-border)]"} animate-fade-in-up`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-[var(--font-serif)] italic text-[var(--color-ink-light)]/50 whitespace-nowrap">
          #{String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-parchment)] text-[var(--color-ink-light)] border border-[var(--color-card-border)]">
          {hook.style}
        </span>
      </div>

      <p className="mt-2 text-base sm:text-lg leading-relaxed font-[var(--font-serif)] font-medium text-[var(--color-ink)]">
        &ldquo;{hook.text}&rdquo;
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-[var(--color-ink-light)]/60">点击欲</span>
        <div className="flex-1 max-w-28 h-2 bg-[var(--color-parchment)] rounded-full overflow-hidden">
          <div
            className="score-bar h-full rounded-full"
            style={{ width: `${(hook.score / 10) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium font-[var(--font-serif)] text-[var(--color-crimson)]">
          {hook.score}/10
        </span>
      </div>

      <p className="mt-2 text-xs text-[var(--color-ink-light)]/70 leading-relaxed">
        {hook.reason}
      </p>

      <div className="mt-3 pt-3 border-t border-[var(--color-card-border)] flex gap-2">
        <button
          onClick={handleCopy}
          className="btn-ghost text-xs py-1 px-3 flex items-center gap-1"
        >
          {copied ? "✓ 已复制" : "复制"}
        </button>
        <button
          onClick={() => onFavorite(hook)}
          className={`btn-ghost text-xs py-1 px-3 flex items-center gap-1 ${hook.isFavorite ? "text-[var(--color-crimson)] border-[var(--color-crimson)]/30" : ""}`}
        >
          {hook.isFavorite ? "♥" : "♡"} 收藏
        </button>
      </div>
    </div>
  );
}
