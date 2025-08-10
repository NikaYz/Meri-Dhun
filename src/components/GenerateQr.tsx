'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, RefreshCw, ExternalLink, Clock, Zap, Share2 } from 'lucide-react';

interface GenerateQrProps {
  organizationId: string;
}

export default function GenerateQr({ organizationId }: GenerateQrProps) {
  const [token, setToken] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loginUrl, setLoginUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // Define a fixed refresh interval in seconds
  const REFRESH_INTERVAL_SECONDS = 30;

  // This useEffect handles fetching the token and scheduling the next fetch
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/organizations/qr?id=' + organizationId);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        
        setToken(data.token);
        setExpiresAt(new Date(data.expiresAt));

        // Start the countdown again from the fixed interval
        setCountdown(REFRESH_INTERVAL_SECONDS);
      } catch (err) {
        console.error('Failed to fetch QR token:', err);
      }
    };

    fetchToken();
    
    // Set a fixed interval for fetching new tokens
    intervalId = setInterval(fetchToken, REFRESH_INTERVAL_SECONDS * 1000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [organizationId]);

  // This useEffect handles the countdown timer for the UI
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prevCountdown => (prevCountdown > 0 ? prevCountdown - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Run only once on mount

  // Generate QR Code and login URL
  useEffect(() => {
    if (!token) return;

    const login =
      typeof window !== 'undefined'
        ? `${window.location.origin}/login?org=${organizationId}&token=${token}`
        : '';

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(login)}`;
    setQrDataUrl(qrUrl);
    setLoginUrl(login);
  }, [token, organizationId]);

  const handleRedirect = () => {
    router.push(`/login?org=${organizationId}&token=${token}`);
  };

  const copyToClipboard = () => {
    document.execCommand('copy');
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 font-semibold';
    notification.textContent = 'Link copied to clipboard!';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
              <QrCode className="w-7 h-7 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Guest Access</h2>
              <p className="text-black/80">Share this QR code for instant access</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-black/80">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code */}
          <div className="text-center">
            <div className="bg-white rounded-3xl p-4 sm:p-8 mb-6 shadow-lg border-4 border-gray-700 max-w-[300px] mx-auto">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Code for login"
                  className="w-full h-auto"
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center text-sm text-gray-400 space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auto-refreshes every {REFRESH_INTERVAL_SECONDS} seconds</span>
              </div>

              <div className="flex items-center justify-center text-sm text-green-400 space-x-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono">Expires in: {countdown}s</span>
              </div>
            </div>
          </div>

          {/* Instructions & Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">How to Join</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="text-white font-medium">Scan the QR Code</p>
                    <p className="text-gray-400 text-sm">Use your phone's camera or QR scanner</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="text-white font-medium">Join Instantly</p>
                    <p className="text-gray-400 text-sm">No app download required</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="text-white font-medium">Start Voting</p>
                    <p className="text-gray-400 text-sm">Search, vote, and boost your favorite tracks</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>Direct Link</span>
                </h4>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              </div>
              <code className="text-xs text-green-400 break-all font-mono bg-gray-900 p-3 rounded-lg block">
                {loginUrl}
              </code>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Security Token</h4>
              <code className="text-xs text-gray-400 break-all font-mono bg-gray-900 p-3 rounded-lg block">
                {token}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// 'use client';
// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { QrCode, RefreshCw, ExternalLink, Clock, Zap, Share2 } from 'lucide-react';

// interface GenerateQrProps {
//   organizationId: string;
// }

// export default function GenerateQr({ organizationId }: GenerateQrProps) {
//   const [token, setToken] = useState('');
//   const [qrDataUrl, setQrDataUrl] = useState('');
//   const [loginUrl, setLoginUrl] = useState('');
//   const [expiresAt, setExpiresAt] = useState<Date | null>(null);
//   const [countdown, setCountdown] = useState(0);
//   const router = useRouter();

//   // Fetch token from API and schedule next fetch
//   useEffect(() => {
//     let timerId: NodeJS.Timeout | null = null;
    
//     const fetchToken = async () => {
//       try {
//         const res = await fetch('/api/organizations/qr?id=' + organizationId);
//         if (!res.ok) throw new Error('Failed to fetch');
//         const data = await res.json();
//         const newExpiresAt = new Date(data.expiresAt);
        
//         setToken(data.token);
//         setExpiresAt(newExpiresAt);

//         // Calculate the next fetch time with a 5-second buffer
//         const now = Date.now();
//         const refreshInterval = Math.max(1000, newExpiresAt.getTime() - now - 5000);

//         // Schedule the next fetch
//         timerId = setTimeout(fetchToken, refreshInterval);

//       } catch (err) {
//         console.error('Failed to fetch QR token:', err);
//       }
//     };

//     fetchToken();
//     return () => {
//       if (timerId) {
//         clearTimeout(timerId);
//       }
//     };
//   }, [organizationId]);

//   // Countdown timer
//   useEffect(() => {
//     const timer = setInterval(() => {
//       if (expiresAt) {
//         const secondsLeft = Math.max(0, Math.floor((+expiresAt - Date.now()) / 1000));
//         setCountdown(secondsLeft);
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [expiresAt]);

//   // Generate QR Code and login URL
//   useEffect(() => {
//     if (!token) return;

//     const login =
//       typeof window !== 'undefined'
//         ? `${window.location.origin}/login?org=${organizationId}&token=${token}`
//         : '';

//     const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(login)}`;
//     setQrDataUrl(qrUrl);
//     setLoginUrl(login);
//   }, [token, organizationId]);

//   const handleRedirect = () => {
//     router.push(`/login?org=${organizationId}&token=${token}`);
//   };

//   const copyToClipboard = () => {
//     document.execCommand('copy');
//     // Show notification
//     const notification = document.createElement('div');
//     notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 font-semibold';
//     notification.textContent = 'Link copied to clipboard!';
//     document.body.appendChild(notification);
//     setTimeout(() => document.body.removeChild(notification), 3000);
//   };

//   return (
//     <div className="bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
//       <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-black">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
//               <QrCode className="w-7 h-7 text-black" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold">Guest Access</h2>
//               <p className="text-black/80">Share this QR code for instant access</p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2 text-black/80">
//             <Zap className="w-5 h-5" />
//             <span className="text-sm font-medium">Live</span>
//           </div>
//         </div>
//       </div>

//       <div className="p-4 md:p-8">
//         <div className="grid md:grid-cols-2 gap-8">
//           {/* QR Code */}
//           <div className="text-center">
//             <div className="bg-white rounded-3xl p-4 sm:p-8 mb-6 shadow-lg border-4 border-gray-700 max-w-[300px] mx-auto">
//               {qrDataUrl && (
//                 <img
//                   src={qrDataUrl}
//                   alt="QR Code for login"
//                   className="w-full h-auto"
//                 />
//               )}
//             </div>

//             <div className="space-y-4">
//               <div className="flex items-center justify-center text-sm text-gray-400 space-x-2">
//                 <RefreshCw className="w-4 h-4 animate-spin" />
//                 <span>Auto-refreshes every 30 seconds</span>
//               </div>

//               <div className="flex items-center justify-center text-sm text-green-400 space-x-2">
//                 <Clock className="w-4 h-4" />
//                 <span className="font-mono">Expires in: {countdown}s</span>
//               </div>
//             </div>
//           </div>

//           {/* Instructions & Info */}
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-xl font-bold text-white mb-4">How to Join</h3>
//               <div className="space-y-3">
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
//                     1
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">Scan the QR Code</p>
//                     <p className="text-gray-400 text-sm">Use your phone's camera or QR scanner</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
//                     2
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">Join Instantly</p>
//                     <p className="text-gray-400 text-sm">No app download required</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
//                     3
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">Start Voting</p>
//                     <p className="text-gray-400 text-sm">Search, vote, and boost your favorite tracks</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
//               <div className="flex items-center justify-between mb-3">
//                 <h4 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
//                   <ExternalLink className="w-4 h-4" />
//                   <span>Direct Link</span>
//                 </h4>
//                 <button
//                   onClick={copyToClipboard}
//                   className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
//                 >
//                   <Share2 className="w-4 h-4" />
//                   <span>Copy</span>
//                 </button>
//               </div>
//               <code className="text-xs text-green-400 break-all font-mono bg-gray-900 p-3 rounded-lg block">
//                 {loginUrl}
//               </code>
//             </div>

//             <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
//               <h4 className="text-sm font-semibold text-gray-300 mb-3">Security Token</h4>
//               <code className="text-xs text-gray-400 break-all font-mono bg-gray-900 p-3 rounded-lg block">
//                 {token}
//               </code>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';
// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { QrCode, RefreshCw, ExternalLink, Clock, Zap, Share2 } from 'lucide-react';

// interface GenerateQrProps {
//   organizationId: string;
// }

// export default function GenerateQr({ organizationId }: GenerateQrProps) {
//   const [token, setToken] = useState('');
//   const [qrDataUrl, setQrDataUrl] = useState('');
//   const [loginUrl, setLoginUrl] = useState('');
//   const [expiresAt, setExpiresAt] = useState<Date | null>(null);
//   const [countdown, setCountdown] = useState(0);
//   const router = useRouter();

//   // Fetch token from API and schedule next fetch
//   useEffect(() => {
//     let timerId: NodeJS.Timeout | null = null;
    
//     const fetchToken = async () => {
//       try {
//         const res = await fetch('/api/organizations/qr?id=' + organizationId);
//         if (!res.ok) throw new Error('Failed to fetch');
//         const data = await res.json();
//         const newExpiresAt = new Date(data.expiresAt);
        
//         setToken(data.token);
//         setExpiresAt(newExpiresAt);

//         // Calculate the next fetch time with a 5-second buffer
//         const now = Date.now();
//         const refreshInterval = Math.max(1000, newExpiresAt.getTime() - now - 5000);

//         // Schedule the next fetch
//         timerId = setTimeout(fetchToken, refreshInterval);

//       } catch (err) {
//         console.error('Failed to fetch QR token:', err);
//       }
//     };

//     fetchToken();
//     return () => {
//       if (timerId) {
//         clearTimeout(timerId);
//       }
//     };
//   }, [organizationId]);

//   // Countdown timer
//   useEffect(() => {
//     const timer = setInterval(() => {
//       if (expiresAt) {
//         const secondsLeft = Math.max(0, Math.floor((+expiresAt - Date.now()) / 1000));
//         setCountdown(secondsLeft);
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [expiresAt]);

//   // Generate QR Code and login URL
//   useEffect(() => {
//     if (!token) return;

//     const login =
//       typeof window !== 'undefined'
//         ? `${window.location.origin}/login?org=${organizationId}&token=${token}`
//         : '';

//     const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(login)}`;
//     setQrDataUrl(qrUrl);
//     setLoginUrl(login);
//   }, [token, organizationId]);

//   const handleRedirect = () => {
//     router.push(`/login?org=${organizationId}&token=${token}`);
//   };

//   const copyToClipboard = () => {
//     document.execCommand('copy');
//     // Show notification
//     const notification = document.createElement('div');
//     notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 font-semibold';
//     notification.textContent = 'Link copied to clipboard!';
//     document.body.appendChild(notification);
//     setTimeout(() => document.body.removeChild(notification), 3000);
//   };

//   const expirationText = expiresAt ? `Refreshes in: ${Math.floor((expiresAt.getTime() - Date.now()) / 1000)}s` : 'Refreshing...';

//   return (
//     <div className="bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
//       <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-black">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
//               <QrCode className="w-7 h-7 text-black" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold">Guest Access</h2>
//               <p className="text-black/80">Share this QR code for instant access</p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2 text-black/80">
//             <Zap className="w-5 h-5" />
//             <span className="text-sm font-medium">Live</span>
//           </div>
//         </div>
//       </div>

//       <div className="p-4 md:p-8">
//         <div className="grid md:grid-cols-2 gap-8">
//           {/* QR Code */}
//           <div className="text-center">
//             <div className="bg-white rounded-3xl p-4 sm:p-8 mb-6 shadow-lg border-4 border-gray-700 max-w-[300px] mx-auto">
//               {qrDataUrl && (
//                 <img
//                   src={qrDataUrl}
//                   alt="QR Code for login"
//                   className="w-full h-auto"
//                 />
//               )}
//             </div>

//             <div className="space-y-4">
//               <div className="flex items-center justify-center text-sm text-gray-400 space-x-2">
//                 <RefreshCw className="w-4 h-4 animate-spin" />
//                 <span>{expirationText}</span>
//               </div>

//               <div className="flex items-center justify-center text-sm text-green-400 space-x-2">
//                 <Clock className="w-4 h-4" />
//                 <span className="font-mono">Expires in: {countdown}s</span>
//               </div>
//             </div>
//           </div>

//           {/* Instructions & Info */}
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-xl font-bold text-white mb-4">How to Join</h3>
//               <div className="space-y-3">
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
//                     1
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">Scan the QR Code</p>
//                     <p className="text-gray-400 text-sm">Use your phone's camera or QR scanner</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
//                     2
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">Join Instantly</p>
//                     <p className="text-gray-400 text-sm">No app download required</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
//                     3
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">Start Voting</p>
//                     <p className="text-gray-400 text-sm">Search, vote, and boost your favorite tracks</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
//               <div className="flex items-center justify-between mb-3">
//                 <h4 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
//                   <ExternalLink className="w-4 h-4" />
//                   <span>Direct Link</span>
//                 </h4>
//                 <button
//                   onClick={copyToClipboard}
//                   className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
//                 >
//                   <Share2 className="w-4 h-4" />
//                   <span>Copy</span>
//                 </button>
//               </div>
//               <code className="text-xs text-green-400 break-all font-mono bg-gray-900 p-3 rounded-lg block">
//                 {loginUrl}
//               </code>
//             </div>

//             <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
//               <h4 className="text-sm font-semibold text-gray-300 mb-3">Security Token</h4>
//               <code className="text-xs text-gray-400 break-all font-mono bg-gray-900 p-3 rounded-lg block">
//                 {token}
//               </code>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// 'use client';
// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { QrCode, RefreshCw, ExternalLink, Clock, Zap, Share2 } from 'lucide-react';

// interface GenerateQrProps {
//   organizationId: string;
// }

// export default function GenerateQr({ organizationId }: GenerateQrProps) {
//   const [token, setToken] = useState('');
//   const [qrDataUrl, setQrDataUrl] = useState('');
//   const [loginUrl, setLoginUrl] = useState('');
//   const [expiresAt, setExpiresAt] = useState<Date | null>(null);
//   const [countdown, setCountdown] = useState(0);
//   const router = useRouter();

//   // Fetch token from API
//   useEffect(() => {
//     const fetchToken = async () => {
//       try {
//         const res = await fetch('/api/organizations/qr?id=' + organizationId);
//         if (!res.ok) throw new Error('Failed to fetch');
//         const data = await res.json();
//         setToken(data.token);
//         setExpiresAt(new Date(data.expiresAt));
//       } catch (err) {
//         console.error('Failed to fetch QR token:', err);
//       }
//     };

//     fetchToken();
//     const interval = setInterval(fetchToken, 20000); // refresh every 20s
//     return () => clearInterval(interval);
//   }, [organizationId]);

//   // Countdown timer
//   useEffect(() => {
//     const timer = setInterval(() => {
//       if (expiresAt) {
//         const secondsLeft = Math.max(0, Math.floor((+expiresAt - Date.now()) / 1000));
//         setCountdown(secondsLeft);
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [expiresAt]);

