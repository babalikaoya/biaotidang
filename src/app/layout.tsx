import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "标题党 — AI 爆款 Hook 生成器",
  description: "输入主题，一键生成8条爆款标题/Hook",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="texture-bg">
        <div className="content-above min-h-screen flex flex-col">
          <NavBar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}

function NavBar() {
  const links = [
    { href: "/", label: "生成" },
    { href: "/favorites", label: "收藏" },
    { href: "/history", label: "历史" },
  ];

  return (
    <nav className="border-b border-[var(--color-card-border)] bg-[var(--color-card)]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="font-[var(--font-serif)] text-xl text-[var(--color-crimson)] tracking-wide brush-stroke">
          标题党
        </a>
        <div className="flex gap-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-[var(--color-ink-light)] hover:text-[var(--color-crimson)] transition-colors rounded hover:bg-[var(--color-parchment)]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
