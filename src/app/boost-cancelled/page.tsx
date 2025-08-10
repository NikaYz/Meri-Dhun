'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BoostCancelled() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams?.get('org_id');

  // If orgId is not available, we can't redirect.
  // We'll set a default message and just let the user see it.
  const [redirectPath, setRedirectPath] = useState(orgId ? `/org/${orgId}/dashboard` : '/');
  
  useEffect(() => {
    // Only set a timer if we have a valid path to redirect to.
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

// // src/app/boost-cancelled/page.tsx
// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function BoostCancelled() {
//   const router = useRouter();

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       router.push('/org/cmdvy23hm0000itkm8jfa7lks/dashboard');
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, [router]);

//   return (
//     <div style={{ padding: 20, textAlign: 'center' }}>
//       <h1>Payment Cancelled</h1>
//       <p>You have cancelled the payment.</p>
//       <p>Redirecting to your dashboard...</p>
//     </div>
//   );
// }
