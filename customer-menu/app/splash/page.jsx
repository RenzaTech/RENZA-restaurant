import { redirect } from 'next/navigation';

export default function SplashPage({ searchParams }) {
  const table =
    searchParams?.table ||
    searchParams?.t ||
    searchParams?.tableNumber ||
    searchParams?.tableno ||
    searchParams?.tbl ||
    '';
  const target = table ? `/menu/anbude-cafe?table=${table}` : `/menu/anbude-cafe`;
  redirect(target);
}
