import React, { useEffect, useState } from 'react';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface OrgSettings {
  id: string;
  name: string;
  email: string;
  djMode: boolean;
  autoPlay: boolean;
  songCooldownMinutes: number;
  qrValidityHours: number;
  votingEnabled: boolean;
  paymentEnabled: boolean;
  specialRequestsEnabled: boolean;
}

interface VenueSettingsProps {
  id: string;
}

export default function VenueSettings({ id }: VenueSettingsProps) {
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/org/${id}/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        setError('Could not load organization settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const { name, type, checked, value } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/org/${id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          djMode: settings.djMode,
          autoPlay: settings.autoPlay,
          songCooldownMinutes: settings.songCooldownMinutes,
          qrValidityHours: settings.qrValidityHours,
          votingEnabled: settings.votingEnabled,
          paymentEnabled: settings.paymentEnabled,
          specialRequestsEnabled: settings.specialRequestsEnabled,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 mx-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="bg-gray-900 border border-red-500/50 rounded-2xl p-8 text-center mx-4">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center mx-4">
        <p className="text-gray-400">Organization not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl mx-4">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Venue Settings</h1>
            <p className="text-blue-100 text-sm sm:text-base">Configure your venue preferences</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 sm:p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm sm:text-base">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-3 sm:p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400 text-sm sm:text-base">Settings updated successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Toggle Settings */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Features</h3>
            
            {[
              { key: 'djMode', label: 'DJ Mode', description: 'Enable DJ controls and admin features' },
              { key: 'autoPlay', label: 'Auto Play', description: 'Automatically play next song in queue' },
              { key: 'votingEnabled', label: 'Voting', description: 'Allow users to vote on songs' },
              { key: 'paymentEnabled', label: 'Payments', description: 'Enable boost payments' },
              { key: 'specialRequestsEnabled', label: 'Special Requests', description: 'Allow dedications and announcements' }
            ].map((setting) => (
              <div key={setting.key} className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={setting.key}
                    checked={settings[setting.key as keyof OrgSettings] as boolean}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div>
                    <span className="text-white font-medium text-sm sm:text-base">{setting.label}</span>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">{setting.description}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>

          {/* Numeric Settings */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Timing</h3>
            
            <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
              <label className="block">
                <span className="text-white font-medium mb-2 block text-sm sm:text-base">Song Cooldown (minutes)</span>
                <p className="text-gray-400 text-xs sm:text-sm mb-3">Prevent the same song from being played too frequently</p>
                <input
                  type="number"
                  name="songCooldownMinutes"
                  value={settings.songCooldownMinutes}
                  onChange={handleChange}
                  min={0}
                  className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
                />
              </label>
            </div>

            <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
              <label className="block">
                <span className="text-white font-medium mb-2 block text-sm sm:text-base">QR Code Validity (hours)</span>
                <p className="text-gray-400 text-xs sm:text-sm mb-3">How long QR codes remain valid</p>
                <input
                  type="number"
                  name="qrValidityHours"
                  value={settings.qrValidityHours}
                  onChange={handleChange}
                  min={0}
                  step={0.1}
                  className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-center sm:justify-end pt-4 sm:pt-6 border-t border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl hover:from-blue-400 hover:to-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// import React, { useEffect, useState } from 'react';
// import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';

// interface OrgSettings {
//   id: string;
//   name: string;
//   email: string;
//   djMode: boolean;
//   autoPlay: boolean;
//   songCooldownMinutes: number;
//   qrValidityHours: number;
//   votingEnabled: boolean;
//   paymentEnabled: boolean;
//   specialRequestsEnabled: boolean;
// }

// interface VenueSettingsProps {
//   id: string;
// }

// export default function VenueSettings({ id }: VenueSettingsProps) {
//   const [settings, setSettings] = useState<OrgSettings | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     if (!id || typeof id !== 'string') return;

//     const fetchSettings = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/org/${id}/settings`);
//         if (!res.ok) throw new Error('Failed to fetch settings');
//         const data = await res.json();
//         setSettings(data);
//       } catch (err) {
//         setError('Could not load organization settings.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSettings();
//   }, [id]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!settings) return;
//     const { name, type, checked, value } = e.target;
//     setSettings({
//       ...settings,
//       [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!settings) return;

//     setSaving(true);
//     setError(null);
//     setSuccess(false);

//     try {
//       const res = await fetch(`/api/org/${id}/settings`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           djMode: settings.djMode,
//           autoPlay: settings.autoPlay,
//           songCooldownMinutes: settings.songCooldownMinutes,
//           qrValidityHours: settings.qrValidityHours,
//           votingEnabled: settings.votingEnabled,
//           paymentEnabled: settings.paymentEnabled,
//           specialRequestsEnabled: settings.specialRequestsEnabled,
//         }),
//       });

//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.error || 'Failed to update settings');
//       }

//       setSuccess(true);
//       setTimeout(() => setSuccess(false), 3000);
//     } catch (err: any) {
//       setError(err.message || 'An error occurred');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
//         <div className="animate-pulse">
//           <div className="h-8 bg-gray-700 rounded mb-6"></div>
//           <div className="space-y-4">
//             {[...Array(6)].map((_, i) => (
//               <div key={i} className="h-12 bg-gray-700 rounded"></div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error && !settings) {
//     return (
//       <div className="bg-gray-900 border border-red-500/50 rounded-2xl p-8 text-center">
//         <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//         <p className="text-red-400 text-lg">{error}</p>
//       </div>
//     );
//   }

//   if (!settings) {
//     return (
//       <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
//         <p className="text-gray-400">Organization not found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
//       <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
//         <div className="flex items-center space-x-3">
//           <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
//             <Settings className="w-7 h-7 text-white" />
//           </div>
//           <div>
//             <h1 className="text-xl sm:text-2xl font-bold">Venue Settings</h1>
//             <p className="text-blue-100 text-sm sm:text-base">Configure your venue preferences</p>
//           </div>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-4 sm:space-y-6">
//         {error && (
//           <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 sm:p-4 flex items-center space-x-3">
//             <AlertCircle className="w-5 h-5 text-red-400" />
//             <p className="text-red-400 text-sm sm:text-base">{error}</p>
//           </div>
//         )}

//         {success && (
//           <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-3 sm:p-4 flex items-center space-x-3">
//             <CheckCircle className="w-5 h-5 text-green-400" />
//             <p className="text-green-400 text-sm sm:text-base">Settings updated successfully!</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//           {/* Toggle Settings */}
//           <div className="space-y-3 sm:space-y-4">
//             <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Features</h3>
            
//             {[
//               { key: 'djMode', label: 'DJ Mode', description: 'Enable DJ controls and admin features' },
//               { key: 'autoPlay', label: 'Auto Play', description: 'Automatically play next song in queue' },
//               { key: 'votingEnabled', label: 'Voting', description: 'Allow users to vote on songs' },
//               { key: 'paymentEnabled', label: 'Payments', description: 'Enable boost payments' },
//               { key: 'specialRequestsEnabled', label: 'Special Requests', description: 'Allow dedications and announcements' }
//             ].map((setting) => (
//               <div key={setting.key} className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
//                 <label className="flex items-start space-x-3 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     name={setting.key}
//                     checked={settings[setting.key as keyof OrgSettings] as boolean}
//                     onChange={handleChange}
//                     className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
//                   />
//                   <div>
//                     <span className="text-white font-medium text-sm sm:text-base">{setting.label}</span>
//                     <p className="text-gray-400 text-xs sm:text-sm mt-1">{setting.description}</p>
//                   </div>
//                 </label>
//               </div>
//             ))}
//           </div>

//           {/* Numeric Settings */}
//           <div className="space-y-3 sm:space-y-4">
//             <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Timing</h3>
            
//             <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
//               <label className="block">
//                 <span className="text-white font-medium mb-2 block text-sm sm:text-base">Song Cooldown (minutes)</span>
//                 <p className="text-gray-400 text-xs sm:text-sm mb-3">Prevent the same song from being played too frequently</p>
//                 <input
//                   type="number"
//                   name="songCooldownMinutes"
//                   value={settings.songCooldownMinutes}
//                   onChange={handleChange}
//                   min={0}
//                   className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
//                 />
//               </label>
//             </div>

//             <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
//               <label className="block">
//                 <span className="text-white font-medium mb-2 block text-sm sm:text-base">QR Code Validity (hours)</span>
//                 <p className="text-gray-400 text-xs sm:text-sm mb-3">How long QR codes remain valid</p>
//                 <input
//                   type="number"
//                   name="qrValidityHours"
//                   value={settings.qrValidityHours}
//                   onChange={handleChange}
//                   min={0}
//                   step={0.1}
//                   className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
//                 />
//               </label>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-center sm:justify-end pt-4 sm:pt-6 border-t border-gray-700">
//           <button
//             type="submit"
//             disabled={saving}
//             className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl hover:from-blue-400 hover:to-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base"
//           >
//             <Save className="w-5 h-5" />
//             <span>{saving ? 'Saving...' : 'Save Settings'}</span>
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }