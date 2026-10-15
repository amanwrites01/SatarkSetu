import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Radio, Siren, PhoneCall } from 'lucide-react';
import ScamChecker from '../components/ScamChecker.jsx';
import ReportCard from '../components/ReportCard.jsx';
import AdvisoryCard from '../components/AdvisoryCard.jsx';
import TiltCard from '../components/TiltCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { api } from '../lib/api.js';
import { CATEGORIES, REPORT_TYPES } from '../lib/categories.jsx';
import { compact } from '../lib/format.js';

const Hero3D = lazy(() => import('../components/Hero3D.jsx'));

const headline = ['Spot it.', 'Report it.', 'Stop it.'];

function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <motion.span className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Radio size={14} className="pulse-dot" /> Community scam radar
        </motion.span>
        <h1>
          {headline.map((word, i) => (
            <motion.span
              key={word}
              className={`hero-line line-${i}`}
              initial={{ opacity: 0, y: 40, rotateX: -60 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.1 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.p className="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          Got a strange call, a "refund" UPI request or a too-good-to-be-true link? Check it against reports from people
          like you, and warn the next person in under a minute.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <ScamChecker />
        </motion.div>
      </div>
      <div className="hero-visual" aria-hidden>
        <Suspense fallback={<div className="hero-fallback" />}>
          <Hero3D />
        </Suspense>
        <div className="hero-badge glass badge-a"><Siren size={14} /> Threat deflected</div>
        <div className="hero-badge glass badge-b"><span className="dot" /> Live community reports</div>
      </div>
    </section>
  );
}

function Stats({ stats }) {
  const items = [
    { label: 'Scams reported', value: stats?.total },
    { label: 'Times confirmed by others', value: stats?.confirmations },
    { label: 'Reports this week', value: stats?.lastWeek },
    { label: 'Stories shared', value: stats?.byType.story },
  ];
  return (
    <section className="stats">
      {items.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.08} className="stat glass">
          <strong>{s.value == null ? '–' : compact(s.value)}</strong>
          <span>{s.label}</span>
        </Reveal>
      ))}
    </section>
  );
}

function CategoryBento({ stats }) {
  const tiles = [...REPORT_TYPES, 'story'];
  return (
    <section className="section">
      <Reveal className="section-head">
        <span className="eyebrow">What happened?</span>
        <h2>Pick what you want to report</h2>
      </Reveal>
      <div className="bento">
        {tiles.map((key, i) => {
          const c = CATEGORIES[key];
          const to = key === 'story' ? '/stories' : `/report/${key}`;
          return (
            <Reveal key={key} delay={i * 0.06} className={`bento-cell cell-${key}`}>
              <TiltCard className="bento-card" style={{ '--c': c.color }}>
                <Link to={to} className="card-link" aria-label={c.label} />
                <div className="bento-icon"><c.Icon size={26} /></div>
                <h3>{key === 'story' ? 'Share your story anonymously' : `Report a ${c.label.toLowerCase()}`}</h3>
                <p>{c.pitch}</p>
                <div className="bento-foot">
                  <span>{stats ? `${stats.byType[key]} ${key === 'story' ? 'stories' : 'reports'}` : ' '}</span>
                  <ArrowUpRight size={20} className="bento-arrow" />
                </div>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function RecentAlerts() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    api.list({ type: 'alerts', limit: 6 }).then((d) => setItems(d.items)).catch(() => setItems([]));
  }, []);

  return (
    <section className="section">
      <Reveal className="section-head row">
        <div>
          <span className="eyebrow"><span className="live-dot" /> Live feed</span>
          <h2>Latest community alerts</h2>
        </div>
        <Link to="/alerts" className="btn btn-ghost">All alerts <ArrowRight size={16} /></Link>
      </Reveal>
      {items?.length === 0 ? (
        <div className="empty glass">
          <h3>No community reports yet</h3>
          <p>Be the first to warn others. Got a scam call, link or UPI request?</p>
          <Link to="/report" className="btn btn-primary">Report a scam</Link>
        </div>
      ) : (
        <div className="card-grid">
          {items === null
            ? Array.from({ length: 6 }, (_, i) => <div key={i} className="report-card glass skeleton" />)
            : items.map((r, i) => <ReportCard key={r.id} report={r} index={i} />)}
        </div>
      )}
    </section>
  );
}

function OfficialAdvisories() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    api.advisories().then((d) => setItems(d.items.slice(0, 3))).catch(() => setItems([]));
  }, []);
  if (items?.length === 0) return null;

  return (
    <section className="section">
      <Reveal className="section-head row">
        <div>
          <span className="eyebrow">Verified by government sources</span>
          <h2>Official advisories</h2>
        </div>
        <Link to="/advisories" className="btn btn-ghost">All advisories <ArrowRight size={16} /></Link>
      </Reveal>
      <div className="card-grid">
        {items === null
          ? Array.from({ length: 3 }, (_, i) => <div key={i} className="report-card glass skeleton" />)
          : items.map((a, i) => <AdvisoryCard key={a.id} advisory={a} index={i} compact />)}
      </div>
    </section>
  );
}

function RedFlags() {
  return (
    <section className="section">
      <Reveal className="section-head">
        <span className="eyebrow">Learn the tells</span>
        <h2>Red flags, in ten seconds</h2>
      </Reveal>
      <div className="flags">
        {REPORT_TYPES.map((key, i) => {
          const c = CATEGORIES[key];
          return (
            <Reveal key={key} delay={i * 0.07} className="flag-card glass">
              <div className="flag-head" style={{ '--c': c.color }}><c.Icon size={18} /> {c.short}</div>
              <ul>{c.redFlags.map((f) => <li key={f}>{f}</li>)}</ul>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Emergency() {
  return (
    <Reveal className="section emergency glass">
      <div>
        <span className="eyebrow danger"><Siren size={14} /> Lost money?</span>
        <h2>Call <span className="grad-danger">1930</span> right away</h2>
        <p>
          India's National Cyber Crime Helpline can freeze stolen money if you report quickly, ideally within the
          first few hours. You can also file a complaint at cybercrime.gov.in. Then share your story here to warn others.
        </p>
      </div>
      <div className="emergency-actions">
        <a href="tel:1930" className="btn btn-danger btn-lg"><PhoneCall size={18} /> Call 1930</a>
        <Link to="/stories" className="btn btn-ghost btn-lg">Share your story</Link>
      </div>
    </Reveal>
  );
}

export default function Home() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.stats().then(setStats).catch(() => {}); }, []);

  return (
    <>
      <Hero />
      <Stats stats={stats} />
      <CategoryBento stats={stats} />
      <OfficialAdvisories />
      <RecentAlerts />
      <RedFlags />
      <Emergency />
    </>
  );
}
