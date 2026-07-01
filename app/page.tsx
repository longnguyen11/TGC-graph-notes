import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <section className="page-header">
        <span className="eyebrow">Take-home project</span>
        <h1 className="page-title">A small dashboard for performance and notes.</h1>
        <p className="page-copy">
          Review frame-rate events by user, then capture lightweight posts in a
          persistent feed.
        </p>
      </section>

      <section className="dashboard-grid" aria-label="Project features">
        <Link className="feature-card" href="/graph">
          <div>
            <h2>FPS over time</h2>
            <p>
              A polished chart view with per-user lines, hover detail, and time
              range controls.
            </p>
          </div>
          <div className="card-meta">
            <span>Open graph</span>
            <span className="arrow" aria-hidden="true">
              -&gt;
            </span>
          </div>
        </Link>

        <Link className="feature-card" href="/notes">
          <div>
            <h2>Notes feed</h2>
            <p>
              Create, read, and delete posts backed by a REST API and database.
            </p>
          </div>
          <div className="card-meta">
            <span>Open notes</span>
            <span className="arrow" aria-hidden="true">
              -&gt;
            </span>
          </div>
        </Link>
      </section>
    </main>
  );
}
