import PortalClient from '../../components/PortalClient';

const DEFAULT_SLUG = process.env.NEXT_PUBLIC_DEFAULT_SLUG || 'anbude-cafe';

export const metadata = {
  title: 'Anonymous Feedback — Scanzaa',
  description: 'Share your dining feedback anonymously with restaurant management.',
};

export default function DirectFeedbackPage() {
  return <PortalClient params={{ slug: DEFAULT_SLUG }} initialView="feedback" />;
}
