export default function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2ee6c5" />
          <stop offset="1" stopColor="#7c9cff" />
        </linearGradient>
      </defs>
      <path d="M32 4 56 13v17c0 15-10 26-24 30C18 56 8 45 8 30V13Z" fill="#0b1224" stroke="url(#logo-g)" strokeWidth="4" />
      <path d="M18 36c6-9 22-9 28 0" fill="none" stroke="#ffb020" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="25" r="4.5" fill="#ff4d6d" className="logo-pulse" />
    </svg>
  );
}
