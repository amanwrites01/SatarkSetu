import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container narrow">
      <div className="empty glass not-found">
        <Compass size={40} />
        <h1>404</h1>
        <p>This page doesn't exist, but scammers do. Head back and stay alert.</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    </div>
  );
}
