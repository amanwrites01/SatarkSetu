import { Landmark, ArrowUpRight } from 'lucide-react';
import { OFFICIAL_CHANNELS } from '../lib/categories.jsx';

export default function OfficialChannels({ type, title = 'Also report it officially' }) {
  return (
    <aside className="official glass">
      <h3><Landmark size={18} /> {title}</h3>
      <p>Reports on SatarkSetu warn the community but aren't sent to the authorities. Use these official channels too:</p>
      <div className="official-links">
        {OFFICIAL_CHANNELS[type].map((c) => (
          <a key={c.href} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="official-link">
            <strong>{c.label} <ArrowUpRight size={14} /></strong>
            <span>{c.note}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}
