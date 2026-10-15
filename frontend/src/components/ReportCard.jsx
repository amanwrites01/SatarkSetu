import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock } from 'lucide-react';
import { CATEGORIES } from '../lib/categories.jsx';
import { rupees, timeAgo } from '../lib/format.js';

export function TypeChip({ type }) {
  const { Icon, label, color } = CATEGORIES[type];
  return (
    <span className="chip" style={{ '--c': color }}>
      <Icon size={13} /> {label}
    </span>
  );
}

export default function ReportCard({ report, index = 0 }) {
  const meta = [report.brand, report.claim, report.pretext, report.channel].filter(Boolean).slice(0, 2);
  return (
    <motion.article
      className="report-card glass"
      style={{ '--c': CATEGORIES[report.type].color }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/alerts/${report.id}`} className="card-link" aria-label={`Open report ${report.identifier}`} />
      <div className="report-card-top">
        <TypeChip type={report.type} />
        {report.demo && <span className="chip chip-muted">Sample</span>}
      </div>
      <h3 className="mono identifier">{report.identifier}</h3>
      {meta.length > 0 && <p className="report-meta">{meta.join(' · ')}</p>}
      <p className="clamp-3">{report.description}</p>
      <div className="report-card-foot">
        <span><Clock size={13} /> {timeAgo(report.createdAt)}</span>
        {report.amount > 0 && <span>{rupees(report.amount)}</span>}
        <span className="confirms"><Users size={13} /> {report.confirmations} saw this too</span>
      </div>
    </motion.article>
  );
}
