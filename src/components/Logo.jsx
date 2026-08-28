export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="8" x2="10" y2="20" stroke="#8b7fff" strokeWidth="1.4" opacity="0.7" />
      <line x1="20" y1="8" x2="30" y2="20" stroke="#5eead4" strokeWidth="1.4" opacity="0.7" />
      <line x1="10" y1="20" x2="20" y2="32" stroke="#5eead4" strokeWidth="1.4" opacity="0.7" />
      <line x1="30" y1="20" x2="20" y2="32" stroke="#8b7fff" strokeWidth="1.4" opacity="0.7" />
      <line x1="10" y1="20" x2="30" y2="20" stroke="#ffd37a" strokeWidth="1.2" opacity="0.5" />
      <circle cx="20" cy="8" r="4" fill="#ffd37a" />
      <circle cx="10" cy="20" r="3.4" fill="#5eead4" />
      <circle cx="30" cy="20" r="3.4" fill="#8b7fff" />
      <circle cx="20" cy="32" r="3.4" fill="#5eead4" />
    </svg>
  );
}
