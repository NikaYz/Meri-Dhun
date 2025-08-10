'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Correct import

interface Props {
  onLogin: (orgId: string) => void;
  onBack: () => void;
}

const OrgLoginForm: React.FC<Props> = ({ onLogin, onBack }) => {
  const router = useRouter(); // ✅ Initialize router
  const [orgEmail, setOrgEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: orgEmail, password }),
      });

      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();

      const token = data.token;
      const orgId = data.organization?.id;

      if (!token || !orgId) throw new Error('Missing token or orgId');

      localStorage.setItem('token', token);
      console.log(token);
      onLogin(orgId);
      router.push(`/org/${orgId}/dashboard`);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">Login to Your Organization</h2>
        {error && (
          <div className="p-3 text-sm font-medium text-red-300 bg-red-800 rounded-lg">
            {error}
          </div>
        )}
        <input
          type="email"
          placeholder="Organization Email"
          value={orgEmail}
          onChange={(e) => setOrgEmail(e.target.value)}
          className="p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          required
        />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
          <button
            type="submit"
            className="w-full sm:w-auto flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto text-center text-gray-400 hover:text-green-300 transition-colors"
          >
            ← Back to main page
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrgLoginForm;

// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation'; // ✅ Correct import

// interface Props {
//   onLogin: (orgId: string) => void;
//   onBack: () => void;
// }

// const OrgLoginForm: React.FC<Props> = ({ onLogin, onBack }) => {
//   const router = useRouter(); // ✅ Initialize router
//   const [orgEmail, setOrgEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: orgEmail, password }),
//       });

//       if (!res.ok) throw new Error('Invalid credentials');
//       const data = await res.json();

//       const token = data.token;
//       const orgId = data.organization?.id;

//       if (!token || !orgId) throw new Error('Missing token or orgId');

//       localStorage.setItem('token', token);
//       console.log(token);
//       onLogin(orgId);
//       router.push(`/org/${orgId}/dashboard`); 
//     } catch (err) {
//       setError('Login failed. Please check your credentials.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
//       <h2 className="text-xl font-semibold">Login to Your Organization</h2>
//       {error && <div className="text-red-600">{error}</div>}
//       <input
//         type="email"
//         placeholder="Organization Email"
//         value={orgEmail}
//         onChange={(e) => setOrgEmail(e.target.value)}
//         className="p-2 border rounded"
//         required
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         className="p-2 border rounded"
//         required
//       />
//       <div className="flex justify-between">
//         <button
//           type="submit"
//           className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
//           disabled={loading}
//         >
//           {loading ? 'Logging in...' : 'Login'}
//         </button>
//         <button type="button" onClick={onBack} className="underline text-gray-600">
//           ← Back
//         </button>
//       </div>
//     </form>
//   );
// };

// export default OrgLoginForm;
