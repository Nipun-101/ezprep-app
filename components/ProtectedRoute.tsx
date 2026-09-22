'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { buildLoginUrl } from '@/lib/safeRedirect';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Higher-order component to protect routes that require authentication
 * Usage: Wrap your page content with <ProtectedRoute>...</ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        const returnTo =
          typeof window !== 'undefined'
            ? `${window.location.pathname}${window.location.search}`
            : pathname;
        router.push(redirectTo ?? buildLoginUrl(returnTo));
        return;
      }
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, redirectTo, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
