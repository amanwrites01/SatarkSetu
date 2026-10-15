import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';
import ReportForm from '../components/ReportForm.jsx';
import OfficialChannels from '../components/OfficialChannels.jsx';
import { CATEGORIES, REPORT_TYPES } from '../lib/categories.jsx';

export default function ReportPage() {
  const { type: param } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const type = REPORT_TYPES.includes(param) ? param : null;
  const [submitted, setSubmitted] = useState(null);

  const choose = (key) => { setSubmitted(null); navigate(`/report/${key}`, { replace: true }); };
  const c = type && CATEGORIES[type];

  return (
    <div className="container narrow">
      <header className="page-head">
        <span className="eyebrow">Report a scam</span>
        <h1>What tried to scam you?</h1>
        <p className="lead">Takes under a minute. Your report instantly shows up when someone else checks the same number, ID or link.</p>
      </header>

      <div className="type-picker" role="radiogroup" aria-label="Report type">
        {REPORT_TYPES.map((key) => {
          const k = CATEGORIES[key];
          return (
            <button
              key={key}
              role="radio"
              aria-checked={type === key}
              className={`type-option glass ${type === key ? 'active' : ''}`}
              style={{ '--c': k.color }}
              onClick={() => choose(key)}
            >
              <k.Icon size={22} />
              <span>{k.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div key="ok" className="success glass" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <CheckCircle2 size={44} />
            <h2>Report published. Thank you.</h2>
            <p>You're posting as <strong>{submitted.alias}</strong>. Anyone who checks <span className="mono">{submitted.identifier}</span> will now see your warning.</p>
            <div className="success-actions">
              <Link to={`/alerts/${submitted.id}`} className="btn btn-primary">View your report <ArrowRight size={16} /></Link>
              <button className="btn btn-ghost" onClick={() => setSubmitted(null)}>Report another</button>
            </div>
            <OfficialChannels type={submitted.type} title="Next: report it to the authorities" />
          </motion.div>
        ) : type ? (
          <motion.section key={type} className="form-card glass" style={{ '--c': c.color }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="form-card-head">
              <div className="bento-icon"><c.Icon size={24} /></div>
              <div>
                <h2>Report a {c.label.toLowerCase()}</h2>
                <p>{c.pitch}</p>
              </div>
            </div>
            <ReportForm key={type} type={type} initialIdentifier={state?.identifier ?? ''} onSuccess={setSubmitted} />
            <p className="safety"><AlertTriangle size={15} /> Don't include your own OTPs, passwords, card or account numbers.</p>
          </motion.section>
        ) : (
          <motion.p key="hint" className="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Choose a type above to begin, or <Link to="/stories">share your full story anonymously</Link>.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
