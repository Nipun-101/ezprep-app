import GoogleOAuthReturn from '@/components/auth/GoogleOAuthReturn';
import MarketingHome from '@/components/MarketingHome';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams?: { code?: string; state?: string; error?: string };
}) {
  if (searchParams?.code || searchParams?.error) {
    return <GoogleOAuthReturn />;
  }

  return <MarketingHome />;
}