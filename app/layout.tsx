import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agam's Blog",
  description: "A personal blog powered by Next.js and Turso",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>
        <header className="site-header">
          <div className="container nav">
            <Link href="/" className="brand">Agam&apos;s Blog</Link>
            <nav>
              <Link href="/">Posts</Link>
              <Link href="/admin">Admin</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