//   // Generate QR Code and login URL
//   useEffect(() => {
//     if (!token) return;

//     const login =
//       typeof window !== 'undefined'
//         ? `${window.location.origin}/login?org=${organizationId}&token=${token}`
//         : '';

//     const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(login)}`;
//     setQrDataUrl(qrUrl);
//     setLoginUrl(login);
//   }, [token, organizationId]);

//   const handleRedirect = () => {
//     router.push(`/login?org=${organizationId}&token=${token}`);
//   };

//   const copyToClipboard = () => {
//     document.execCommand('copy');
//     // Show notification
//     const notification = document.createElement('div');
//     notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 font-semibold';
//     notification.textContent = 'Link copied to clipboard!';
//     document.body.appendChild(notification);
//     setTimeout(() => document.body.removeChild(notification), 3000);
//   };

//   return (
//     <div className="bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
//       <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-black">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
//               <QrCode className="w-7 h-7 text-black" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold">Guest Access</h2>
//               <p className="text-black/80">Share this QR code for instant access</p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2 text-black/80">
//             <Zap className="w-5 h-5" />
//             <span className="text-sm font-medium">Auto-refresh</span>
//           </div>
//         </div>
//       </div>

//       <div className="p-4 md:p-8">
//         <div className="grid md:grid-cols-2 gap-8">
//           {/* QR Code */}
//           <div className="text-center">
//             <div className="bg-white rounded-3xl p-4 sm:p-8 mb-6 shadow-lg border-4 border-gray-700 max-w-[300px] mx-auto">
//               {qrDataUrl && (
//                 <img
//                   src={qrDataUrl}
//                   alt="QR Code for login"
//                   className="w-full h-auto"
//                 />
//               )}
//             </div>

