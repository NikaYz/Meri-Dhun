// src/app/boost-success/page.jsx

import React, { Suspense } from 'react';
import BoostSuccessContent from '../../components/BoostSuccess';

// This is the parent page component. It is a Server Component by default.
// It uses the Suspense boundary to prevent the build error.
export default function BoostSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <BoostSuccessContent />
    </Suspense>
  );
}

// 'use client';

// import { useEffect, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { useSocket } from '@/hooks/useSocket';

// // This is the new, dedicated client component.
// export default function BoostSuccessContent() {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'info'>('loading');
//   const [message, setMessage] = useState('Verifying your payment...');

//   // Use optional chaining as a safety measure for initial render
//   const orgId = searchParams?.get('org_id');
//   const sessionId = searchParams?.get('session_id');

//   const { emitSongBoosted } = useSocket(orgId || '', sessionId ?? '');

//   useEffect(() => {
//     // We check for searchParams here to ensure it's available
//     if (!searchParams || !sessionId || !orgId) {
//       setStatus('error');
//       setMessage('Missing session ID or organization ID. Please try again.');
//       setTimeout(() => router.push(`/org/${orgId || ''}/dashboard`), 3000);
//       return;
//     }

//     async function verifyAndRecordBoost() {
//       try {
//         const res = await fetch('/api/record-boost', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ sessionId, orgId }),
//         });

//         const data = await res.json();

//         if (res.ok) {
//           setStatus('success');
//           setMessage('✅ Payment successful! Your boost has been recorded.');
//           emitSongBoosted({
//             songId: data.songId,
//             userId: data.userId,
//             organizationId: orgId,
//           });
//         } else {
//           setStatus('error');
//           setMessage(`❌ Error: ${data.error || 'Failed to record boost.'}`);
//         }
//       } catch {
//         setStatus('error');
//         setMessage('⚠️ Network error. Please try again.');
//       } finally {
//         setTimeout(() => router.push(`/org/${orgId || ''}/dashboard`), 3000);
//       }
//     }

//     verifyAndRecordBoost();
//   }, [searchParams, sessionId, orgId, router, emitSongBoosted]);

//   const statusColors = {
//     loading: 'text-gray-400',
//     success: 'text-green-400',
//     error: 'text-red-400',
//     info: 'text-yellow-400',
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
//       <div className="w-full max-w-sm p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 text-center">
//         <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">Boost Status</h2>
//         <div className={`p-4 rounded-lg font-semibold ${statusColors[status]}`}>
//           {message}
//         </div>
//         <p className="mt-4 text-gray-500">Redirecting to your dashboard in a moment...</p>
//       </div>
//     </div>
//   );
// }
// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { useSearchParams, useRouter } from 'next/navigation';
// // import { useSocket } from '@/hooks/useSocket'; 

// // export default function BoostSuccess() {
// //   const searchParams = useSearchParams();
// //   const router = useRouter();

// //   const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'info'>('loading');
// //   const [message, setMessage] = useState('Verifying your payment...');

// //   const orgId = searchParams?.get('org_id');
// //   const sessionId = searchParams?.get('session_id');
// //   const { emitSongBoosted } = useSocket(orgId || '', sessionId ?? '');

// //   useEffect(() => {
// //     if (!sessionId || !orgId) {
// //       setStatus('error');
// //       setMessage('Missing session ID or organization ID. Please try again.');
// //       setTimeout(() => router.push(`/org/${orgId}/dashboard`), 3000);
// //       return;
// //     }

// //     async function verifyAndRecordBoost() {
// //       try {
// //         const res = await fetch('/api/record-boost', {
// //           method: 'POST',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify({ sessionId, orgId }),
// //         });

// //         const data = await res.json();

// //         if (res.ok) {
// //           setStatus('success');
// //           setMessage('✅ Payment successful! Your boost has been recorded.');
// //           emitSongBoosted({
// //             songId: data.songId,
// //             userId: data.userId,
// //             organizationId: orgId,
// //           });
// //         } else {
// //           setStatus('error');
// //           setMessage(`❌ Error: ${data.error || 'Failed to record boost.'}`);
// //         }
// //       } catch {
// //         setStatus('error');
// //         setMessage('⚠️ Network error. Please try again.');
// //       } finally {
// //         setTimeout(() => router.push(`/org/${orgId}/dashboard`), 3000);
// //       }
// //     }

// //     verifyAndRecordBoost();
// //   }, [sessionId, orgId, router, emitSongBoosted]);

// //   const statusColors = {
// //     loading: 'text-gray-400',
// //     success: 'text-green-400',
// //     error: 'text-red-400',
// //     info: 'text-yellow-400',
// //   };

// //   return (
// //     <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
// //       <div className="w-full max-w-sm p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 text-center">
// //         <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">Boost Status</h2>
// //         <div className={`p-4 rounded-lg font-semibold ${statusColors[status]}`}>
// //           {message}
// //         </div>
// //         <p className="mt-4 text-gray-500">Redirecting to your dashboard in a moment...</p>
// //       </div>
// //     </div>
// //   );
// // }

// // // src/app/boost-success/page.tsx
// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { useSearchParams, useRouter } from 'next/navigation';
// // import { useSocket } from '@/hooks/useSocket'; // adjust this to your actual path

// // export default function BoostSuccess() {
// //   const searchParams = useSearchParams();
// //   const router = useRouter();
  
// //   const orgId = searchParams?.get('org_id');
// //   const sessionId = searchParams?.get('session_id');
// // const {
// //       emitSongBoosted,
// //     } = useSocket(orgId || "", sessionId ?? '');

// //   const [message, setMessage] = useState('Verifying payment...');
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (!sessionId) {
// //       setMessage('No session ID found.');
// //       setLoading(false);
// //       setTimeout(() => router.push(`/org/${orgId}/dashboard`), 3000);
// //       return;
// //     }

// //     async function verifyAndRecordBoost() {
// //       try {
// //         const res = await fetch('/api/record-boost', {
// //           method: 'POST',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify({ sessionId }),
// //         });

// //         const data = await res.json();

// //         if (res.ok) {
// //           setMessage('✅ Payment successful! Your boost has been recorded.');

// //           // 🔥 Emit the WebSocket event for real-time updates
// //           emitSongBoosted({
// //             songId: data.songId,
// //             userId: data.userId,
// //             organizationId: orgId,
// //           });
// //         } else {
// //           setMessage(`❌ Error: ${data.error || 'Failed to record boost.'}`);
// //         }
// //       } catch {
// //         setMessage('⚠️ Network error. Please try again.');
// //       } finally {
// //         setLoading(false);
// //         setTimeout(() => router.push(`/org/${orgId}/dashboard`), 3000);
// //       }
// //     }

// //     verifyAndRecordBoost();
// //   }, [sessionId, orgId, router, emitSongBoosted]);

// //   return (
// //     <div style={{ padding: 20, textAlign: 'center' }}>
// //       <h1>{loading ? 'Processing...' : 'Result'}</h1>
// //       <p>{message}</p>
// //       <p>Redirecting to your dashboard...</p>
// //     </div>
// //   );
// // }