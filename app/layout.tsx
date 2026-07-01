import Link from "next/link";

import "./globals.css";

export const metadata = {
  title: "TGC Take Home Project",
  description: "TGC Take Home Project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="site-header">
            <nav className="site-nav" aria-label="Primary navigation">
              <Link className="brand" href="/">
                <span className="brand-mark" aria-hidden="true" />
                <span>TGC Performance Notes</span>
              </Link>
              <div className="nav-links">
                <Link className="nav-link" href="/graph">
                  Graph
                </Link>
                <Link className="nav-link" href="/notes">
                  Notes
                </Link>
              </div>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
