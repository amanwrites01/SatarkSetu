import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ShieldAlert, User, LogIn } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../lib/AuthContext.jsx';

const LINKS = [
  { to: '/alerts', label: 'Live Alerts' },
  { to: '/advisories', label: 'Advisories' },
  { to: '/stories', label: 'Stories' },
  { to: '/report', label: 'Report' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="brand" aria-label="SatarkSetu home">
          <Logo />
          <span>Satark<em>Setu</em></span>
        </Link>

        <nav className="nav-links" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && <motion.span layoutId="nav-pill" className="nav-pill" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <Link
            to="/login"
            className={`btn btn-ghost nav-user-btn ${user ? 'is-logged-in' : ''}`}
            title={user ? `Signed in as ${user.email}` : 'Sign in'}
          >
            {user ? (
              <>
                <span className="user-avatar-badge">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                <span className="nav-username">{user.name}</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </Link>

          <Link to="/report" className="btn btn-primary nav-cta">
            <ShieldAlert size={16} /> Report a scam
          </Link>
        </div>

        <button className="icon-btn nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-menu glass"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
            <NavLink to="/login">
              {user ? `Account (${user.name})` : 'Sign In'}
            </NavLink>
            <Link to="/report" className="btn btn-primary">Report a scam</Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
