import MenuClient from './MenuClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return url;
}

export async function generateMetadata({ params }) {
  const fallback = {
    title: 'Renza — Digital Restaurant Menu',
    description: 'See the dish before you order.',
  };

  try {
    const response = await fetch(`${API_URL}/api/menu/${params.slug}`, { cache: 'no-store' });
    if (!response.ok) return fallback;
    const data = await response.json();
    const restaurant = data.restaurant || data;
    const title = restaurant.name || fallback.title;
    const description = restaurant.description || fallback.description;
    const logoUrl = resolveImageUrl(restaurant.logoUrl);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        ...(logoUrl ? { images: [{ url: logoUrl, alt: `${title} logo` }] } : {}),
      },
      twitter: {
        card: logoUrl ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(logoUrl ? { images: [logoUrl] } : {}),
      },
    };
  } catch (error) {
    return fallback;
  }
}

export default function MenuPage({ params }) {
  return <MenuClient params={params} />;
}