import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Loader2, ShieldAlert, ShieldQuestion, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../lib/api.js';
import { CATEGORIES } from '../lib/categories.jsx';

const RISK = {
  high: { Icon: ShieldAlert, title: 'High risk: reported by the community', tone: 'danger' },
  caution: { Icon: AlertTriangle, title: 'Caution: this has been reported', tone: 'warn' },
  unknown: { Icon: ShieldQuestion, title: 'No reports yet', tone: 'neutral' },
};

export default function ScamChecker() {
  const [value, setValue] = useState('');
  const [state, setState] = useState({ status: 'idle' });

  const check = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    setState({ status: 'loading' });
    try {
      setState({ status: 'done', result: await api.lookup(value.trim()) });
    } catch (err) {
      setState({ status: 'error', error: err.message });
    }
  };

  const result = state.result;
  const risk = result && RISK[result.risk];

  return (
    <div className="checker">
      <form className="checker-form glass" onSubmit={check} role="search">
        <Search size={20} className="checker-icon" aria-hidden />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste a number, UPI ID, website or email…"
          aria-label="Check a phone number, UPI ID, website or email"
          maxLength={500}
        />
        <button className="btn btn-primary" disabled={state.status === 'loading'}>
          {state.status === 'loading' ? <Loader2 size={16} className="spin" /> : 'Check'}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {state.status === 'error' && (
          <motion.p key="err" className="form-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {state.error}
          </motion.p>
        )}
        {state.status === 'done' && (
          <motion.div
            key={result.value}
            className={`checker-result glass tone-${risk.tone}`}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="checker-result-head">
              <risk.Icon size={22} />
              <div>
                <strong>{risk.title}</strong>
                <span className="mono">{result.normalized ?? result.value}</span>
              </div>
            </div>
            {result.matches.length > 0 ? (
              <>
                <p>
                  {result.matches.length} report{result.matches.length > 1 ? 's' : ''} and{' '}
                  {result.signal - result.matches.length} confirmation{result.signal - result.matches.length === 1 ? '' : 's'}. Do not
                  pay, share OTPs or click links.
                </p>
                <Link to={`/alerts/${result.matches[0].id}`} className="link-arrow">
                  View report <ArrowRight size={14} />
                </Link>
              </>
            ) : (
              <>
                <p>No reports doesn't mean it's safe. Stay alert, and if it looks like a scam, warn others.</p>
                {result.type && (
                  <Link to={`/report/${result.type}`} state={{ identifier: value.trim() }} className="link-arrow">
                    Report this {CATEGORIES[result.type].short.toLowerCase().replace(/s$/, '')} <ArrowRight size={14} />
                  </Link>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
