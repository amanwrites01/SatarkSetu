import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PenLine, X, Heart, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import ReportForm from '../components/ReportForm.jsx';
import { Alias } from './AlertDetail.jsx';
import { api } from '../lib/api.js';
import { CATEGORIES } from '../lib/categories.jsx';
import { rupees, timeAgo } from '../lib/format.js';

const PAGE = 9;

function StoryCard({ story, index }) {
  return (
    <motion.article
      className="story-card glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/alerts/${story.id}`} className="card-link" aria-label={`Read story: ${story.title}`} />
      <div className="report-card-top">
        {story.category && <span className="chip" style={{ '--c': CATEGORIES.story.color }}>{story.category}</span>}
        {story.demo && <span className="chip chip-muted">Sample</span>}
      </div>
      <h3>{story.title}</h3>
      <p className="clamp-4">{story.description}</p>
      {story.lesson && <blockquote className="clamp-2">{story.lesson}</blockquote>}
      <div className="report-card-foot">
        <Alias alias={story.alias} demo={story.demo} />
        <span><Clock size={13} /> {timeAgo(story.createdAt)}</span>
        {story.amount > 0 && <span className="amount">{rupees(story.amount)}</span>}
        <span className="confirms"><Heart size={13} /> {story.confirmations}</span>
      </div>
    </motion.article>
  );
}

export default function StoriesPage() {
  const [writing, setWriting] = useState(false);
  const [posted, setPosted] = useState(null);
  const [data, setData] = useState({ items: null, total: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    api.list({ type: 'story', limit: PAGE }).then(setData).catch(() => setData({ items: [], total: 0 }));
  }, []);

  const onPosted = (story) => {
    setPosted(story);
    setWriting(false);
    setData((d) => ({ total: d.total + 1, items: [story, ...(d.items ?? [])] }));
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const d = await api.list({ type: 'story', limit: PAGE, offset: data.items.length });
      setData((prev) => ({ total: d.total, items: [...prev.items, ...d.items] }));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="container">
      <header className="page-head row">
        <div>
          <span className="eyebrow" style={{ '--c': CATEGORIES.story.color }}>Anonymous stories</span>
          <h1>It happened to them. <span className="grad">Don't let it happen to you.</span></h1>
          <p className="lead">Real experiences, shared without names. No login, a random alias, and phone numbers or emails in your story are hidden automatically.</p>
        </div>
        {!writing && (
          <button className="btn btn-primary btn-lg" onClick={() => { setWriting(true); setPosted(null); }}>
            <PenLine size={18} /> Share your story
          </button>
        )}
      </header>

      <AnimatePresence>
        {posted && (
          <motion.div className="toast glass" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <CheckCircle2 size={20} /> Your story is live as <strong>{posted.alias}</strong>. Thank you for warning others.
            <button className="icon-btn" onClick={() => setPosted(null)} aria-label="Dismiss"><X size={16} /></button>
          </motion.div>
        )}
        {writing && (
          <motion.section
            className="form-card glass"
            style={{ '--c': CATEGORIES.story.color }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="form-card-head">
              <div className="bento-icon"><CATEGORIES.story.Icon size={24} /></div>
              <div>
                <h2>Share what happened</h2>
                <ul className="mini-list">{CATEGORIES.story.redFlags.map((f) => <li key={f}>{f}</li>)}</ul>
              </div>
              <button className="icon-btn" onClick={() => setWriting(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <ReportForm type="story" onSuccess={onPosted} />
          </motion.section>
        )}
      </AnimatePresence>

      <div className="story-grid">
        {data.items === null
          ? Array.from({ length: 3 }, (_, i) => <div key={i} className="story-card glass skeleton" />)
          : data.items.map((s, i) => <StoryCard key={s.id} story={s} index={i % PAGE} />)}
      </div>
      {data.items?.length === 0 && <div className="empty glass"><h3>No stories yet</h3><p>Yours could be the first.</p></div>}

      {data.items && data.items.length < data.total && (
        <div className="center">
          <button className="btn btn-ghost btn-lg" onClick={loadMore} disabled={loadingMore}>
            {loadingMore && <Loader2 size={16} className="spin" />} More stories
          </button>
        </div>
      )}
    </div>
  );
}
