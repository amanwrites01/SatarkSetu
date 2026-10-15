import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Table2, BarChart3 } from 'lucide-react';
import AdvisoryCard from '../components/AdvisoryCard.jsx';
import { api } from '../lib/api.js';
import { CATEGORIES, REPORT_TYPES } from '../lib/categories.jsx';

const nf = new Intl.NumberFormat('en-IN');
const YEARS = [2024, 2025];

function NationalChart({ national }) {
  const [year, setYear] = useState(2025);
  const [view, setView] = useState('chart');
  const [hover, setHover] = useState(null);

  const rows = useMemo(
    () => Object.entries(national.categories)
      .map(([category, y]) => ({ category, ...y }))
      .sort((a, b) => b[year] - a[year]),
    [national, year],
  );
  const max = Math.max(...rows.map((r) => r[year]));
  const total = rows.reduce((s, r) => s + r[year], 0);

  return (
    <section className="national glass">
      <div className="national-head">
        <div>
          <span className="eyebrow">National picture</span>
          <h2>{nf.format(total)} suspected frauds reported in {year}</h2>
          <p>Calls, SMS and WhatsApp messages Indians reported on the government's Chakshu facility, by category.</p>
        </div>
        <div className="national-controls">
          <div className="segmented" role="tablist" aria-label="Year">
            {YEARS.map((y) => (
              <button key={y} role="tab" aria-selected={year === y} className={year === y ? 'active' : ''} onClick={() => setYear(y)}>{y}</button>
            ))}
          </div>
          <button className="icon-btn" onClick={() => setView((v) => (v === 'chart' ? 'table' : 'chart'))} aria-label={view === 'chart' ? 'Show as table' : 'Show as chart'} title={view === 'chart' ? 'Table view' : 'Chart view'}>
            {view === 'chart' ? <Table2 size={16} /> : <BarChart3 size={16} />}
          </button>
        </div>
      </div>

      {view === 'chart' ? (
        <div className="bars" onPointerLeave={() => setHover(null)}>
          {rows.map((r) => {
            const change = r[2024] ? Math.round(((r[2025] - r[2024]) / r[2024]) * 100) : null;
            return (
              <div key={r.category} className={`bar-row ${hover && hover !== r.category ? 'dim' : ''}`} onPointerEnter={() => setHover(r.category)} tabIndex={0} onFocus={() => setHover(r.category)} onBlur={() => setHover(null)}>
                <span className="bar-label">{r.category}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${(r[year] / max) * 100}%` }} />
                </span>
                <span className="bar-value">{nf.format(r[year])}</span>
                {hover === r.category && (
                  <span className="bar-tip" role="tooltip">
                    <strong>{r.category}</strong>
                    <span>2024 <b>{nf.format(r[2024])}</b></span>
                    <span>2025 <b>{nf.format(r[2025])}</b></span>
                    {change !== null && <span>Change <b>{change > 0 ? '+' : ''}{nf.format(change)}%</b></span>}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Category</th>{YEARS.map((y) => <th key={y}>{y}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => <tr key={r.category}><td>{r.category}</td>{YEARS.map((y) => <td key={y}>{nf.format(r[y])}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      )}

      <p className="source-line">
        Source: <a href={national.sourceUrl} target="_blank" rel="noreferrer">{national.source}, PIB {national.published} <ExternalLink size={12} /></a>.
        Early-2026 figures are left out because they only cover part of the year.
      </p>
    </section>
  );
}

export default function AdvisoriesPage() {
  const [type, setType] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.advisories().then(setData).catch((err) => setError(err.message));
  }, []);

  const items = data?.items.filter((a) => !type || a.type === type) ?? [];
  const types = REPORT_TYPES.filter((t) => data?.items.some((a) => a.type === t));

  return (
    <div className="container">
      <header className="page-head">
        <span className="eyebrow">Verified by government sources</span>
        <h1>Official scam advisories</h1>
        <p className="lead">Warnings published by MHA (I4C), TRAI, DoT, RBI and India Post, summarised in plain language with links to the original notices.</p>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}
      {data && <NationalChart national={data.national} />}

      <div className="toolbar glass">
        <div className="segmented" role="tablist" aria-label="Filter advisories">
          <button role="tab" aria-selected={!type} className={!type ? 'active' : ''} style={{ '--c': '#e8ecf8' }} onClick={() => setType('')}>All</button>
          {types.map((t) => {
            const c = CATEGORIES[t];
            return (
              <button key={t} role="tab" aria-selected={type === t} className={type === t ? 'active' : ''} style={{ '--c': c.color }} onClick={() => setType(t)}>
                <c.Icon size={14} /> {c.short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card-grid">
        {data === null && !error
          ? Array.from({ length: 4 }, (_, i) => <div key={i} className="report-card glass skeleton" />)
          : items.map((a, i) => <AdvisoryCard key={a.id} advisory={a} index={i} />)}
      </div>
    </div>
  );
}
