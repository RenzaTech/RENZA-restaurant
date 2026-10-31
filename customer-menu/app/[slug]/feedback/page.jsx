import PortalClient from '../../../components/PortalClient';

export async function generateMetadata({ params }) {
  const slug = params?.slug || 'anbude-cafe';
  return {
    title: `Guest Feedback — ${slug}`,
    description: 'Share your dining feedback anonymously.',
  };
}

export default function DynamicFeedbackPage({ params }) {
  return <PortalClient params={params} initialView="feedback" />;
}