//             <div className="space-y-4">
//               <div className="flex items-center justify-center text-sm text-gray-400 space-x-2">
//                 <RefreshCw className="w-4 h-4" />
//                 <span>Auto-refreshes every 20 seconds</span>
//               </div>

//               <div className="flex items-center justify-center text-sm text-green-400 space-x-2">
//                 <Clock className="w-4 h-4" />
//                 <span className="font-mono">Expires in: {countdown}s</span>
//               </div>
//             </div>
//           </div>

//           {/* Instructions & Info */}
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-xl font-bold text-white mb-4">How to Join</h3>
//               <div className="space-y-3">
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
//                     1
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">Scan the QR Code</p>
//                     <p className="text-gray-400 text-sm">Use your phone's camera or QR scanner</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
//                     2
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">Join Instantly</p>
//                     <p className="text-gray-400 text-sm">No app download required</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
//                     3
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">Start Voting</p>
//                     <p className="text-gray-400 text-sm">Search, vote, and boost your favorite tracks</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
//               <div className="flex items-center justify-between mb-3">
//                 <h4 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
//                   <ExternalLink className="w-4 h-4" />
//                   <span>Direct Link</span>
//                 </h4>
//                 <button
//                   onClick={copyToClipboard}
//                   className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
//                 >
//                   <Share2 className="w-4 h-4" />
//                   <span>Copy</span>
//                 </button>
//               </div>
//               <code className="text-xs text-green-400 break-all font-mono bg-gray-900 p-3 rounded-lg block">
//                 {loginUrl}
//               </code>
//             </div>

