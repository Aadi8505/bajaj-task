import { useState } from "react";

/* ── Tree View (recursive) ── */
function TreeView({ tree }) {
  const entries = Object.entries(tree);
  if (entries.length === 0) return null;

  return (
    <ul className="tree-list">
      {entries.map(([key, children]) => (
        <li key={key} className="tree-node">
          <span className="tree-node__label">{key}</span>
          {Object.keys(children).length > 0 && <TreeView tree={children} />}
        </li>
      ))}
    </ul>
  );
}

/* ── Hierarchy Card ── */
function HierarchyCard({ hierarchy, index }) {
  const isCycle = hierarchy.has_cycle === true;

  return (
    <div className="hierarchy-card" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="hierarchy-header">
        <span className="hierarchy-root">Root: {hierarchy.root}</span>
        {isCycle ? (
          <span className="badge badge--cycle">⟳ Cycle</span>
        ) : (
          <>
            <span className="badge badge--tree">✓ Tree</span>
            <span className="badge badge--depth">Depth: {hierarchy.depth}</span>
          </>
        )}
      </div>

      {isCycle ? (
        <div className="cycle-message">
          <span>⚠</span>
          <span>Cycle detected — all nodes in this group form a circular dependency.</span>
        </div>
      ) : (
        <div className="tree-view">
          <TreeView tree={hierarchy.tree} />
        </div>
      )}
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const entries = input
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const response = await fetch("/bfhl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: entries }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header__badge">
          <span className="header__badge-dot"></span>
          BFHL API
        </div>
        <h1>Hierarchical Data Processor</h1>
        <p>Parse node relationships, detect cycles, and build tree hierarchies.</p>
      </header>

      {/* ── Input ── */}
      <section className="input-section card">
        <div className="card__title">
          <span className="card__title-icon" style={{ background: "rgba(99,102,241,0.15)", color: "var(--accent-indigo)" }}>⌘</span>
          Input
        </div>
        <div className="textarea-wrapper">
          <textarea
            id="node-input"
            className="textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={"A->B, A->C, B->D, C->E\nor one entry per line:\nX->Y\nY->Z"}
          />
        </div>
        <p className="input-hint">Separate entries with commas or newlines. Press Ctrl+Enter to submit.</p>
        <button
          id="submit-btn"
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
        >
          {loading && <span className="spinner"></span>}
          {loading ? "Processing…" : "Process Data"}
        </button>
      </section>

      {/* ── Error ── */}
      {error && (
        <div className="error-banner" role="alert">
          <span className="error-banner__icon">✕</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <div className="results">
          <div className="results-grid">
            {/* User Info */}
            <div className="card">
              <div className="card__title">
                <span className="card__title-icon" style={{ background: "rgba(99,102,241,0.15)", color: "var(--accent-indigo)" }}>⊡</span>
                Identity
              </div>
              <div className="user-info-grid">
                <div className="user-info-item">
                  <div className="user-info-item__label">User ID</div>
                  <div className="user-info-item__value">{result.user_id}</div>
                </div>
                <div className="user-info-item">
                  <div className="user-info-item__label">Email</div>
                  <div className="user-info-item__value">{result.email_id}</div>
                </div>
                <div className="user-info-item">
                  <div className="user-info-item__label">Roll Number</div>
                  <div className="user-info-item__value">{result.college_roll_number}</div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="card">
              <div className="card__title">
                <span className="card__title-icon" style={{ background: "rgba(6,182,212,0.15)", color: "var(--accent-cyan)" }}>◈</span>
                Summary
              </div>
              <div className="summary-grid">
                <div className="summary-stat">
                  <div className="summary-stat__value summary-stat__value--trees">{result.summary.total_trees}</div>
                  <div className="summary-stat__label">Trees</div>
                </div>
                <div className="summary-stat">
                  <div className="summary-stat__value summary-stat__value--cycles">{result.summary.total_cycles}</div>
                  <div className="summary-stat__label">Cycles</div>
                </div>
                <div className="summary-stat">
                  <div className="summary-stat__value summary-stat__value--root">
                    {result.summary.largest_tree_root || "—"}
                  </div>
                  <div className="summary-stat__label">Largest Tree Root</div>
                </div>
              </div>
            </div>

            {/* Hierarchies */}
            {result.hierarchies.length > 0 && (
              <div className="card">
                <div className="card__title">
                  <span className="card__title-icon" style={{ background: "rgba(34,197,94,0.15)", color: "var(--color-success)" }}>⊞</span>
                  Hierarchies ({result.hierarchies.length})
                </div>
                <div className="results-grid">
                  {result.hierarchies.map((h, i) => (
                    <HierarchyCard key={i} hierarchy={h} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Invalid Entries */}
            <div className="card">
              <div className="card__title">
                <span className="card__title-icon" style={{ background: "rgba(234,179,8,0.12)", color: "var(--color-warning)" }}>⚠</span>
                Invalid Entries ({result.invalid_entries.length})
              </div>
              {result.invalid_entries.length > 0 ? (
                <div className="tag-list">
                  {result.invalid_entries.map((entry, i) => (
                    <span key={i} className="tag tag--invalid">
                      {entry || '""'}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No invalid entries found.</p>
              )}
            </div>

            {/* Duplicate Edges */}
            <div className="card">
              <div className="card__title">
                <span className="card__title-icon" style={{ background: "rgba(249,115,22,0.12)", color: "#fb923c" }}>⊘</span>
                Duplicate Edges ({result.duplicate_edges.length})
              </div>
              {result.duplicate_edges.length > 0 ? (
                <div className="tag-list">
                  {result.duplicate_edges.map((edge, i) => (
                    <span key={i} className="tag tag--duplicate">{edge}</span>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No duplicate edges found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
