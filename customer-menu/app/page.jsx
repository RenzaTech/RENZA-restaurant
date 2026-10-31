import PortalClient from '../components/PortalClient';

const DEFAULT_SLUG = process.env.NEXT_PUBLIC_DEFAULT_SLUG || 'anbude-cafe';

export const metadata = {
  title: 'Guest Dining Portal — Scanzaa',
  description: 'Welcome! View our menu, share feedback, and connect with us powered by Scanzaa.',
};

export default function Home({ searchParams }) {
  const initialTable =
    searchParams?.table ||
    searchParams?.t ||
    searchParams?.tableNumber ||
    searchParams?.tableno ||
    searchParams?.tbl ||
    null;

  return (
    <PortalClient
      params={{ slug: DEFAULT_SLUG }}
      initialTable={initialTable}
      searchParams={searchParams}
    />
  );
}
