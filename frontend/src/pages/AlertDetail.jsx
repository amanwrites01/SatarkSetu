import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Flag, Clock, Check, Copy, Loader2, PhoneCall, Lightbulb } from 'lucide-react';
import ReportCard, { TypeChip } from '../components/ReportCard.jsx';
import OfficialChannels from '../components/OfficialChannels.jsx';
import { api } from '../lib/api.js';
import { CATEGORIES } from '../lib/categories.jsx';
import { aliasHue, rupees, timeAgo } from '../lib/format.js';

const DETAIL_FIELDS = [
  ['subject', 'Email subject'], ['brand', 'Pretending to be'], ['claim', 'Claimed to be'],
  ['channel', 'Channel'], ['pretext', 'Excuse used'], ['app', 'App'], ['category', 'Scam type'],
  ['link', 'Link inside'], ['city', 'City'],
];

export function Alias({ alias, demo }) {
  const name = alias ?? (demo ? 'Sample report' : 'Anonymous');
  return (
    <span className="alias">
      <span className="avatar" style={{ '--h': aliasHue(name) }} aria-hidden>{name[0]}</span>
      {name}
    </span>
  );
}

function VoteButton({ kind, id, onDone, children, className }) {
  const [state, setState] = useState({ status: 'idle' });
  const act = async () => {
    setState({ status: 'loading' });
    try {
      const res = await api[kind](id);
      setState({ status: 'done' });
      onDone?.(res);
    } catch (err) {
      setState({ status: err.status === 409 ? 'done' : 'error', message: err.message });
    }
  };
  return (
    <div className="vote">
      <button className={className} onClick={act} disabled={state.status !== 'idle' && state.status !== 'error'}>
        {state.status === 'loading' ? <Loader2 size={16} className="spin" /> : state.status === 'done' ? <Check size={16} /> : null}
        {children(state.status === 'done')}
      </button>
      {state.status === 'error' && <small className="field-error">{state.message}</small>}
    </div>
  );
}

export default function AlertDetail() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setState({ status: 'loading' });
    api.get(id)
      .then((d) => setState({ status: 'done', ...d }))
      .catch((err) => setState({ status: 'error', error: err.message }));
  }, [id]);

  if (state.status === 'loading') {
    return <div className="container narrow"><div className="detail glass skeleton" style={{ height: 420 }} /></div>;
  }
  if (state.status === 'error') {
    return (
      <div className="container narrow">
        <div className="empty glass">
          <h3>{state.error}</h3>
          <p>It may have been removed after community flags.</p>
          <Link to="/alerts" className="btn btn-ghost">Back to alerts</Link>
        </div>
      </div>
    );
  }

  const { report, related } = state;
  const c = CATEGORIES[report.type];
  const isStory = report.type === 'story';
  const details = DETAIL_FIELDS.filter(([k]) => report[k]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report.identifier);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="container narrow">
      <Link to={isStory ? '/stories' : '/alerts'} className="back-link"><ArrowLeft size={16} /> {isStory ? 'All stories' : 'All alerts'}</Link>

      <article className="detail glass" style={{ '--c': c.color }}>
        <div className="report-card-top">
          <TypeChip type={report.type} />
          {report.demo && <span className="chip chip-muted">Sample</span>}
        </div>

        {isStory ? (
          <h1 className="detail-title">{report.title}</h1>
        ) : (
          <div className="identifier-row">
            <h1 className="mono detail-identifier">{report.identifier}</h1>
            <button className="icon-btn" onClick={copy} aria-label="Copy">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
          </div>
        )}

        <div className="detail-meta">
          <Alias alias={report.alias} demo={report.demo} />
          <span><Clock size={14} /> {timeAgo(report.createdAt)}</span>
          {report.amount > 0 && <span className="amount">{isStory ? 'Lost ' : 'Asked for '}{rupees(report.amount)}</span>}
        </div>

        <p className="detail-body">{report.description}</p>

        {report.lesson && (
          <div className="lesson"><Lightbulb size={18} /><p>{report.lesson}</p></div>
        )}

        {details.length > 0 && (
          <dl className="detail-grid">
            {details.map(([k, label]) => (
              <div key={k}><dt>{label}</dt><dd className={k === 'link' ? 'mono break' : ''}>{report[k]}</dd></div>
            ))}
          </dl>
        )}

        <div className="detail-actions">
          <VoteButton
            kind="confirm"
            id={report.id}
            className="btn btn-primary"
            onDone={(res) => res?.confirmations != null && setState((s) => ({ ...s, report: { ...s.report, confirmations: res.confirmations } }))}
          >
            {(done) => (done ? 'Thanks for confirming' : isStory ? 'This helped me' : 'I got this too')}
          </VoteButton>
          <span className="confirms"><Users size={15} /> {report.confirmations} {isStory ? 'found this helpful' : 'people saw this too'}</span>
          <VoteButton kind="flag" id={report.id} className="btn btn-quiet">
            {(done) => (done ? 'Flagged for review' : <><Flag size={14} /> Wrong or abusive</>)}
          </VoteButton>
        </div>
      </article>

      {!isStory && (
        <aside className="tips glass">
          <h3>If this contacted you</h3>
          <ul>{c.redFlags.map((f) => <li key={f}>{f}</li>)}</ul>
          <p>Lost money? <a href="tel:1930"><PhoneCall size={14} /> Call 1930</a> or report at <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">cybercrime.gov.in</a>.</p>
        </aside>
      )}

      <OfficialChannels type={report.type} title={isStory ? 'Need help?' : 'Got this too? Report it officially'} />

      {related.length > 0 && (
        <section className="section">
          <h2>Other reports of this {c.short.toLowerCase().replace(/s$/, '')}</h2>
          <div className="card-grid">{related.map((r, i) => <ReportCard key={r.id} report={r} index={i} />)}</div>
        </section>
      )}
    </div>
  );
}