//             <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
//               <h4 className="text-sm font-semibold text-gray-300 mb-3">Security Token</h4>
//               <code className="text-xs text-gray-400 break-all font-mono bg-gray-900 p-3 rounded-lg block">
//                 {token}
//               </code>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// 'use client';
// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { QrCode, RefreshCw, ExternalLink, Clock, Zap, Share2 } from 'lucide-react';

// interface GenerateQrProps {
//   organizationId: string;
// }

// export default function GenerateQr({ organizationId }: GenerateQrProps) {
//   const [token, setToken] = useState('');
//   const [qrDataUrl, setQrDataUrl] = useState('');
//   const [loginUrl, setLoginUrl] = useState('');
//   const [expiresAt, setExpiresAt] = useState<Date | null>(null);
//   const [countdown, setCountdown] = useState(0);
//   const router = useRouter();

//   // Fetch token from API
//   useEffect(() => {
//     const fetchToken = async () => {
//       try {
//         const res = await fetch('/api/organizations/qr?id=' + organizationId);
//         if (!res.ok) throw new Error('Failed to fetch');
//         const data = await res.json();
//         setToken(data.token);
//         setExpiresAt(new Date(data.expiresAt));
//       } catch (err) {
//         console.error('Failed to fetch QR token:', err);
//       }
//     };

