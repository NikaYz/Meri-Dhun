'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BoostCancelledContent() {
  // These hooks can now be safely used since the component is a client component.
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams?.get('org_id');

  const redirectPath = orgId ? `/org/${orgId}/dashboard` : '/';
  
  useEffect(() => {
    if (redirectPath !== '/') {
      const timer = setTimeout(() => {
        router.push(redirectPath);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [router, redirectPath]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-sm p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 text-center">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">Payment Cancelled</h2>
        <div className="p-4 rounded-lg font-semibold text-yellow-400">
          You have cancelled the payment.
        </div>
        <p className="mt-4 text-gray-500">Redirecting to your dashboard in a moment...</p>
      </div>
    </div>
  );
}