import PortalClient from '../../components/PortalClient';
import { resolveImageUrl } from '../../utils/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function generateMetadata({ params }) {
  const slug = params?.slug || 'anbude-cafe';
  const fallback = {
    title: "Anbu'de Cafe — Digital Dining Menu",
    description: 'Welcome to your digital table experience. Scan, Discover, Dine.',
  };

  try {
    const res = await fetch(`${API_URL}/api/menu/${slug}`, { cache: 'no-store' });
    if (!res.ok) return fallback;
    const data = await res.json();
    const r = data.restaurant || data;
    const title = r.name ? `${r.name} — Digital Dining Menu` : fallback.title;
    const description = r.description || fallback.description;
    const logo = resolveImageUrl(r.logoUrl);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        ...(logo ? { images: [{ url: logo, alt: `${title} logo` }] } : {}),
      },
    };
  } catch (_) {
    return fallback;
  }
}

export default function DynamicRestaurantPage({ params, searchParams }) {
  const initialView = searchParams?.category ? 'dishes' : (searchParams?.view || 'hub');
  const initialCategoryName = searchParams?.category || null;
  const initialDishId = searchParams?.dish || null;
  const initialAngle = searchParams?.angle === 'top' ? 'top' : 'front';
  const initialTable = searchParams?.table || searchParams?.t || searchParams?.tableNumber || searchParams?.tableno || searchParams?.tbl || null;

  return (
    <PortalClient
      params={params}
      initialView={initialView}
      initialCategoryName={initialCategoryName}
      initialDishId={initialDishId}
      initialAngle={initialAngle}
      initialTable={initialTable}
      searchParams={searchParams}
    />
  );
}