//     fetchToken();
//     const interval = setInterval(fetchToken, 20000); // refresh every 20s
//     return () => clearInterval(interval);
//   }, [organizationId]);

//   // Countdown timer
//   useEffect(() => {
//     const timer = setInterval(() => {
//       if (expiresAt) {
//         const secondsLeft = Math.max(0, Math.floor((+expiresAt - Date.now()) / 1000));
//         setCountdown(secondsLeft);
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [expiresAt]);

//   // Generate QR Code and login URL
//   useEffect(() => {
//     if (!token) return;

//     const login =
//       typeof window !== 'undefined'
//         ? `${window.location.origin}/login?org=${organizationId}&token=${token}`
//         : '';

//     const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(login)}`;
//     setQrDataUrl(qrUrl);
//     setLoginUrl(login);
//   }, [token, organizationId]);

//   const handleRedirect = () => {
//     router.push(`/login?org=${organizationId}&token=${token}`);
//   };

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(loginUrl);
//     // Show notification
//     const notification = document.createElement('div');
//     notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 font-semibold';
//     notification.textContent = 'Link copied to clipboard!';
//     document.body.appendChild(notification);
//     setTimeout(() => document.body.removeChild(notification), 3000);
//   };

//   return (
//     <div className="bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
//       <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-black">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
//               <QrCode className="w-7 h-7 text-black" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold">Guest Access</h2>
//               <p className="text-black/80">Share this QR code for instant access</p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2 text-black/80">
//             <Zap className="w-5 h-5" />
//             <span className="text-sm font-medium">Auto-refresh</span>
//           </div>
//         </div>
//       </div>

