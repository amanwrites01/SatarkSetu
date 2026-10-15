import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, LogOut, Eye, EyeOff, Trash2, Loader2, Flag, RefreshCw } from 'lucide-react';
import { TypeChip } from '../components/ReportCard.jsx';
import { api } from '../lib/api.js';
import { timeAgo } from '../lib/format.js';

const TOKEN_KEY = 'satarksetu-admin-token';
const TABS = [
  { key: 'hidden', label: 'Auto-hidden' },
  { key: 'published', label: 'Published' },
  { key: 'removed', label: 'Removed' },
];

const readToken = () => { try { return sessionStorage.getItem(TOKEN_KEY) ?? ''; } catch { return ''; } };
const writeToken = (t) => { try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ } };

function Login({ onLogin, error }) {
  const [value, setValue] = useState('');
  return (
    <form className="form-card glass admin-login" onSubmit={(e) => { e.preventDefault(); onLogin(value.trim()); }}>
      <Lock size={28} />
      <h2>Moderator sign-in</h2>
      <p>Enter the <span className="mono">ADMIN_TOKEN</span> configured on the server.</p>
      <label className="field">
        <span>Admin token</span>
        <input type="password" value={value} onChange={(e) => setValue(e.target.value)} autoComplete="current-password" />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-primary" disabled={!value.trim()}>Sign in</button>
    </form>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState(readToken);
  const [tab, setTab] = useState('hidden');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async (t = token) => {
    if (!t) return;
    setData(null);
    setError(null);
    try {
      setData(await api.admin.list(t, { status: tab, sort: tab === 'published' ? 'flagged' : 'recent', limit: 50 }));
    } catch (err) {
      if (err.status === 401 || err.status === 503) { writeToken(''); setToken(''); }
      setError(err.message);
    }
  }, [token, tab]);

  useEffect(() => { load(); }, [load]);

  const login = (t) => { writeToken(t); setToken(t); };
  const logout = () => { writeToken(''); setToken(''); setData(null); };

  const act = async (id, action) => {
    setBusy(id);
    try {
      if (action === 'delete') {
        if (!window.confirm('Permanently delete this report? This cannot be undone.')) return;
        await api.admin.remove(token, id);
      } else {
        await api.admin.setStatus(token, id, action);
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  if (!token) return <div className="container narrow"><Login onLogin={login} error={error} /></div>;

  return (
    <div className="container">
      <header className="page-head row">
        <div>
          <span className="eyebrow">Moderation</span>
          <h1>Review reports</h1>
          <p className="lead">Reports are hidden automatically after enough community flags. Restore the genuine ones and remove the abusive ones.</p>
        </div>
        <div className="admin-head-actions">
          <button className="btn btn-ghost" onClick={() => load()}><RefreshCw size={16} /> Refresh</button>
          <button className="btn btn-ghost" onClick={logout}><LogOut size={16} /> Sign out</button>
        </div>
      </header>

      <div className="toolbar glass">
        <div className="segmented" role="tablist">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'active' : ''} style={{ '--c': '#2ee6c5' }} onClick={() => setTab(t.key)}>
              {t.label} {data?.counts?.[t.key] != null && <span className="count">{data.counts[t.key]}</span>}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {data === null && !error ? (
        <div className="center"><Loader2 className="spin" /></div>
      ) : data?.items.length === 0 ? (
        <div className="empty glass"><h3>Nothing here</h3><p>No {TABS.find((t) => t.key === tab).label.toLowerCase()} reports.</p></div>
      ) : (
        <div className="admin-list">
          {data?.items.map((r) => (
            <article key={r.id} className="admin-row glass">
              <div className="admin-row-main">
                <div className="report-card-top">
                  <TypeChip type={r.type} />
                  <span className="chip chip-muted"><Flag size={12} /> {r.flags} flags</span>
                  <span className="chip chip-muted">{r.confirmations} confirmations</span>
                </div>
                <h3 className={r.title ? '' : 'mono identifier'}>{r.title ?? r.identifier}</h3>
                <p className="clamp-3">{r.description}</p>
                <small>{r.alias ?? 'Sample'} · {timeAgo(r.createdAt)} · {r.status === 'published' ? <Link to={`/alerts/${r.id}`}>open</Link> : r.status}</small>
              </div>
              <div className="admin-row-actions">
                {r.status !== 'published' && <button className="btn btn-primary" disabled={busy === r.id} onClick={() => act(r.id, 'published')}><Eye size={15} /> Publish</button>}
                {r.status === 'published' && <button className="btn btn-ghost" disabled={busy === r.id} onClick={() => act(r.id, 'hidden')}><EyeOff size={15} /> Hide</button>}
                {r.status !== 'removed' && <button className="btn btn-ghost" disabled={busy === r.id} onClick={() => act(r.id, 'removed')}>Remove</button>}
                <button className="btn btn-quiet" disabled={busy === r.id} onClick={() => act(r.id, 'delete')}><Trash2 size={15} /> Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
