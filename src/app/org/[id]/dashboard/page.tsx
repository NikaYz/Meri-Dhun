// 'use client';

// import { useEffect, useState } from 'react';
// import PubDashboard from '@/components/PubDashboard';
// import { jwtDecode } from 'jwt-decode';
// import { useSocket } from '../../../../hooks/useSocket'; // Adjust if needed

// interface Props {
//   params: Promise<{ id: string }>;
// }

// interface DecodedToken {
//   organizationId: string;
//   sessionId: string;
//   type: string;
//   exp: number;
//   iat: number;
// }

// export default function OrgQR({ params }: Props) {
//   const [organizationId, setOrganizationId] = useState<string | null>(null);
//   const [sessionId, setSessionId] = useState<string | null>(null);
//   const [isValidUser, setIsValidUser] = useState<boolean | null>(null);

//   useEffect(() => {
//     const init = async () => {
//       const { id } = await params;
//       console.log("id",id);
//       setOrganizationId(id);

//       // 🚨 FIX: Use the correct localStorage key
//       const token = localStorage.getItem('music-mingle-token');
//       console.log("token",token);
//       if (!token) {
//         setIsValidUser(false);
//         return;
//       }

//       const decoded = jwtDecode<DecodedToken>(token);
//       console.log("decoded",decoded)
//       if (decoded.organizationId !== id) {
//         setIsValidUser(false);
//         return;
//       }

//       setSessionId(decoded.sessionId);

//       const res = await fetch('/api/auth/verify', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token }),
//       });

//       const data = await res.json();
//       if (!res.ok || data.valid !== true) {
//         setIsValidUser(false);
//         return;
//       }

//       setIsValidUser(true);
//     };

//     init();
//   }, [params]);
  

//   if (isValidUser === null || !organizationId) return <p>Loading...</p>;
//   if (!isValidUser) return <p className="text-red-600">Not a valid user.</p>;

//   return <PubDashboard organizationId={organizationId} />;
// }
'use client';

import { useEffect, useState } from 'react';
import PubDashboard from '@/components/PubDashboard';
import { jwtDecode } from 'jwt-decode';
import { Music } from 'lucide-react'; // Added Music icon for the UI

interface Props {
  params: Promise<{ id: string }>;
}

interface DecodedToken {
  organizationId: string;
  sessionId: string;
  type: string;
  exp: number;
  iat: number;
}

export default function OrgQR({ params }: Props) {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  // FIX: Removed `sessionId` since it was assigned but never used.
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      const { id } = await params;
      console.log("id",id);
      setOrganizationId(id);

      const token = localStorage.getItem('token');
      console.log("token",token);
      if (!token) {
        setIsValidUser(false);
        return;
      }

      const decoded = jwtDecode<DecodedToken>(token);
      console.log("decoded",decoded)
      if (decoded.organizationId !== id) {
        setIsValidUser(false);
        return;
      }

      // FIX: Removed `setSessionId` since the state variable is no longer needed.
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok || data.valid !== true) {
        setIsValidUser(false);
        return;
      }

      setIsValidUser(true);
    };

    init();
  }, [params]);

  

  if (isValidUser === null || !organizationId) return <p>Loading...</p>;

  if (!isValidUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4 text-white">
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 sm:p-12 text-center max-w-sm w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-4">
              <Music className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent mb-2">Invalid User</h2>
          <p className="text-gray-400">
            This QR code is not valid for your account. Please try scanning a new QR code to join.
          </p>
        </div>
      </div>
    );
  }

  return <PubDashboard organizationId={organizationId} />;
}

// 'use client';

// import { useEffect, useState } from 'react';
// import PubDashboard from '@/components/PubDashboard';
// import { jwtDecode } from 'jwt-decode';
// import { Music } from 'lucide-react'; // Added Music icon for the UI

// interface Props {
//   params: Promise<{ id: string }>;
// }

// interface DecodedToken {
//   organizationId: string;
//   sessionId: string;
//   type: string;
//   exp: number;
//   iat: number;
// }