//       <div className="p-8">
//         <div className="grid md:grid-cols-2 gap-8">
//           {/* QR Code */}
//           <div className="text-center">
//             <div className="bg-white rounded-3xl p-8 mb-6 shadow-lg border-4 border-gray-700">
//               {qrDataUrl && (
//                 <img
//                   src={qrDataUrl}
//                   alt="QR Code for login"
//                   className="w-72 h-72 mx-auto"
//                 />
//               )}
//             </div>

//             <div className="space-y-4">
//               <div className="flex items-center justify-center text-sm text-gray-400 space-x-2">
//                 <RefreshCw className="w-4 h-4" />
//                 <span>Auto-refreshes every 20 seconds</span>
//               </div>

//               <div className="flex items-center justify-center text-sm text-green-400 space-x-2">
//                 <Clock className="w-4 h-4" />
//                 <span className="font-mono">Expires in: {countdown}s</span>
//               </div>
//             </div>
//           </div>

//           {/* Instructions & Info */}
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-xl font-bold text-white mb-4">How to Join</h3>
//               <div className="space-y-3">
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
//                     1
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">Scan the QR Code</p>
//                     <p className="text-gray-400 text-sm">Use your phone's camera or QR scanner</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
//                     2
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">Join Instantly</p>
//                     <p className="text-gray-400 text-sm">No app download required</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
//                     3
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">Start Voting</p>
//                     <p className="text-gray-400 text-sm">Search, vote, and boost your favorite tracks</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
//               <div className="flex items-center justify-between mb-3">
//                 <h4 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
//                   <ExternalLink className="w-4 h-4" />
//                   <span>Direct Link</span>
//                 </h4>
//                 <button
//                   onClick={copyToClipboard}
//                   className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
//                 >
//                   <Share2 className="w-4 h-4" />
//                   <span>Copy</span>
//                 </button>
//               </div>
//               <code className="text-xs text-green-400 break-all font-mono bg-gray-900 p-3 rounded-lg block">
//                 {loginUrl}
//               </code>
//             </div>

//             <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
//               <h4 className="text-sm font-semibold text-gray-300 mb-3">Security Token</h4>
//               <code className="text-xs text-gray-400 break-all font-mono bg-gray-900 p-3 rounded-lg block">
//                 {token}
//               </code>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

