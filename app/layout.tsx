import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agam's Blog",
  description: "A personal blog powered by Next.js and Turso",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container nav">
            <Link href="/" className="brand">Agam&apos;s Blog</Link>
            <nav>
              <Link href="/">Posts</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="container footer">Built with Next.js · Data in Turso</footer>
      </body>
    </html>
  );
}
