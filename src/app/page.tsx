// import React from 'react';

// function App() {
//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center">
//       <div className="text-center space-y-6">
//         <div className="flex items-center justify-center space-x-4 mb-8">
//           <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
//             <span className="text-3xl">🎵</span>
//           </div>
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//             Meri Dhun
//           </h1>
//         </div>
//         <p className="text-gray-300 text-xl max-w-md mx-auto leading-relaxed">
//           Your music, your choice. Connect, vote, and vibe together.
//         </p>
//         <div className="flex items-center justify-center space-x-2 text-green-400">
//           <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//           <span className="text-sm font-medium">Ready to start your musical journey</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;
'use client';
import React, { useState } from 'react';
import LandingPage from '../components/LandingPage';
import PubDashboard from '../components/PubDashboard';
import OrgRegistrationForm from '../components/OrgRegistrationForm';
import OrgLoginForm from '../components/OrgLoginForm';
import QrJoinForm from '../components/QrJoinForm';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'join' | 'create' | 'login' | 'dashboard'>('landing');
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const handleGetStarted = () => {
    setCurrentView('join');
  };

  const handleOrgCreated = (orgId: string) => {
    setOrganizationId(orgId);
    setCurrentView('dashboard');
  };

  const handleOrgLogin = (orgId: string) => {
    setOrganizationId(orgId);
    setCurrentView('dashboard');
  };
  
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (currentView === 'dashboard' && organizationId) {
    return <PubDashboard organizationId={organizationId} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="container max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
              <span className="text-2xl">🎵</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
              Meri Dhun
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Choose how you want to join the music experience</p>
        </div>

        {/* Options */}
        <div className="space-y-6">
          {currentView === 'join' && (
            <>
              <QrJoinForm />
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setCurrentView('create')}
                  className="w-full sm:flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  🏢 Create Organization
                </button>
                <button
                  onClick={() => setCurrentView('login')}
                  className="w-full sm:flex-1 bg-green-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  🔐 Login
                </button>
              </div>
              
              <button
                onClick={() => setCurrentView('landing')}
                className="w-full text-center text-gray-400 hover:text-green-300 transition-colors py-2"
              >
                ← Back to Home
              </button>
            </>
          )}

          {currentView === 'create' && (
            <OrgRegistrationForm
              onCreated={handleOrgCreated}
              onBack={() => setCurrentView('join')}
            />
          )}

          {currentView === 'login' && (
            <OrgLoginForm
              onLogin={handleOrgLogin}
              onBack={() => setCurrentView('join')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

// // src/app/page.tsx
// "use client"
// import React, { useState } from 'react';
// import LandingPage from '../components/LandingPage';
// import PubDashboard from '../components/PubDashboard';
// import OrgRegistrationForm from '../components/OrgRegistrationForm';
// import OrgLoginForm from '../components/OrgLoginForm';
// import QrJoinForm from '../components/QrJoinForm';

// function App() {
//   const [currentView, setCurrentView] = useState<'landing' | 'join' | 'create' | 'login' | 'dashboard'>('landing');
//   const [organizationId, setOrganizationId] = useState<string | null>(null);

//   const handleGetStarted = () => {
//     setCurrentView('join');
//   };

//   const handleOrgCreated = (orgId: string) => {
//     setOrganizationId(orgId);
//     setCurrentView('dashboard');
//   };

//   const handleOrgLogin = (orgId: string) => {
//     setOrganizationId(orgId);
//     setCurrentView('dashboard');
//   };

//   if (currentView === 'landing') {
//     return <LandingPage onGetStarted={handleGetStarted} />;
//   }

//   if (currentView === 'dashboard' && organizationId) {
//     return <PubDashboard organizationId={organizationId} />;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center mb-4">
//             <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center mr-4">
//               <span className="text-2xl">🎵</span>
//             </div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
//               Meri Dhun
//             </h1>
//           </div>
//           <p className="text-gray-300 text-lg">Choose how you want to join the music experience</p>
//         </div>

//         {/* Options */}
//         <div className="max-w-md mx-auto space-y-6">
//           {currentView === 'join' && (
//             <>
//               <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
//                 <h2 className="text-2xl font-bold mb-6 text-center">Join as Guest</h2>
//                 <QrJoinForm />
//               </div>
              
//               <div className="flex space-x-4">
//                 <button
//                   onClick={() => setCurrentView('create')}
//                   className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
//                 >
//                   🏢 Create Organization
//                 </button>
//                 <button
//                   onClick={() => setCurrentView('login')}
//                   className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
//                 >
//                   🔐 Login
//                 </button>
//               </div>
              
//               <button
//                 onClick={() => setCurrentView('landing')}
//                 className="w-full text-gray-400 hover:text-white transition-colors py-2"
//               >
//                 ← Back to Home
//               </button>
//             </>
//           )}

//           {currentView === 'create' && (
//             <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
//               <OrgRegistrationForm
//                 onCreated={handleOrgCreated}
//                 onBack={() => setCurrentView('join')}
//               />
//             </div>
//           )}

//           {currentView === 'login' && (
//             <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
//               <OrgLoginForm
//                 onLogin={handleOrgLogin}
//                 onBack={() => setCurrentView('join')}
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;
// // "use client"
// // import React, { useState } from 'react';
// // import { Play, Music, Users, Smartphone, QrCode, TrendingUp, Heart, Zap } from 'lucide-react';

// // interface LandingPageProps {
// //   onGetStarted: () => void;
// // }

// // export default function LandingPage({ onGetStarted }: LandingPageProps) {
// //   const [isPlaying, setIsPlaying] = useState(false);

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
// //       {/* Navigation */}
// //       <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12">
// //         <div className="flex items-center space-x-3">
// //           <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
// //             <Music className="w-6 h-6 text-white" />
// //           </div>
// //           <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
// //             Meri Dhun
// //           </span>
// //         </div>
// //         <button
// //           onClick={onGetStarted}
// //           className="bg-green-500 hover:bg-green-400 text-black font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
// //         >
// //           Get Started
// //         </button>
// //       </nav>

// //       {/* Hero Section */}
// //       <div className="relative px-6 lg:px-12 py-20">
// //         <div className="max-w-6xl mx-auto">
// //           <div className="grid lg:grid-cols-2 gap-12 items-center">
// //             <div className="space-y-8">
// //               <div className="space-y-4">
// //                 <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
// //                   Indian origin music that
// //                   <span className="block bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
// //                     brings us together
// //                   </span>
// //                 </h1>
// //                 <p className="text-xl text-gray-300 leading-relaxed">
// //                   Transform any venue into an interactive music experience. Let your audience choose, vote, and boost their favorite songs in real-time.
// //                 </p>
// //               </div>

// //               <div className="flex flex-col sm:flex-row gap-4">
// //                 <button
// //                   onClick={onGetStarted}
// //                   className="bg-green-500 hover:bg-green-400 text-black font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
// //                 >
// //                   <Play className="w-5 h-5" />
// //                   <span>Start Playing</span>
// //                 </button>
// //                 <button className="border border-gray-600 hover:border-white text-white font-semibold px-8 py-4 rounded-full transition-all duration-300">
// //                   Learn More
// //                 </button>
// //               </div>

// //               <div className="flex items-center space-x-8 text-sm text-gray-400">
// //                 <div className="flex items-center space-x-2">
// //                   <Users className="w-4 h-4" />
// //                   <span>10K+ Active Users</span>
// //                 </div>
// //                 <div className="flex items-center space-x-2">
// //                   <Music className="w-4 h-4" />
// //                   <span>1M+ Songs Played</span>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Interactive Music Player Mockup */}
// //             <div className="relative">
// //               <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
// //                 <div className="space-y-6">
// //                   {/* Now Playing */}
// //                   <div className="flex items-center space-x-4">
// //                     <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
// //                       <Music className="w-8 h-8 text-white" />
// //                     </div>
// //                     <div className="flex-1">
// //                       <h3 className="font-semibold text-white">Blinding Lights</h3>
// //                       <p className="text-gray-400">The Weeknd</p>
// //                     </div>
// //                     <button
// //                       onClick={() => setIsPlaying(!isPlaying)}
// //                       className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 transition-colors"
// //                     >
// //                       <Play className="w-6 h-6 text-black ml-1" />
// //                     </button>
// //                   </div>

// //                   {/* Progress Bar */}
// //                   <div className="space-y-2">
// //                     <div className="w-full h-1 bg-gray-700 rounded-full">
// //                       <div className="w-1/3 h-1 bg-green-500 rounded-full"></div>
// //                     </div>
// //                     <div className="flex justify-between text-xs text-gray-400">
// //                       <span>1:23</span>
// //                       <span>3:45</span>
// //                     </div>
// //                   </div>

// //                   {/* Queue Preview */}
// //                   <div className="space-y-3">
// //                     <h4 className="text-sm font-semibold text-gray-300">Up Next</h4>
// //                     {[
// //                       { title: "Shape of You", artist: "Ed Sheeran", votes: 24 },
// //                       { title: "Levitating", artist: "Dua Lipa", votes: 18 },
// //                       { title: "Good 4 U", artist: "Olivia Rodrigo", votes: 15 }
// //                     ].map((song, index) => (
// //                       <div key={index} className="flex items-center justify-between text-sm">
// //                         <div>
// //                           <p className="text-white">{song.title}</p>
// //                           <p className="text-gray-400">{song.artist}</p>
// //                         </div>
// //                         <div className="flex items-center space-x-2">
// //                           <Heart className="w-4 h-4 text-red-500" />
// //                           <span className="text-gray-400">{song.votes}</span>
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Floating Elements */}
// //               <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
// //                 <TrendingUp className="w-8 h-8 text-black" />
// //               </div>
// //               <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
// //                 <Zap className="w-6 h-6 text-white" />
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Features Section */}
// //       <div className="px-6 lg:px-12 py-20 bg-gradient-to-r from-gray-900 to-black">
// //         <div className="max-w-6xl mx-auto">
// //           <div className="text-center mb-16">
// //             <h2 className="text-4xl lg:text-5xl font-bold mb-6">
// //               How <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Meri Dhun</span> Works
// //             </h2>
// //             <p className="text-xl text-gray-300 max-w-3xl mx-auto">
// //               Three simple steps to transform your venue into an interactive music experience
// //             </p>
// //           </div>

// //           <div className="grid md:grid-cols-3 gap-8">
// //             {[
// //               {
// //                 icon: QrCode,
// //                 title: "Scan & Join",
// //                 description: "Guests scan a QR code to instantly join your music session. No app downloads required.",
// //                 color: "from-green-400 to-green-600"
// //               },
// //               {
// //                 icon: Music,
// //                 title: "Search & Vote",
// //                 description: "Browse millions of songs, add favorites to the queue, and vote for what plays next.",
// //                 color: "from-blue-400 to-blue-600"
// //               },
// //               {
// //                 icon: TrendingUp,
// //                 title: "Boost & Play",
// //                 description: "Use boost points to prioritize songs or make special requests that everyone will hear.",
// //                 color: "from-purple-400 to-purple-600"
// //               }
// //             ].map((feature, index) => (
// //               <div key={index} className="group">
// //                 <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 transform hover:-translate-y-2">
// //                   <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
// //                     <feature.icon className="w-8 h-8 text-white" />
// //                   </div>
// //                   <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
// //                   <p className="text-gray-300 leading-relaxed">{feature.description}</p>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>

// //       {/* Stats Section */}
// //       <div className="px-6 lg:px-12 py-20">
// //         <div className="max-w-4xl mx-auto text-center">
// //           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
// //             {[
// //               { number: "10K+", label: "Active Users" },
// //               { number: "1M+", label: "Songs Played" },
// //               { number: "500+", label: "Venues" },
// //               { number: "99%", label: "Uptime" }
// //             ].map((stat, index) => (
// //               <div key={index} className="space-y-2">
// //                 <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
// //                   {stat.number}
// //                 </div>
// //                 <div className="text-gray-400 font-medium">{stat.label}</div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>

// //       {/* CTA Section */}
// //       <div className="px-6 lg:px-12 py-20 bg-gradient-to-r from-green-500 to-blue-600">
// //         <div className="max-w-4xl mx-auto text-center">
// //           <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-black">
// //             Ready to revolutionize your music experience?
// //           </h2>
// //           <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
// //             Join thousands of venues already using Meri Dhun to create unforgettable musical moments.
// //           </p>
// //           <button
// //             onClick={onGetStarted}
// //             className="bg-black hover:bg-gray-900 text-white font-semibold px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 text-lg"
// //           >
// //             Start Your Free Trial
// //           </button>
// //         </div>
// //       </div>

// //       {/* Footer */}
// //       <footer className="px-6 lg:px-12 py-12 bg-black border-t border-gray-800">
// //         <div className="max-w-6xl mx-auto">
// //           <div className="flex flex-col md:flex-row justify-between items-center">
// //             <div className="flex items-center space-x-3 mb-4 md:mb-0">
// //               <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
// //                 <Music className="w-5 h-5 text-white" />
// //               </div>
// //               <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
// //                 Meri Dhun
// //               </span>
// //             </div>
// //             <div className="text-gray-400 text-sm">
// //               © 2025 Meri Dhun. All rights reserved.
// //             </div>
// //           </div>
// //         </div>
// //       </footer>
// //     </div>
// //   );
// //}



// 'use client';

// import React, { useState } from 'react';
// import PubDashboard from '@/components/PubDashboard';
// import OrgRegisterForm from '@/components/OrgRegistrationForm';
// import OrgLoginForm from '@/components/OrgLoginForm'; // NEW
// import QRJoinForm from '@/components/QrJoinForm';

// function App() {
//   const [mode, setMode] = useState<'join' | 'create' | 'login' | null>(null);
//   const [organizationId, setOrganizationId] = useState<string | null>(null);

//   if (organizationId) {
//     return <PubDashboard organizationId={organizationId} />;
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
//       {!mode && (
//         <>
//           <h1 className="text-3xl font-bold">Welcome to YourDhun</h1>
//           <button
//             onClick={() => setMode('join')}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow"
//           >
//             🎧 Join as a Guest
//           </button>
//           <button
//             onClick={() => setMode('create')}
//             className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow"
//           >
//             🏢 Create an Organization
//           </button>
//           <button
//             onClick={() => setMode('login')}
//             className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl shadow"
//           >
//             🔐 Login to Organization
//           </button>
//         </>
//       )}

//       {mode === 'join' && (
//         <QRJoinForm
//           // onJoin={(orgId: string) => setOrganizationId(orgId)}
//           // onBack={() => setMode(null)}
//         />
//       )}

//       {mode === 'create' && (
//         <OrgRegisterForm
//           onCreated={(orgId: string) => setOrganizationId(orgId)}
//           onBack={() => setMode(null)}
//         />
//       )}

//       {mode === 'login' && (
//         <OrgLoginForm
//           onLogin={(orgId: string) => setOrganizationId(orgId)}
//           onBack={() => setMode(null)}
//         />
//       )}
//     </div>
//   );
// }

// export default App;

// // // 'use client';

// // // import React, { useState } from 'react';
// // // import PubDashboard from '@/components/PubDashboard';
// // // import OrgRegisterForm from '@/components/OrgRegistrationForm'; // Assume you create this
// // // import QRJoinForm from '@/components/QrJoinForm' // Or a simple org ID input

// // // function App() {
// // //   const [mode, setMode] = useState<'join' | 'create' | null>(null);
// // //   const [organizationId, setOrganizationId] = useState<string | null>(null);

// // //   if (organizationId) {
// // //     return <PubDashboard organizationId={organizationId} />;
// // //   }

// // //   return (
// // //     <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
// // //       {!mode && (
// // //         <>
// // //           <h1 className="text-3xl font-bold">Welcome to YourDhun</h1>
// // //           <button
// // //             onClick={() => setMode('join')}
// // //             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow"
// // //           >
// // //             🎧 Join as a Guest
// // //           </button>
// // //           <button
// // //             onClick={() => setMode('create')}
// // //             className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow"
// // //           >
// // //             🎤 Create Your Own Organization
// // //           </button>
// // //         </>
// // //       )}

// // //       {mode === 'join' && (
// // //         <QRJoinForm
// // //           // onJoin={(orgId: string) => setOrganizationId(orgId)}
// // //           // onBack={() => setMode(null)}
// // //         />
// // //       )}

// // //       {mode === 'create' && (
// // //         <OrgRegisterForm
// // //           onCreated={(orgId: string) => setOrganizationId(orgId)}
// // //           onBack={() => setMode(null)}
// // //         />
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // export default App;
// // "use client"
// // import React from 'react';
// // import { useState } from 'react';
// // import LandingPage from '../components/LandingPage';
// // import PubDashboard from '../components/PubDashboard';
// // import OrgRegisterForm from '../components/OrgRegistrationForm';
// // import OrgLoginForm from '../components/OrgLoginForm';
// // import QrJoinForm from '../components/QrJoinForm';

// // function App() {
// //   const [currentView, setCurrentView] = useState<'landing' | 'join' | 'create' | 'login' | 'dashboard'>('landing');
// //   const [organizationId, setOrganizationId] = useState<string | null>(null);

// //   const handleGetStarted = () => {
// //     setCurrentView('join');
// //   };

// //   const handleOrgCreated = (orgId: string) => {
// //     setOrganizationId(orgId);
// //     setCurrentView('dashboard');
// //   };

// //   const handleOrgLogin = (orgId: string) => {
// //     setOrganizationId(orgId);
// //     setCurrentView('dashboard');
// //   };

// //   if (currentView === 'landing') {
// //     return <LandingPage onGetStarted={handleGetStarted} />;
// //   }

// //   if (currentView === 'dashboard' && organizationId) {
// //     return <PubDashboard organizationId={organizationId} />;
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
// //       <div className="container mx-auto px-4 py-8">
// //         {/* Header */}
// //         <div className="text-center mb-8">
// //           <div className="flex items-center justify-center mb-4">
// //             <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-4">
// //               <span className="text-2xl">🎵</span>
// //             </div>
// //             <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
// //               Meri Dhun
// //             </h1>
// //           </div>
// //           <p className="text-gray-300 text-lg">Choose how you want to join the music experience</p>
// //         </div>

// //         {/* Options */}
// //         <div className="max-w-md mx-auto space-y-6">
// //           {currentView === 'join' && (
// //             <>
// //               <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
// //                 <h2 className="text-2xl font-bold mb-6 text-center">Join as Guest</h2>
// //                 <QrJoinForm />
// //               </div>
              
// //               <div className="flex space-x-4">
// //                 <button
// //                   onClick={() => setCurrentView('create')}
// //                   className="flex-1 bg-green-500 hover:bg-green-400 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-300"
// //                 >
// //                   🏢 Create Organization
// //                 </button>
// //                 <button
// //                   onClick={() => setCurrentView('login')}
// //                   className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
// //                 >
// //                   🔐 Login
// //                 </button>
// //               </div>
              
// //               <button
// //                 onClick={() => setCurrentView('landing')}
// //                 className="w-full text-gray-400 hover:text-white transition-colors py-2"
// //               >
// //                 ← Back to Home
// //               </button>
// //             </>
// //           )}

// //           {currentView === 'create' && (
// //             <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
// //               <OrgRegisterForm
// //                 onCreated={handleOrgCreated}
// //                 onBack={() => setCurrentView('join')}
// //               />
// //             </div>
// //           )}

// //           {currentView === 'login' && (
// //             <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
// //               <OrgLoginForm
// //                 onLogin={handleOrgLogin}
// //                 onBack={() => setCurrentView('join')}
// //               />
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default App;