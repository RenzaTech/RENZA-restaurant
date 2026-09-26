'use client';

function formatExternalUrl(url) {
  if (!url || !url.trim()) return '';
  const clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return `https://${clean}`;
  }
  return clean;
}

export default function Footer({ restaurant }) {
  const currentYear = new Date().getFullYear();
  const renzaFeedbackUrl = restaurant?.superAdminFeedbackUrl
    ? formatExternalUrl(restaurant.superAdminFeedbackUrl)
    : null;

  return (
    <footer className="renza-footer">
      <div>© {currentYear} {restaurant?.name || 'Restaurant Dining'}</div>
      <div className="renza-footer-branding">
        Powered by Renza QR Platform
      </div>
      {renzaFeedbackUrl && (
        <div className="renza-footer-feedback">
          <a
            href={renzaFeedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="renza-issue-link"
            title="Report an issue or provide feedback on Renza platform"
          >
            [ Report an app issue / Renza Feedback ]
          </a>
        </div>
      )}
    </footer>
  );
}
