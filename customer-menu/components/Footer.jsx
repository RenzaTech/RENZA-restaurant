'use client';

export default function Footer({ restaurant }) {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="renza-footer">
      <div>© {currentYear} {restaurant?.name || 'Restaurant Dining'}</div>
      <div>
        Built with <span className="heart">♥</span> by RENZA
      </div>
    </footer>
  );
}
