'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';

const QrJoinForm = () => {
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const joinOrganization = async (orgId: string) => {
    try {
      const existingToken = localStorage.getItem('music-mingle-token');

      const res = await fetch('/api/auth/qr-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: orgId,
          qrToken: orgId,
          token: existingToken,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Login failed.');
      }

      const data = await res.json();

      // 🔄 Save token if it's new or updated
      localStorage.setItem('music-mingle-token', data.token);

      router.push(`/organization/${data.organization.id}`);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  };
  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        joinOrganization(decodedText.trim());
        scanner.clear().catch(console.error);
      },
      (scanError) => {
        console.warn('QR Scan Error', scanError);
        // The error handling for the scanner is now within the component's state
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      joinOrganization(manualId.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="flex flex-col gap-6 w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">Join an Organization</h2>

        {/* QR Code Scanner */}
        <div id="qr-reader" ref={scannerRef} className="border-4 border-dashed border-gray-700 rounded-xl overflow-hidden" />

        {error && (
          <div className="p-3 text-sm font-medium text-red-300 bg-red-800 rounded-lg">
            {error}
          </div>
        )}

        <div className="text-center text-gray-500 font-semibold uppercase tracking-wider my-2">or</div>

        {/* Manual Entry */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Enter Organization ID"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className="p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all w-full"
          />
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
};

export default QrJoinForm;

// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import { Html5QrcodeScanner } from 'html5-qrcode';
// import { useRouter } from 'next/navigation';

// const QrJoinForm = () => {
//   const [manualId, setManualId] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const scannerRef = useRef<HTMLDivElement>(null);
//   const router = useRouter();

//   const joinOrganization = async (orgId: string) => {
//   try {
//     const existingToken = localStorage.getItem('music-mingle-token');

//     const res = await fetch('/api/auth/qr-login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         organizationId: orgId,
//         qrToken: orgId,
//         token: existingToken,
//       }),
//     });

//     if (!res.ok) {
//       const text = await res.text();
//       throw new Error(text || 'Login failed.');
//     }

//     const data = await res.json();

//     // 🔄 Save token if it's new or updated
//     localStorage.setItem('music-mingle-token', data.token);

//     router.push(`/organization/${data.organization.id}`);
//   } catch (err) {
//     console.error(err);
//     setError('Something went wrong. Please try again.');
//   }
// };
//   useEffect(() => {
//     if (!scannerRef.current) return;

//     const scanner = new Html5QrcodeScanner(
//       'qr-reader',
//       {
//         fps: 10,
//         qrbox: { width: 250, height: 250 },
//       },
//       false
//     );

//     scanner.render(
//       (decodedText) => {
//         joinOrganization(decodedText.trim());
//         scanner.clear().catch(console.error);
//       },
//       (scanError) => {
//         console.warn('QR Scan Error', scanError);
//         setError('Scanning failed or camera unavailable.');
//       }
//     );

//     return () => {
//       scanner.clear().catch(console.error);
//     };
//   }, []);

//   const handleManualSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (manualId.trim()) {
//       joinOrganization(manualId.trim());
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white text-black rounded-xl shadow-md space-y-6">
//       <h2 className="text-2xl font-semibold text-center">Join an Organization</h2>

//       {/* QR Code Scanner */}
//       <div id="qr-reader" ref={scannerRef} className="border rounded-xl overflow-hidden" />

//       {error && <p className="text-red-500 text-sm">{error}</p>}

//       <div className="text-center text-sm text-gray-600">or</div>

//       {/* Manual Entry */}
//       <form onSubmit={handleManualSubmit} className="space-y-3">
//         <input
//           type="text"
//           placeholder="Enter Organization ID"
//           value={manualId}
//           onChange={(e) => setManualId(e.target.value)}
//           className="input w-full border px-3 py-2 rounded"
//         />
//         <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl w-full">
//           Join
//         </button>
//       </form>
//     </div>
//   );
// };

// export default QrJoinForm;
