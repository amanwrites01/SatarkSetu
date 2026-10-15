import { Link } from 'react-router-dom';
import { PhoneCall, ExternalLink } from 'lucide-react';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand"><Logo size={28} /><span>Satark<em>Setu</em></span></Link>
          <p>A community bridge against scams. Every report makes the next person a little harder to fool.</p>
        </div>

        <div className="footer-help glass">
          <h4>Already lost money?</h4>
          <p>Speed matters. Report within the first hours so the money can be frozen.</p>
          <div className="footer-help-actions">
            <a className="btn btn-danger" href="tel:1930"><PhoneCall size={16} /> Call 1930</a>
            <a className="btn btn-ghost" href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">
              cybercrime.gov.in <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer">
          <Link to="/report/phishing">Report phishing email</Link>
          <Link to="/report/website">Report fake website</Link>
          <Link to="/report/phone">Report scam number</Link>
          <Link to="/report/upi">Report fake UPI request</Link>
          <Link to="/stories">Share your story</Link>
          <Link to="/advisories">Official advisories</Link>
        </nav>
      </div>
      <p className="footer-note">
        Community reports are unverified and shared for awareness. SatarkSetu is not a government or law-enforcement service.
        © {new Date().getFullYear()} SatarkSetu
      </p>
    </footer>
  );
}
