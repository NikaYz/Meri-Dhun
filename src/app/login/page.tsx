'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [message, setMessage] = useState('');
    
  useEffect(() => {
    if (!searchParams) {
      setStatus('error');
      setMessage('Invalid search parameters.');
      return;
    }
    const org = searchParams.get('org');
    const token = searchParams.get('token');

    if (!org || !token) {
      setStatus('error');
      setMessage('Missing organization ID or token.');
      return;
    }

    const loginWithQr = async () => {
      try {
        const res = await fetch('/api/auth/qr-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId: org,
            qrToken: token,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setMessage(data.message || 'Login failed.');
          return;
        }

        // Store token securely
        localStorage.setItem('token', data.token);
        const userId = data?.token;
        const orgId = data?.organization?.id;
        setStatus('success');
        setMessage('Login successful. Redirecting...');

        // Redirect to dashboard or homepage
        setTimeout(() => {
          router.push(`/org/${orgId}/dashboard`);
        }, 1000);
      } catch (error) {
        setStatus('error');
        setMessage('Unexpected error occurred.');
      }
    };

    loginWithQr();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-sm p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 text-center">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">QR Login</h2>
        {status === 'loading' && <p className="text-gray-400">Verifying QR login...</p>}
        {status === 'error' && <p className="text-red-400">{message}</p>}
        {status === 'success' && <p className="text-green-400">{message}</p>}
      </div>
    </div>
  );
}

// // src/app/login/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';

// export default function LoginPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
//   const [message, setMessage] = useState('');
    
//   useEffect(() => {
//     if (!searchParams) {
//       setStatus('error');
//       setMessage('Invalid search parameters.');
//       return;
//     }
//     const org = searchParams.get('org');
//     const token = searchParams.get('token');

//     if (!org || !token) {
//       setStatus('error');
//       setMessage('Missing organization ID or token.');
//       return;
//     }

//     const loginWithQr = async () => {
//       try {
//         const res = await fetch('/api/auth/qr-login', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             organizationId: org,
//             qrToken: token,
//           }),
//         });

//         const data = await res.json();

//         if (!res.ok) {
//           setStatus('error');
//           setMessage(data.message || 'Login failed.');
//           return;
//         }

//         // Store token securely (e.g., localStorage or cookie)
//         localStorage.setItem('token', data.token);
//         const userId = data?.token;
//         const orgId = data?.organization?.id;
//         setStatus('success');
//         setMessage('Login successful. Redirecting...');

//         // Redirect to dashboard or homepage
//         setTimeout(() => {
//           router.push(`/org/${orgId}/dashboard`);
//         }, 1000);
//       } catch (error) {
//         setStatus('error');
//         setMessage('Unexpected error occurred.');
//       }
//     };

//     loginWithQr();
//   }, [searchParams, router]);

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="bg-white p-8 rounded shadow-md text-center">
//         {status === 'loading' && <p>Verifying QR login...</p>}
//         {status === 'error' && <p className="text-red-600">{message}</p>}
//         {status === 'success' && <p className="text-green-600">{message}</p>}
//       </div>
//     </div>
//   );
// }
