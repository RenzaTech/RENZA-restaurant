import { redirect } from 'next/navigation';

export default function RestaurantSplashPage({ params, searchParams }) {
  const slug = params?.slug || 'anbude-cafe';
  const table =
    searchParams?.table ||
    searchParams?.t ||
    searchParams?.tableNumber ||
    searchParams?.tableno ||
    searchParams?.tbl ||
    '';
  const target = table ? `/menu/${slug}?table=${table}` : `/menu/${slug}`;
  redirect(target);
}
