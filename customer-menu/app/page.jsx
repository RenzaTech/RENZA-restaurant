import EmptyState from '../components/EmptyState';
import MenuClient from './menu/[slug]/MenuClient';
import { generateMetadata as generateMenuMetadata } from './menu/[slug]/page';

const DEFAULT_SLUG = process.env.NEXT_PUBLIC_DEFAULT_SLUG || 'anbude-cafe';

export async function generateMetadata() {
  if (!DEFAULT_SLUG) {
    return {
      title: 'Renza — Digital Restaurant Menu',
      description: 'Restaurant menu unavailable.',
    };
  }

  return generateMenuMetadata({ params: { slug: DEFAULT_SLUG } });
}

export default function Home() {
  if (!DEFAULT_SLUG) return <EmptyState variant="notFound" />;
  return <MenuClient params={{ slug: DEFAULT_SLUG }} />;
}
