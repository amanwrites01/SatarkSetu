import { motion } from 'framer-motion';
import { BadgeCheck, ExternalLink, CalendarDays } from 'lucide-react';
import { TypeChip } from './ReportCard.jsx';
import { CATEGORIES } from '../lib/categories.jsx';

const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdvisoryCard({ advisory: a, index = 0, compact = false }) {
  return (
    <motion.article
      className="advisory-card glass"
      style={{ '--c': CATEGORIES[a.type].color }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05 }}
    >
      <div className="report-card-top">
        <span className="chip official-chip"><BadgeCheck size={13} /> Official advisory</span>
        <TypeChip type={a.type} />
      </div>
      <h3>{a.title}</h3>
      <p className="advisory-issuer">
        {a.issuer} · <CalendarDays size={13} /> {dateFmt.format(new Date(a.published))}
      </p>
      <p className={compact ? 'clamp-3' : ''}>{a.summary}</p>
      {!compact && (
        <ul className="mini-list">{a.tips.map((t) => <li key={t}>{t}</li>)}</ul>
      )}
      <div className="report-card-foot">
        <a href={a.sourceUrl} target="_blank" rel="noreferrer">Read official source <ExternalLink size={13} /></a>
        {a.reportUrl && (
          <a href={a.reportUrl} target={a.reportUrl.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="confirms">
            Report officially <ExternalLink size={13} />
          </a>
        )}
      </div>
    </motion.article>
  );
}