// export default function OrgQR({ params }: Props) {
//   const [organizationId, setOrganizationId] = useState<string | null>(null);
//   const [sessionId, setSessionId] = useState<string | null>(null);
//   const [isValidUser, setIsValidUser] = useState<boolean | null>(null);

//   useEffect(() => {
//     const init = async () => {
//       const { id } = await params;
//       console.log("id",id);
//       setOrganizationId(id);

//       const token = localStorage.getItem('token');
//       console.log("token",token);
//       if (!token) {
//         setIsValidUser(false);
//         return;
//       }

//       const decoded = jwtDecode<DecodedToken>(token);
//       console.log("decoded",decoded)
//       if (decoded.organizationId !== id) {
//         setIsValidUser(false);
//         return;
//       }

//       setSessionId(decoded.sessionId);

//       const res = await fetch('/api/auth/verify', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token }),
//       });

//       const data = await res.json();
//       if (!res.ok || data.valid !== true) {
//         setIsValidUser(false);
//         return;
//       }

//       setIsValidUser(true);
//     };

//     init();
//   }, [params]);

  

//   if (isValidUser === null || !organizationId) return <p>Loading...</p>;

//   if (!isValidUser) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4 text-white">
//         <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 sm:p-12 text-center max-w-sm w-full">
//           <div className="flex justify-center mb-6">
//             <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-4">
//               <Music className="w-12 h-12 text-white" />
//             </div>
//           </div>
//           <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent mb-2">Invalid User</h2>
//           <p className="text-gray-400">
//             This QR code is not valid for your account. Please try scanning a new QR code to join.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return <PubDashboard organizationId={organizationId} />;
// }


// /src/app/org/[id]/dashboard/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import PubDashboard from '@/components/PubDashboard';
// import { jwtDecode } from 'jwt-decode';
// import { useSocket } from '../../../../hooks/useSocket'; // Adjust if needed
// import { Music } from 'lucide-react';

// interface Props {
//   params: Promise<{ id: string }>;
// }

// interface DecodedToken {
//   organizationId: string;
//   sessionId: string;
//   type: string;
//   exp: number;
//   iat: number;
// }

// export default function OrgQR({ params }: Props) {
//   const [organizationId, setOrganizationId] = useState<string | null>(null);
//   const [sessionId, setSessionId] = useState<string | null>(null);
//   const [isValidUser, setIsValidUser] = useState<boolean | null>(null);

//   useEffect(() => {
//     const init = async () => {
//       const { id } = await params;
//       console.log("id",id);
//       setOrganizationId(id);

//       const token = localStorage.getItem('token');
//       console.log("token",token);
//       if (!token) {
//         setIsValidUser(false);
//         return;
//       }

//       const decoded = jwtDecode<DecodedToken>(token);
//       console.log("decoded",decoded)
//       if (decoded.organizationId !== id) {
//         setIsValidUser(false);
//         return;
//       }

//       setSessionId(decoded.sessionId);

//       const res = await fetch('/api/auth/verify', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token }),
//       });

//       const data = await res.json();
//       if (!res.ok || data.valid !== true) {
//         setIsValidUser(false);
//         return;
//       }

//       setIsValidUser(true);
//     };

//     init();
//   }, [params]);

  

//   if (isValidUser === null || !organizationId) return <p>Loading...</p>;
//   // if (!isValidUser) return <p className="text-red-600">Not a valid user.</p>;
//    if (!isValidUser) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center max-w-sm w-full">
//           <div className="flex justify-center mb-6">
//             <div className="bg-purple-500 rounded-full p-4">
//               <Music className="w-12 h-12 text-white" />
//             </div>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid User</h2>
//           <p className="text-gray-600">
//             This QR code is not valid for your account. Please try scanning a new QR code to join.
//           </p>
//         </div>
//       </div>
//     );
//   }
//   return <PubDashboard organizationId={organizationId} />;
// }