'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type OrganizationFormData = {
  name: string;
  email: string;
  password: string;
  djMode: boolean;
  autoPlay: boolean;
  songCooldownMinutes: number;
  qrValidityHours: number;
  votingEnabled: boolean;
  paymentEnabled: boolean;
  specialRequestsEnabled: boolean;
};

const OrgRegistrationForm = ({ onCreated, onBack }: { onCreated: (orgId: string) => void; onBack: () => void }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    email: '',
    password: '',
    djMode: false,
    autoPlay: true,
    songCooldownMinutes: undefined as any,
    qrValidityHours: undefined as any,
    votingEnabled: true,
    paymentEnabled: true,
    specialRequestsEnabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok && result.organizationId) {
        onCreated(result.organizationId);
        router.push(`/org/${result.organizationId}/dashboard`);
      } else {
        setError(result.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-lg p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">Create Organization</h2>

        {error && (
          <div className="p-3 text-sm font-medium text-red-300 bg-red-800 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Organization Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <label className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              name="djMode"
              checked={formData.djMode}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-green-500 bg-gray-600 border-gray-500 rounded focus:ring-green-500"
            />
            <span>DJ Mode</span>
          </label>
          <label className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              name="autoPlay"
              checked={formData.autoPlay}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-green-500 bg-gray-600 border-gray-500 rounded focus:ring-green-500"
            />
            <span>Auto Play</span>
          </label>
          <label className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              name="votingEnabled"
              checked={formData.votingEnabled}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-green-500 bg-gray-600 border-gray-500 rounded focus:ring-green-500"
            />
            <span>Voting Enabled</span>
          </label>
          <label className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              name="paymentEnabled"
              checked={formData.paymentEnabled}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-green-500 bg-gray-600 border-gray-500 rounded focus:ring-green-500"
            />
            <span>Payments Enabled</span>
          </label>
          <label className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              name="specialRequestsEnabled"
              checked={formData.specialRequestsEnabled}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-green-500 bg-gray-600 border-gray-500 rounded focus:ring-green-500"
            />
            <span>Special Requests</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="songCooldownMinutes"
            type="number"
            min={0}
            value={formData.songCooldownMinutes ?? ''}
            onChange={handleChange}
            placeholder="Song Cooldown (minutes)"
            className="p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
          <input
            name="qrValidityHours"
            type="number"
            min={0.5}
            step={0.5}
            value={formData.qrValidityHours ?? ''}
            onChange={handleChange}
            placeholder="QR Validity (hours)"
            className="p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto text-center text-gray-400 hover:text-green-300 transition-colors"
          >
            ← Back to main page
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrgRegistrationForm;

// 'use client';

// import React, { useState } from 'react';

// type OrganizationFormData = {
//   name: string;
//   email: string;
//   password: string;
//   djMode: boolean;
//   autoPlay: boolean;
//   songCooldownMinutes: number;
//   qrValidityHours: number;
//   votingEnabled: boolean;
//   paymentEnabled: boolean;
//   specialRequestsEnabled: boolean;
// };

// const OrgRegistrationForm = ({ onCreated, onBack }: { onCreated: (orgId: string) => void; onBack: () => void }) => {
//   const [formData, setFormData] = useState<OrganizationFormData>({
//     name: '',
//     email: '',
//     password: '',
//     djMode: false,
//     autoPlay: true,
//     songCooldownMinutes: undefined as any,
//     qrValidityHours: undefined as any,
//     votingEnabled: true,
//     paymentEnabled: true,
//     specialRequestsEnabled: true,
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, type, checked, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch('/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       const result = await response.json();
//       if (response.ok && result.organizationId) {
//         onCreated(result.organizationId);
//       } else {
//         setError(result.message || 'Something went wrong');
//       }
//     } catch (err) {
//       setError('Server error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
//       <h2 className="text-2xl font-semibold mb-4 text-center text-black">Create Organization</h2>

//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       <form onSubmit={handleSubmit} className="space-y-4 text-black">
//         <input name="name" placeholder="Organization Name" value={formData.name} onChange={handleChange} required className="input" />
//         <input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} required className="input" />
//         <input name="password" placeholder="Password" type="password" value={formData.password} onChange={handleChange} required className="input" />

//         <div className="grid grid-cols-2 gap-2">
//           <label><input type="checkbox" name="djMode" checked={formData.djMode} onChange={handleChange} /> DJ Mode</label>
//           <label><input type="checkbox" name="autoPlay" checked={formData.autoPlay} onChange={handleChange} /> Auto Play</label>
//           <label><input type="checkbox" name="votingEnabled" checked={formData.votingEnabled} onChange={handleChange} /> Voting</label>
//           <label><input type="checkbox" name="paymentEnabled" checked={formData.paymentEnabled} onChange={handleChange} /> Payments</label>
//           <label><input type="checkbox" name="specialRequestsEnabled" checked={formData.specialRequestsEnabled} onChange={handleChange} /> Special Requests</label>
//         </div>

//         <input
//           name="songCooldownMinutes"
//           type="number"
//           min={0}
//           value={formData.songCooldownMinutes ?? ''}
//           onChange={handleChange}
//           placeholder="Song Cooldown (minutes)"
//           className="input"
//         />

//         <input
//           name="qrValidityHours"
//           type="number"
//           min={0.5}
//           step={0.5}
//           value={formData.qrValidityHours ?? ''}
//           onChange={handleChange}
//           placeholder="QR Validity (hours)"
//           className="input"
//         />

//         <div className="flex justify-between mt-6">
//           <button type="button" onClick={onBack} className="bg-gray-300 text-black px-4 py-2 rounded-xl">
//             ⬅ Back
//           </button>
//           <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-xl">
//             {loading ? 'Creating...' : 'Create'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default OrgRegistrationForm;
