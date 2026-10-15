import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, SearchX } from 'lucide-react';
import ReportCard from '../components/ReportCard.jsx';
import { api } from '../lib/api.js';
import { CATEGORIES, REPORT_TYPES } from '../lib/categories.jsx';

const PAGE = 12;

export default function AlertsPage() {
  const [params, setParams] = useSearchParams();
  const type = REPORT_TYPES.includes(params.get('type')) ? params.get('type') : 'alerts';
  const sort = params.get('sort') === 'confirmed' ? 'confirmed' : 'recent';
  const q = params.get('q') ?? '';

  const [query, setQuery] = useState(q);
  const [data, setData] = useState({ items: null, total: 0 });
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  // Debounce the search box into the URL.
  useEffect(() => {
    const t = setTimeout(() => { if (query !== q) setParam('q', query.trim()); }, 300);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    setData({ items: null, total: 0 });
    setError(null);
    api.list({ type, sort, q, limit: PAGE })
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => { if (!cancelled) { setError(err.message); setData({ items: [], total: 0 }); } });
    return () => { cancelled = true; };
  }, [type, sort, q]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const d = await api.list({ type, sort, q, limit: PAGE, offset: data.items.length });
      setData((prev) => ({ total: d.total, items: [...prev.items, ...d.items] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const filters = [{ key: 'alerts', label: 'All', color: '#e8ecf8' }, ...REPORT_TYPES.map((k) => ({ key: k, label: CATEGORIES[k].short, color: CATEGORIES[k].color, Icon: CATEGORIES[k].Icon }))];

  return (
    <div className="container">
      <header className="page-head">
        <span className="eyebrow"><span className="live-dot" /> Live feed</span>
        <h1>Community scam alerts</h1>
        <p className="lead">Numbers, UPI IDs, websites and email senders reported by people across India. Seen one of these too? Open it and confirm.</p>
      </header>

      <div className="toolbar glass">
        <div className="search-box">
          <Search size={18} aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search number, UPI ID, domain, brand, city…"
            aria-label="Search alerts"
          />
        </div>
        <div className="segmented" role="tablist" aria-label="Filter by type">
          {filters.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={type === f.key}
              className={type === f.key ? 'active' : ''}
              style={{ '--c': f.color }}
              onClick={() => setParam('type', f.key === 'alerts' ? '' : f.key)}
            >
              {f.Icon && <f.Icon size={14} />} {f.label}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setParam('sort', e.target.value === 'recent' ? '' : e.target.value)} aria-label="Sort">
          <option value="recent">Newest first</option>
          <option value="confirmed">Most confirmed</option>
        </select>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {data.items !== null && data.items.length === 0 && !error ? (
        <div className="empty glass">
          <SearchX size={32} />
          <h3>No alerts match</h3>
          <p>Try a different search, or be the first to report it.</p>
        </div>
      ) : (
        <div className="card-grid">
          {data.items === null
            ? Array.from({ length: 6 }, (_, i) => <div key={i} className="report-card glass skeleton" />)
            : data.items.map((r, i) => <ReportCard key={r.id} report={r} index={i % PAGE} />)}
        </div>
      )}

      {data.items && data.items.length < data.total && (
        <div className="center">
          <button className="btn btn-ghost btn-lg" onClick={loadMore} disabled={loadingMore}>
            {loadingMore && <Loader2 size={16} className="spin" />} Load more ({data.total - data.items.length} left)
          </button>
        </div>
      )}
    </div>
  );
}
