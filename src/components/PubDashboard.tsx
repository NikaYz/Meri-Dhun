// 'use client';
// import React, { useRef, useState, useEffect } from 'react';
// import { Music, QrCode, BarChart3, Headphones, MessageCircleCodeIcon, Settings2Icon, Home, Search, Radio, Waves, Mic2 } from 'lucide-react';
// import SongSearch from './SongSearch';
// import Leaderboard from './Leaderboard';
// import GenerateQr from './GenerateQr';
// import { Song } from '@/lib/song';
// import NowPlaying from './NowPlaying';
// import { LeaderboardService } from '@/lib/services/leaderboard';
// import { useSocket } from '@/hooks/useSocket';
// import { useCurrentUser } from '@/hooks/useCurrentUser';
// import { addSongToOrg } from '@/lib/features/addSong';
// import SpecialRequests from './SpecialRequests';
// import {  useDjAvailability} from '@/lib/features/useDjAvailable';
// import { useNowPlayingStore } from '@/lib/stores/nowPlayingStore';
// import { getOrganizationName } from '@/lib/features/getOrganizationName';
// import VenueSettings from './VenueSettings';

// interface PubDashboardProps {
//   organizationId: string;
// }

// export default function PubDashboard({ organizationId }: PubDashboardProps) {
//   const user = useCurrentUser();
//   const userId = user?.userId;
//   const role = user?.role;
//   const [activeTab, setActiveTab] = useState<'search' | 'leaderboard' | 'request' | 'qr' | 'nowPlaying' | 'setting'>('search');
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const { currentSong, setCurrentSong, audioRef } = useNowPlayingStore();
//   const { djAvailable, loading } = useDjAvailability(organizationId);

//   const {
//     emitSongPlayed,
//     emitSongBoosted,
//     emitSongVoted,
//     emitSpecialRequest,
//     emitLeaderboardUpdated,
//     emitNowPlayingUpdated,
//     emitSkipSong,
//     onLeaderboardUpdated,
//     onSongPlayed,
//     offSongPlayed,
//     offLeaderboardUpdated,
//     onSongVoted,
//     offSongVoted,
//     onSongBoosted,
//     offSongBoosted,
//     onSpecialRequest,
//     offSpecialRequest,
//     onNowPlayingUpdated,
//     offNowPlayingUpdated,
//     onSkipSong,
//     offSkipSong,
//   } = useSocket(organizationId, userId ?? '');
//   const [organizationName, setOrganizationName] = useState<string>("");

//   useEffect(() => {
//     async function fetchOrgName() {
//       try {
//         const name = await getOrganizationName.getOrganizationName(organizationId);
//         setOrganizationName(name);
//       } catch (error) {
//         console.error("Failed to fetch organization name", error);
//       }
//     }

//     fetchOrgName();
//   }, [organizationId]);

//   useEffect(() => {
//     if (!userId) return;

//     async function fetchLeaderboard() {
//       const leaderboard = await LeaderboardService.getLeaderboard(organizationId, userId as string);
//       if (leaderboard.length > 0) {
//         const topSong = leaderboard[0].song;
//         if (!currentSong || currentSong.id !== topSong.id || currentSong.downloadUrl !== topSong.downloadUrl) {
//           setCurrentSong(topSong);
//         }
//       }
//     }

//     fetchLeaderboard();
//   }, [refreshTrigger, organizationId, userId, currentSong, setCurrentSong]);

//   const handleSongPlay = async (song: Song) => {
//     const result = await addSongToOrg({
//       organizationId,
//       token: user?.token || '', 
//       song: {
//         ...song,
//         duration: Number(song.duration),
//         downloadUrl: song.downloadUrl || '',
//       },
//     });
//       if (!result.success) {
//       const errorNotification = document.createElement('div');
//       errorNotification.className =
//         'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
//       errorNotification.innerHTML = `
//         <div class="flex items-center">
//           <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M18 10A8 8 0 11.001 9.999 8 8 0 0118 10zm-9-4a1 1 0 012 0v4a1 1 0 11-2 0V6zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd"></path>
//           </svg>
//           ${result.message}
//         </div>
//       `;
//       document.body.appendChild(errorNotification);

//       setTimeout(() => {
//         errorNotification.style.transform = 'translateX(100%)';
//         setTimeout(() => document.body.removeChild(errorNotification), 300);
//       }, 3000);
//       return; 
//     }

//     const notification = document.createElement('div');
//     notification.className =
//       'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
//     notification.innerHTML = `
//       <div class="flex items-center">
//         <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//         </svg>
//         Added "${song.name}" to queue!
//       </div>
//     `;
//     document.body.appendChild(notification);

//     setTimeout(() => {
//       notification.style.transform = 'translateX(100%)';
//       setTimeout(() => document.body.removeChild(notification), 300);
//     }, 3000);

//     LeaderboardService.addSongPlay(organizationId, song);
//     emitSongPlayed({ songId: song.id, userId, organizationId });
//     emitLeaderboardUpdated({ song, userId, organizationId });

//     if (!currentSong || currentSong.id !== song.id) {
//       setCurrentSong(song);
//     }

//     setRefreshTrigger((prev) => prev + 1);
//   };


//   useEffect(() => {
//     const handleLeaderboardUpdate = (data: { song: Song; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       LeaderboardService.addSongPlay(data.organizationId, data.song);
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onLeaderboardUpdated(handleLeaderboardUpdate);
//     return () => {
//       offLeaderboardUpdated(handleLeaderboardUpdate);
//     };
//   }, [onLeaderboardUpdated, offLeaderboardUpdated, userId]);

//   useEffect(() => {
//     const handleBroadcast = (data: { songId: string; userId: string }) => {
//       if (data.userId === userId) return;
//     };

//     onSongPlayed(handleBroadcast);
//     return () => {
//       offSongPlayed(handleBroadcast);
//     };
//   }, [onSongPlayed, offSongPlayed, userId]);

//   useEffect(() => {
//     const handleSongVoted = async (data: { songId: string; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onSongVoted(handleSongVoted);
//     return () => {
//       offSongVoted(handleSongVoted);
//     };
//   }, [onSongVoted, offSongVoted, userId]);

//   useEffect(() => {
//     const handleSongBoosted = async (data: { songId: string; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onSongBoosted(handleSongBoosted);
//     return () => {
//       offSongBoosted(handleSongBoosted);
//     };
//   }, [onSongBoosted, offSongBoosted, userId]);

//   const fetchLeaderboard = async () => {
//     if (!currentSong) return;
//     await LeaderboardService.removeSongFromLeaderboard(organizationId, currentSong.id);
    
//     const updated = await LeaderboardService.getLeaderboard(organizationId, userId as string);
//     if (updated.length > 0) {
//       setCurrentSong(updated[0].song);
//       emitSkipSong(updated[0].song);
//     } else {
//       setCurrentSong(null);
//     }
//     setRefreshTrigger((prev) => prev + 1);
//   };

//   const handleSongEnd = () => {
//     if (djAvailable) {
//       fetchLeaderboard(); 
//     }
//   };

//   const tabs = [
//     { id: 'search' as const, label: 'Search', icon: Search },
//     { id: 'leaderboard' as const, label: 'Queue', icon: BarChart3 },
//     { id: 'nowPlaying' as const, label: 'Now Playing', icon: Radio },
//     { id: 'qr' as const, label: 'QR Code', icon: QrCode },
//     { id: 'setting' as const, label: 'Settings', icon: Settings2Icon},
//   ];
//   const visibleTabs = role === 'ADMIN' ? tabs : tabs.filter(tab => tab.id !== 'qr' && tab.id !== 'setting');

//   return (
//     <div className="min-h-screen bg-black text-white flex flex-col">
//       {/* Desktop Sidebar */}
//       <div className="hidden lg:flex flex-col w-64 bg-black border-r border-gray-800 fixed h-full top-0 left-0">
//         <div className="p-6">
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//               <Music className="w-5 h-5 text-black" />
//             </div>
//             <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//               Meri Dhun
//             </span>
//           </div>
//         </div>

//         <nav className="flex-1 px-6 overflow-y-auto">
//           <div className="space-y-2">
//             <div className="flex items-center space-x-3 px-4 py-2 text-gray-400 text-sm font-medium">
//               <Home className="w-4 h-4" />
//               <span>MENU</span>
//             </div>
//             {visibleTabs.map((tab) => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
//                     activeTab === tab.id 
//                       ? 'bg-gray-800 text-white shadow-lg' 
//                       : 'text-gray-400 hover:text-white hover:bg-gray-900'
//                   }`}
//                 >
//                   <Icon className="w-5 h-5" />
//                   <span>{tab.label}</span>
//                 </button>
//               );
//             })}
//           </div>

//           <div className="mt-8 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
//             <div className="flex items-center space-x-2 mb-2">
//               <Mic2 className="w-4 h-4 text-green-400" />
//               <h3 className="text-sm font-semibold text-gray-300">Current Venue</h3>
//             </div>
//             <p className="text-lg font-bold text-white truncate">{organizationName}</p>
//             <div className="flex items-center space-x-1 mt-2">
//               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//               <span className="text-xs text-green-400">Live</span>
//             </div>
//           </div>
//         </nav>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 lg:ml-64 flex flex-col pt-16">
//         {/* Mobile Top Navigation Bar */}
//         <div className="fixed top-0 left-0 right-0 lg:hidden bg-black border-b border-gray-800 z-50">
//             <div className="flex justify-around items-center h-16">
//                 {visibleTabs.map((tab) => {
//                     const Icon = tab.icon;
//                     return (
//                         <button
//                             key={tab.id}
//                             onClick={() => setActiveTab(tab.id)}
//                             className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
//                                 activeTab === tab.id
//                                     ? 'text-green-500'
//                                     : 'text-gray-400 hover:text-green-300'
//                             }`}
//                         >
//                             <Icon className="w-5 h-5 mb-1" />
//                             <span className="text-xs font-medium">{tab.label}</span>
//                         </button>
//                     );
//                 })}
//             </div>
//         </div>

//         {/* Content Area */}
//         <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
//           <div className="p-4 md:p-6">
//             {activeTab === 'search' && (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Search Music</h1>
//                     <p className="text-gray-400 text-sm sm:text-base">Discover and add songs to the queue</p>
//                   </div>
//                   <div className="flex items-center space-x-2 text-green-400">
//                     <Waves className="w-4 h-4 sm:w-5 sm:h-5" />
//                     <span className="text-xs sm:text-sm font-medium">Live Session</span>
//                   </div>
//                 </div>
//                 <SongSearch organizationId={organizationId} onSongPlay={handleSongPlay} />
//               </div>
//             )}
//             {activeTab === 'leaderboard' && (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Music Queue</h1>
//                     <p className="text-gray-400 text-sm sm:text-base">Vote for your favorite tracks</p>
//                   </div>
//                 </div>
//                 <Leaderboard organizationId={organizationId} refreshTrigger={refreshTrigger} userId={userId || ''} emitSongVoted={emitSongVoted} emitSongBoosted={emitSongBoosted} isAdmin={role === "ADMIN"} currentPlayingSongId={currentSong?.id} />
//               </div>
//             )}
//             {role === "ADMIN" && activeTab === 'qr' && (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">QR Code Access</h1>
//                     <p className="text-gray-400 text-sm sm:text-base">Share this QR code for guests to join</p>
//                   </div>
//                 </div>
//                 <GenerateQr organizationId={organizationId} />
//               </div>
//             )}
//             {role === "ADMIN" && activeTab === 'setting' && (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Venue Settings</h1>
//                     <p className="text-gray-400 text-sm sm:text-base">Configure your venue preferences</p>
//                   </div>
//                 </div>
//                 <VenueSettings id={organizationId || ""} />
//               </div>
//             )}
//             {activeTab === 'nowPlaying' && (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Now Playing</h1>
//                     <p className="text-gray-400 text-sm sm:text-base">Currently playing track</p>
//                   </div>
//                   <div className="flex items-center space-x-2 text-green-400">
//                     <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                     <span className="text-xs sm:text-sm font-medium">Live</span>
//                   </div>
//                 </div>
//                 <NowPlaying song={currentSong} audioRef={audioRef} setSong={setCurrentSong} isDJ={role === "ADMIN"} onSkip={fetchLeaderboard} emitPlaybackUpdate={emitNowPlayingUpdated} onPlaybackUpdate={onNowPlayingUpdated} offPlaybackUpdate={offNowPlayingUpdated} emitSkipSong= {emitSkipSong} onSkipSong={onSkipSong} offSkipSong={offSkipSong} organizationId={organizationId}/>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Global Audio Player */}
//       {currentSong && (
//         <audio
//           ref={audioRef}
//           autoPlay
//           onEnded={handleSongEnd}
//           hidden
//         />
//       )}
//     </div>
//   );
// }
// 'use client';
// import React, { useRef, useState, useEffect } from 'react';
// import { Music, QrCode, BarChart3, Headphones, MessageCircleCodeIcon, Settings2Icon, Home, Search, Radio, Waves, Mic2 } from 'lucide-react';
// import SongSearch from './SongSearch';
// import Leaderboard from './Leaderboard';
// import GenerateQr from './GenerateQr';
// import { Song } from '@/lib/song';
// import NowPlaying from './NowPlaying';
// import { LeaderboardService } from '@/lib/services/leaderboard';
// import { useSocket } from '@/hooks/useSocket';
// import { useCurrentUser } from '@/hooks/useCurrentUser';
// import { addSongToOrg } from '@/lib/features/addSong';
// import SpecialRequests from './SpecialRequests';
// import {  useDjAvailability} from '@/lib/features/useDjAvailable';
// import { useNowPlayingStore } from '@/lib/stores/nowPlayingStore';
// import { getOrganizationName } from '@/lib/features/getOrganizationName';
// import VenueSettings from './VenueSettings';

// interface PubDashboardProps {
//   organizationId: string;
// }

// export default function PubDashboard({ organizationId }: PubDashboardProps) {
//   const user = useCurrentUser();
//   const userId = user?.userId;
//   const role = user?.role;
//   const [activeTab, setActiveTab] = useState<'search' | 'leaderboard' | 'request' | 'qr' | 'nowPlaying' | 'setting'>('search');
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const { currentSong, setCurrentSong, audioRef } = useNowPlayingStore();
//   const { djAvailable, loading } = useDjAvailability(organizationId);

//   const {
//     emitSongPlayed,
//     emitSongBoosted,
//     emitSongVoted,
//     emitSpecialRequest,
//     emitLeaderboardUpdated,
//     emitNowPlayingUpdated,
//     emitSkipSong,
//     onLeaderboardUpdated,
//     onSongPlayed,
//     offSongPlayed,
//     offLeaderboardUpdated,
//     onSongVoted,
//     offSongVoted,
//     onSongBoosted,
//     offSongBoosted,
//     onSpecialRequest,
//     offSpecialRequest,
//     onNowPlayingUpdated,
//     offNowPlayingUpdated,
//     onSkipSong,
//     offSkipSong,
//   } = useSocket(organizationId, userId ?? '');
//   const [organizationName, setOrganizationName] = useState<string>("");

//   useEffect(() => {
//     async function fetchOrgName() {
//       try {
//         const name = await getOrganizationName.getOrganizationName(organizationId);
//         setOrganizationName(name);
//       } catch (error) {
//         console.error("Failed to fetch organization name", error);
//       }
//     }

//     fetchOrgName();
//   }, [organizationId]);

//   useEffect(() => {
//     if (!userId) return;

//     async function fetchLeaderboard() {
//       const leaderboard = await LeaderboardService.getLeaderboard(organizationId, userId as string);
//       if (leaderboard.length > 0) {
//         const topSong = leaderboard[0].song;
//         if (!currentSong || currentSong.id !== topSong.id || currentSong.downloadUrl !== topSong.downloadUrl) {
//           setCurrentSong(topSong);
//         }
//       }
//     }

//     fetchLeaderboard();
//   }, [refreshTrigger, organizationId, userId, currentSong, setCurrentSong]);

//   const handleSongPlay = async (song: Song) => {
//     const result = await addSongToOrg({
//       organizationId,
//       token: user?.token || '', 
//       song: {
//         ...song,
//         duration: Number(song.duration),
//         downloadUrl: song.downloadUrl || '',
//       },
//     });
//       if (!result.success) {
//       const errorNotification = document.createElement('div');
//       errorNotification.className =
//         'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
//       errorNotification.innerHTML = `
//         <div class="flex items-center">
//           <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M18 10A8 8 0 11.001 9.999 8 8 0 0118 10zm-9-4a1 1 0 012 0v4a1 1 0 11-2 0V6zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd"></path>
//           </svg>
//           ${result.message}
//         </div>
//       `;
//       document.body.appendChild(errorNotification);

//       setTimeout(() => {
//         errorNotification.style.transform = 'translateX(100%)';
//         setTimeout(() => document.body.removeChild(errorNotification), 300);
//       }, 3000);
//       return; 
//     }

//     const notification = document.createElement('div');
//     notification.className =
//       'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
//     notification.innerHTML = `
//       <div class="flex items-center">
//         <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//         </svg>
//         Added "${song.name}" to queue!
//       </div>
//     `;
//     document.body.appendChild(notification);

//     setTimeout(() => {
//       notification.style.transform = 'translateX(100%)';
//       setTimeout(() => document.body.removeChild(notification), 300);
//     }, 3000);

//     LeaderboardService.addSongPlay(organizationId, song);
//     emitSongPlayed({ songId: song.id, userId, organizationId });
//     emitLeaderboardUpdated({ song, userId, organizationId });

//     if (!currentSong || currentSong.id !== song.id) {
//       setCurrentSong(song);
//     }

//     setRefreshTrigger((prev) => prev + 1);
//   };


//   useEffect(() => {
//     const handleLeaderboardUpdate = (data: { song: Song; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       LeaderboardService.addSongPlay(data.organizationId, data.song);
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onLeaderboardUpdated(handleLeaderboardUpdate);
//     return () => {
//       offLeaderboardUpdated(handleLeaderboardUpdate);
//     };
//   }, [onLeaderboardUpdated, offLeaderboardUpdated, userId]);

//   useEffect(() => {
//     const handleBroadcast = (data: { songId: string; userId: string }) => {
//       if (data.userId === userId) return;
//     };

//     onSongPlayed(handleBroadcast);
//     return () => {
//       offSongPlayed(handleBroadcast);
//     };
//   }, [onSongPlayed, offSongPlayed, userId]);

//   useEffect(() => {
//     const handleSongVoted = async (data: { songId: string; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onSongVoted(handleSongVoted);
//     return () => {
//       offSongVoted(handleSongVoted);
//     };
//   }, [onSongVoted, offSongVoted, userId]);

//   useEffect(() => {
//     const handleSongBoosted = async (data: { songId: string; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onSongBoosted(handleSongBoosted);
//     return () => {
//       offSongBoosted(handleSongBoosted);
//     };
//   }, [onSongBoosted, offSongBoosted, userId]);

//   const fetchLeaderboard = async () => {
//     if (!currentSong) return;
//     await LeaderboardService.removeSongFromLeaderboard(organizationId, currentSong.id);
    
//     const updated = await LeaderboardService.getLeaderboard(organizationId, userId as string);
//     if (updated.length > 0) {
//       setCurrentSong(updated[0].song);
//       emitSkipSong(updated[0].song);
//     } else {
//       setCurrentSong(null);
//     }
//     setRefreshTrigger((prev) => prev + 1);
//   };

//   const handleSongEnd = () => {
//     if (djAvailable) {
//       fetchLeaderboard(); 
//     }
//   };

//   const tabs = [
//     { id: 'search' as const, label: 'Search', icon: Search },
//     { id: 'leaderboard' as const, label: 'Queue', icon: BarChart3 },
//     { id: 'nowPlaying' as const, label: 'Now Playing', icon: Radio },
//     { id: 'qr' as const, label: 'QR Code', icon: QrCode },
//     { id: 'setting' as const, label: 'Settings', icon: Settings2Icon},
//   ];
//   const visibleTabs = role === 'ADMIN' ? tabs : tabs.filter(tab => tab.id !== 'qr' && tab.id !== 'setting');

//   return (
//     <div className="min-h-screen bg-black text-white flex flex-col">
//       {/* Desktop Sidebar */}
//       <div className="hidden lg:flex flex-col w-64 bg-black border-r border-gray-800 fixed h-full top-0 left-0">
//         <div className="p-6">
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//               <Music className="w-5 h-5 text-black" />
//             </div>
//             <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//               Meri Dhun
//             </span>
//           </div>
//         </div>

//         <nav className="flex-1 px-6 overflow-y-auto">
//           <div className="space-y-2">
//             <div className="flex items-center space-x-3 px-4 py-2 text-gray-400 text-sm font-medium">
//               <Home className="w-4 h-4" />
//               <span>MENU</span>
//             </div>
//             {visibleTabs.map((tab) => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
//                     activeTab === tab.id 
//                       ? 'bg-gray-800 text-white shadow-lg' 
//                       : 'text-gray-400 hover:text-white hover:bg-gray-900'
//                   }`}
//                 >
//                   <Icon className="w-5 h-5" />
//                   <span>{tab.label}</span>
//                 </button>
//               );
//             })}
//           </div>

//           <div className="mt-8 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
//             <div className="flex items-center space-x-2 mb-2">
//               <Mic2 className="w-4 h-4 text-green-400" />
//               <h3 className="text-sm font-semibold text-gray-300">Current Venue</h3>
//             </div>
//             <p className="text-lg font-bold text-white truncate">{organizationName}</p>
//             <div className="flex items-center space-x-1 mt-2">
//               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//               <span className="text-xs text-green-400">Live</span>
//             </div>
//           </div>
//         </nav>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 lg:ml-64 flex flex-col">
//         {/* Mobile Header */}
//         <div className="lg:hidden bg-black p-4 sticky top-0 z-10">
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//               <Music className="w-5 h-5 text-black" />
//             </div>
//             <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//               Meri Dhun
//             </span>
//           </div>
//         </div>

//         {/* Mobile Top Navigation */}
//         <div className="lg:hidden sticky top-[4.5rem] z-10 w-full px-4 py-2 bg-black border-b border-gray-800">
//           <div className="flex flex-wrap justify-center gap-2">
//             {visibleTabs.map((tab) => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
//                     activeTab === tab.id 
//                       ? 'bg-gray-800 text-white shadow-lg border border-gray-700' 
//                       : 'text-gray-400 hover:text-white hover:bg-gray-900'
//                   }`}
//                 >
//                   <Icon className="w-4 h-4" />
//                   <span>{tab.label}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
        
//         {/* Content Area */}
//         <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
//           <div className="p-4 md:p-6">
//             {activeTab === 'search' && (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Search Music</h1>
//                     <p className="text-gray-400 text-sm sm:text-base">Discover and add songs to the queue</p>
//                   </div>
//                   <div className="flex items-center space-x-2 text-green-400">
//                     <Waves className="w-4 h-4 sm:w-5 sm:h-5" />
//                     <span className="text-xs sm:text-sm font-medium">Live Session</span>
//                   </div>
//                 </div>
//                 <SongSearch organizationId={organizationId} onSongPlay={handleSongPlay} />
//               </div>
//             )}
//             {activeTab === 'leaderboard' && (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Music Queue</h1>
//                     <p className="text-gray-400 text-sm sm:text-base">Vote for your favorite tracks</p>
//                   </div>
//                 </div>
//                 <Leaderboard organizationId={organizationId} refreshTrigger={refreshTrigger} userId={userId || ''} emitSongVoted={emitSongVoted} emitSongBoosted={emitSongBoosted} isAdmin={role === "ADMIN"} currentPlayingSongId={currentSong?.id} />
//               </div>
//             )}
//             {role === "ADMIN" && activeTab === 'qr' && (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">QR Code Access</h1>
//                     <p className="text-gray-400 text-sm sm:text-base">Share this QR code for guests to join</p>
//                   </div>
//                 </div>
//                 <GenerateQr organizationId={organizationId} />
//               </div>
//             )}
//             {role === "ADMIN" && activeTab === 'setting' && (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Venue Settings</h1>
//                     <p className="text-gray-400 text-sm sm:text-base">Configure your venue preferences</p>
//                   </div>
//                 </div>
//                 <VenueSettings id={organizationId || ""} />
//               </div>
//             )}
//             {activeTab === 'nowPlaying' && (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Now Playing</h1>
//                     <p className="text-gray-400 text-sm sm:text-base">Currently playing track</p>
//                   </div>
//                   <div className="flex items-center space-x-2 text-green-400">
//                     <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                     <span className="text-xs sm:text-sm font-medium">Live</span>
//                   </div>
//                 </div>
//                 <NowPlaying song={currentSong} audioRef={audioRef} setSong={setCurrentSong} isDJ={role === "ADMIN"} onSkip={fetchLeaderboard} emitPlaybackUpdate={emitNowPlayingUpdated} onPlaybackUpdate={onNowPlayingUpdated} offPlaybackUpdate={offNowPlayingUpdated} emitSkipSong= {emitSkipSong} onSkipSong={onSkipSong} offSkipSong={offSkipSong} organizationId={organizationId}/>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Global Audio Player */}
//       {currentSong && (
//         <audio
//           ref={audioRef}
//           autoPlay
//           onEnded={handleSongEnd}
//           hidden
//         />
//       )}
//     </div>
//   );
// }
// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import { Music, QrCode, BarChart3, Settings2Icon, Home, Search, Radio, Waves, Mic2 } from 'lucide-react';
// import SongSearch from './SongSearch';
// import Leaderboard from './Leaderboard';
// import GenerateQr from './GenerateQr';
// import { Song } from '@/lib/song';
// import NowPlaying from './NowPlaying';
// import { LeaderboardService } from '@/lib/services/leaderboard';
// import { useSocket } from '@/hooks/useSocket';
// import { useCurrentUser } from '@/hooks/useCurrentUser';
// import { addSongToOrg } from '@/lib/features/addSong';

// import {  useDjAvailability} from '@/lib/features/useDjAvailable';
// import { useNowPlayingStore } from '@/lib/stores/nowPlayingStore';
// import { getOrganizationName } from '@/lib/features/getOrganizationName';
// import VenueSettings from './VenueSettings';
// import { updateNowPlayingState,getNowPlayingState } from '@/lib/features/nowPlayingState';
// import { fetchSongDetails } from '@/lib/features/getSong';
// interface PubDashboardProps {
//   organizationId: string;
// }
// export async function updateNowPlayingWithQueue(organizationId: string, oldSongId?: string | null, userId?: string | null): Promise<Song | null> {
//     // 1. If an old song exists, remove it from the leaderboard (if not already handled)
//     if (oldSongId) {
//         await LeaderboardService.removeSongFromLeaderboard(organizationId, oldSongId);
//     }
//     console.log("update",organizationId,oldSongId);
//     // 2. Get the new leaderboard
//     const leaderboard = await LeaderboardService.getLeaderboard(organizationId, userId as string); // Using a server-side userId
//     console.log(leaderboard);
//     const nextSong = leaderboard[0]?.song || null;
//     console.log(nextSong);
//     // 3. Update the backend state with the next song
//     const newSongId = nextSong ? nextSong.id : null;
//     await updateNowPlayingState(organizationId, newSongId);

//     return nextSong;
// }

// // 'use client';
// // import React, { useRef, useState, useEffect } from 'react';
// // import { Music, QrCode, BarChart3, Headphones, MessageCircleCodeIcon, Settings2Icon, Home, Search, Library, Plus, Mic2, Radio, Waves } from 'lucide-react';
// // import SongSearch from './SongSearch';
// // import Leaderboard from './Leaderboard';
// // import GenerateQr from './GenerateQr';
// // import { Song } from '@/lib/song';
// // import NowPlaying from './NowPlaying';
// // import { LeaderboardService } from '@/lib/services/leaderboard';
// // import { useSocket } from '@/hooks/useSocket';
// // import { useCurrentUser } from '@/hooks/useCurrentUser';
// // import { addSongToOrg } from '@/lib/features/addSong';
// // import SpecialRequests from './SpecialRequests';
// // import {  useDjAvailability} from '@/lib/features/useDjAvailable';
// // import { useNowPlayingStore } from '@/lib/stores/nowPlayingStore';
// // import { getOrganizationName } from '@/lib/features/getOrganizationName';
// // import VenueSettings from './VenueSettings';

// // interface PubDashboardProps {
// //   organizationId: string;
// // }

// export default function PubDashboard({ organizationId }: PubDashboardProps) {
//   const user = useCurrentUser();
//   const userId = user?.userId;
//   const role = user?.role;
//   const [activeTab, setActiveTab] = useState<'search' | 'leaderboard' | 'request' | 'qr' | 'nowPlaying' | 'setting'>('search');
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const { currentSong, setCurrentSong, audioRef } = useNowPlayingStore();
//   const { djAvailable, loading } = useDjAvailability(organizationId);

//   const {
//     emitSongPlayed,
//     emitSongBoosted,
//     emitSongVoted,
//     emitSpecialRequest,
//     emitLeaderboardUpdated,
//     emitNowPlayingUpdated,
//     emitSkipSong,
//     onLeaderboardUpdated,
//     onSongPlayed,
//     offSongPlayed,
//     offLeaderboardUpdated,
//     onSongVoted,
//     offSongVoted,
//     onSongBoosted,
//     offSongBoosted,
//     onSpecialRequest,
//     offSpecialRequest,
//     emitUpdateSong,
//     onUpdateSong,
//     offUpdateSong,
//     onNowPlayingUpdated,
//     offNowPlayingUpdated,
//     onSkipSong,
//     offSkipSong,
//   } = useSocket(organizationId, userId ?? '');
//   const [organizationName, setOrganizationName] = useState<string>("");
  
//   // Centralized function to fetch the next song, update the backend, and emit to all clients
//   const fetchAndUpdateNowPlaying = useCallback(async () => {
//     if (role !== "ADMIN") return;

//     const nextSong = await updateNowPlayingWithQueue(organizationId, currentSong?.id,userId);
//     setCurrentSong(nextSong);
    
//     // Emit the update to all clients
//     emitUpdateSong({ songId: nextSong?.id || null, userId, organizationId });

//   }, [ role, organizationId, currentSong, setCurrentSong, userId, emitUpdateSong]);


//   // 1. New useEffect: Handle initial load for ADMIN to start playback if nothing is playing
//   useEffect(() => {
//     async function fetchInitialState() {
//       // Fetch the current playing state from the backend
//       const { nowPlayingState } = await getNowPlayingState(organizationId);
      
//       // If no song is playing initially, and the user is an ADMIN, start playing the next song from the queue.
//       if (role === "ADMIN" && !nowPlayingState?.currentSong) {
//         fetchAndUpdateNowPlaying();
//       } else if (nowPlayingState?.currentSong) {
//         // If a song is already playing, set it in the local state for all users
//         setCurrentSong(nowPlayingState.currentSong);
//       }
//     }
//     fetchInitialState();
//   }, [organizationId, role, fetchAndUpdateNowPlaying, setCurrentSong]);


//   // 2. New useEffect: Listen for updates from other clients for non-admin users
//   useEffect(() => {
//     if (role === "ADMIN") {
//       // Admins don't need to listen for this, they initiate the changes
//       return; 
//     }

//     const handleNowPlayingUpdate = async ({ songId }: { songId: string | null; userId: string; organizationId: string }) => {
//       if (songId) {
//         try {
//           const songDetails = await fetchSongDetails(organizationId,songId);
//           setCurrentSong(songDetails);
//         } catch (error) {
//           console.error("Failed to fetch song details for now playing update", error);
//           setCurrentSong(null);
//         }
//       } else {
//         setCurrentSong(null);
//       }
//     };

//     onUpdateSong(handleNowPlayingUpdate);

//     return () => {
//       offUpdateSong(handleNowPlayingUpdate);
//     };
//   }, [onUpdateSong, offUpdateSong, setCurrentSong, role, organizationId]);
  

//   useEffect(() => {
//     async function fetchOrgName() {
//       try {
//         const name = await getOrganizationName.getOrganizationName(organizationId);
//         setOrganizationName(name);
//       } catch (error) {
//         console.error("Failed to fetch organization name", error);
//       }
//     }

//     fetchOrgName();
//   }, [organizationId]);

//   useEffect(() => {
//     if (!userId) return;

//     async function fetchLeaderboard() {
//       const leaderboard = await LeaderboardService.getLeaderboard(organizationId, userId as string);
//       if (leaderboard.length > 0) {
//         const topSong = leaderboard[0].song;
//         if (!currentSong || currentSong.id !== topSong.id || currentSong.downloadUrl !== topSong.downloadUrl) {
//           setCurrentSong(topSong);
//         }
//       }
//     }

//     fetchLeaderboard();
//   }, [refreshTrigger, organizationId, userId]);

//   const handleSongPlay = async (song: Song) => {
//     const result = await addSongToOrg({
//       organizationId,
//       token: user?.token || '', 
//       song: {
//         ...song,
//         duration: Number(song.duration),
//         downloadUrl: song.downloadUrl || '',
//       },
//     });
//       if (!result.success) {
//       // 🔴 Show error notification
//       const errorNotification = document.createElement('div');
//       errorNotification.className =
//         'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
//       errorNotification.innerHTML = `
//         <div class="flex items-center">
//           <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M18 10A8 8 0 11.001 9.999 8 8 0 0118 10zm-9-4a1 1 0 012 0v4a1 1 0 11-2 0V6zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd"></path>
//           </svg>
//           ${result.message}
//         </div>
//       `;
//       document.body.appendChild(errorNotification);

//       setTimeout(() => {
//         errorNotification.style.transform = 'translateX(100%)';
//         setTimeout(() => document.body.removeChild(errorNotification), 300);
//       }, 3000);
//       return; // ❌ Stop here, don't proceed with success actions
//     }

//     // ✅ Show success notification
//     const notification = document.createElement('div');
//     notification.className =
//       'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
//     notification.innerHTML = `
//       <div class="flex items-center">
//         <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//         </svg>
//         Added "${song.name}" to queue!
//       </div>
//     `;
//     document.body.appendChild(notification);

//     setTimeout(() => {
//       notification.style.transform = 'translateX(100%)';
//       setTimeout(() => document.body.removeChild(notification), 300);
//     }, 3000);

//     // Rest of your success logic
//     LeaderboardService.addSongPlay(organizationId, song);
//     emitSongPlayed({ songId: song.id, userId, organizationId });
//     emitLeaderboardUpdated({ song, userId, organizationId });

//     if (!currentSong || currentSong.id !== song.id) {
//       setCurrentSong(song);
//     }

//     setRefreshTrigger((prev) => prev + 1);
//   };


//   useEffect(() => {
//     const handleLeaderboardUpdate = (data: { song: Song; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       LeaderboardService.addSongPlay(data.organizationId, data.song);
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onLeaderboardUpdated(handleLeaderboardUpdate);
//     return () => {
//       offLeaderboardUpdated(handleLeaderboardUpdate);
//     };
//   }, [onLeaderboardUpdated, offLeaderboardUpdated, userId]);

//   useEffect(() => {
//     const handleBroadcast = (data: { songId: string; userId: string }) => {
//       if (data.userId === userId) return;
//     };

//     onSongPlayed(handleBroadcast);
//     return () => {
//       offSongPlayed(handleBroadcast);
//     };
//   }, [onSongPlayed, offSongPlayed, userId]);

//   useEffect(() => {
//     const handleSongVoted = async (data: { songId: string; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onSongVoted(handleSongVoted);
//     return () => {
//       offSongVoted(handleSongVoted);
//     };
//   }, [onSongVoted, offSongVoted, userId]);

//   useEffect(() => {
//     const handleSongBoosted = async (data: { songId: string; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onSongBoosted(handleSongBoosted);
//     return () => {
//       offSongBoosted(handleSongBoosted);
//     };
//   }, [onSongBoosted, offSongBoosted, userId]);

//   const fetchLeaderboard = async () => {
//     if (!currentSong) return;
//     await LeaderboardService.removeSongFromLeaderboard(organizationId, currentSong.id);
    
//     const updated = await LeaderboardService.getLeaderboard(organizationId, userId as string);
//     if (updated.length > 0) {
//       setCurrentSong(updated[0].song);
//       emitSkipSong(updated[0].song);
//     } else {
//       setCurrentSong(null);
//     }
//     setRefreshTrigger((prev) => prev + 1);
//   };

//   const handleSongEnd = () => {
//     if (djAvailable) {
//       fetchLeaderboard(); 
//     }
//   };

//   const tabs = [
//     { id: 'search' as const, label: 'Search', icon: Search },
//     { id: 'leaderboard' as const, label: 'Queue', icon: BarChart3 },
//     { id: 'nowPlaying' as const, label: 'Now Playing', icon: Radio },
//    // { id: 'request' as const, label: 'Requests', icon: MessageCircleCodeIcon },
//     { id: 'qr' as const, label: 'QR Code', icon: QrCode },
//     { id: 'setting' as const, label: 'Settings', icon: Settings2Icon},
//   ];
//   const visibleTabs = role === 'ADMIN' ? tabs : tabs.filter(tab => tab.id !== 'qr' && tab.id !== 'setting');

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Spotify-like Layout */}
//       <div className="flex h-screen">
//         {/* Sidebar - Desktop */}
//         <div className="hidden lg:flex flex-col w-64 bg-black border-r border-gray-800">
//           {/* Logo */}
//           <div className="p-6">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//                 <Music className="w-5 h-5 text-black" />
//               </div>
//               <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//                 Meri Dhun
//               </span>
//             </div>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-6">
//             <div className="space-y-2">
//               <div className="flex items-center space-x-3 px-4 py-2 text-gray-400 text-sm font-medium">
//                 <Home className="w-4 h-4" />
//                 <span>MENU</span>
//               </div>
//               {visibleTabs.map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
//                       activeTab === tab.id 
//                         ? 'bg-gray-800 text-white shadow-lg' 
//                         : 'text-gray-400 hover:text-white hover:bg-gray-900'
//                     }`}
//                   >
//                     <Icon className="w-5 h-5" />
//                     <span>{tab.label}</span>
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Organization Info */}
//             <div className="mt-8 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
//               <div className="flex items-center space-x-2 mb-2">
//                 <Mic2 className="w-4 h-4 text-green-400" />
//                 <h3 className="text-sm font-semibold text-gray-300">Current Venue</h3>
//               </div>
//               <p className="text-lg font-bold text-white truncate">{organizationName}</p>
//               <div className="flex items-center space-x-1 mt-2">
//                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                 <span className="text-xs text-green-400">Live</span>
//               </div>
//             </div>
//           </nav>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 flex flex-col">
//           {/* Mobile Header */}
//           <div className="lg:hidden bg-black border-b border-gray-800 p-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//                   <Music className="w-5 h-5 text-black" />
//                 </div>
//                 <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//                   Meri Dhun
//                 </span>
//               </div>
//             </div>
            
//             {/* Mobile Tab Navigation */}
//             <div className="flex space-x-1 mt-4 overflow-x-auto pb-2">
//               {visibleTabs.map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
//                       activeTab === tab.id 
//                         ? 'bg-green-500 text-black shadow-lg' 
//                         : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//                     }`}
//                   >
//                     <Icon className="w-4 h-4" />
//                     <span className="text-sm">{tab.label}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Content Area */}
//           <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
//             <div className="p-6">
//               {activeTab === 'search' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Search Music</h1>
//                       <p className="text-gray-400">Discover and add songs to the queue</p>
//                     </div>
//                     <div className="flex items-center space-x-2 text-green-400">
//                       <Waves className="w-5 h-5" />
//                       <span className="text-sm font-medium">Live Session</span>
//                     </div>
//                   </div>
//                   <SongSearch organizationId={organizationId} onSongPlay={handleSongPlay} />
//                 </div>
//               )}
//               {activeTab === 'leaderboard' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Music Queue</h1>
//                       <p className="text-gray-400">Vote for your favorite tracks</p>
//                     </div>
//                   </div>
//                   <Leaderboard organizationId={organizationId} refreshTrigger={refreshTrigger} userId={userId || ''} emitSongVoted={emitSongVoted} emitSongBoosted={emitSongBoosted} isAdmin={role === "ADMIN"} currentPlayingSongId={currentSong?.id} />
//                 </div>
//               )}
//               {/* {activeTab === 'request' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Special Requests</h1>
//                       <p className="text-gray-400">Make dedications and special announcements</p>
//                     </div>
//                   </div>
//                   <SpecialRequests organizationId={organizationId} userId={userId || ''} isDjMode={role === "ADMIN"} emitSpecialRequest={emitSpecialRequest} onSpecialRequest={onSpecialRequest} offSpecialRequest={offSpecialRequest}/>
//                 </div>
//               )} */}
//               {role === "ADMIN" && activeTab === 'qr' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">QR Code Access</h1>
//                       <p className="text-gray-400">Share this QR code for guests to join</p>
//                     </div>
//                   </div>
//                   <GenerateQr organizationId={organizationId} />
//                 </div>
//               )}
//               {role === "ADMIN" && activeTab === 'setting' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Venue Settings</h1>
//                       <p className="text-gray-400">Configure your venue preferences</p>
//                     </div>
//                   </div>
//                   <VenueSettings id={organizationId || ""} />
//                 </div>
//               )}
//               {activeTab === 'nowPlaying' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Now Playing</h1>
//                       <p className="text-gray-400">Currently playing track</p>
//                     </div>
//                     <div className="flex items-center space-x-2 text-green-400">
//                       <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                       <span className="text-sm font-medium">Live</span>
//                     </div>
//                   </div>
//                   <NowPlaying song={currentSong} audioRef={audioRef} setSong={setCurrentSong} isDJ={role === "ADMIN"} onSkip={fetchLeaderboard} emitPlaybackUpdate={emitNowPlayingUpdated} onPlaybackUpdate={onNowPlayingUpdated} offPlaybackUpdate={offNowPlayingUpdated} organizationId={organizationId}/>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Global Audio Player */}
//       {currentSong && (
//         <audio
//           ref={audioRef}
//           autoPlay
//           onEnded={handleSongEnd}
//           hidden
//         />
//       )}
//     </div>
//   );
// // }
'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Music, QrCode, BarChart3, Settings2Icon, Home, Search, Radio, Waves, Mic2 } from 'lucide-react';
import SongSearch from './SongSearch';
import Leaderboard from './Leaderboard';
import GenerateQr from './GenerateQr';
import { Song } from '@/lib/song';
import NowPlaying from './NowPlaying';
import { LeaderboardService } from '@/lib/services/leaderboard';
import { useSocket } from '@/hooks/useSocket';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { addSongToOrg } from '@/lib/features/addSong';
import { useNowPlayingStore } from '@/lib/stores/nowPlayingStore';
import { getOrganizationName } from '@/lib/features/getOrganizationName';
import VenueSettings from './VenueSettings';
import { updateNowPlayingState, getNowPlayingState } from '@/lib/features/nowPlayingState';
import { fetchSongDetails } from '@/lib/features/getSong';

interface PubDashboardProps {
  organizationId: string;
}

export async function updateNowPlayingWithQueue(organizationId: string, oldSongId?: string | null, userId?: string | null): Promise<Song | null> {
    if (oldSongId) {
        await LeaderboardService.removeSongFromLeaderboard(organizationId, oldSongId);
    }
    const leaderboard = await LeaderboardService.getLeaderboard(organizationId, userId as string);
    const nextSong = leaderboard[0]?.song || null;
    const newSongId = nextSong ? nextSong.id : null;
    await updateNowPlayingState(organizationId, newSongId);

    return nextSong;
}

export default function PubDashboard({ organizationId }: PubDashboardProps) {
  const user = useCurrentUser();
  const userId = user?.userId;
  const role = user?.role;
  const [activeTab, setActiveTab] = useState<'search' | 'leaderboard' | 'request' | 'qr' | 'nowPlaying' | 'setting'>('search');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { currentSong, setCurrentSong, audioRef } = useNowPlayingStore();
  const isInitialLoad = useRef(true);
  const {
    emitSongPlayed,
    emitSongBoosted,
    emitSongVoted,
    emitNowPlayingUpdated,
    onLeaderboardUpdated,
    onSongPlayed,
    offSongPlayed,
    offLeaderboardUpdated,
    onSongVoted,
    offSongVoted,
    onSongBoosted,
    offSongBoosted,
    emitUpdateSong,
    onUpdateSong,
    offUpdateSong,
    onNowPlayingUpdated,
    offNowPlayingUpdated,
  } = useSocket(organizationId, userId ?? '');
  const [organizationName, setOrganizationName] = useState<string>("");
  
  // FIX: This function should not be in the dependency array of the useEffect that causes the loop.
  // We keep it memoized, but call it manually.
  const fetchAndUpdateNowPlaying = useCallback(async () => {
    if (role !== "ADMIN") return;
    
    console.log("Fetching and updating now playing song...");
    const nextSong = await updateNowPlayingWithQueue(organizationId, currentSong?.id, userId);
    console.log("Next song",nextSong);
    setCurrentSong(nextSong);
    
    emitUpdateSong({ songId: nextSong?.id || null, userId, organizationId });

  }, [role, organizationId, currentSong, setCurrentSong, userId, emitUpdateSong]);

  // FIX: Separate the initial state logic into its own useEffect with a tight dependency array.
  useEffect(() => {
    async function fetchInitialState() {
      if (!isInitialLoad.current) return;
      isInitialLoad.current = false;

      const { nowPlayingState } = await getNowPlayingState(organizationId);
      
      if (role === "ADMIN" && !nowPlayingState?.currentSong) {
        // If no song is playing initially, and the user is an ADMIN,
        // we should check the leaderboard for a song to play.
        const leaderboard = await LeaderboardService.getLeaderboard(organizationId, userId as string);
        const nextSong = leaderboard[0]?.song || null;
        if(nextSong) {
          setCurrentSong(nextSong);
          await updateNowPlayingState(organizationId, nextSong.id);
        }
      } else if (nowPlayingState?.currentSong) {
        setCurrentSong(nowPlayingState.currentSong);
      }
    }
    fetchInitialState();
    
    // The empty dependency array ensures this effect runs only ONCE on mount.
  }, [organizationId, role, setCurrentSong, userId]);


  // Listen for updates from other clients for non-admin users
  useEffect(() => {
    if (role === "ADMIN") {
      return; 
    }

    const handleNowPlayingUpdate = async ({ songId }: { songId: string | null; userId: string; organizationId: string }) => {
      if (songId) {
        try {
          const songDetails = await fetchSongDetails(organizationId, songId);
          console.log("Received from server: ",songDetails);
          setCurrentSong(songDetails);
        } catch (error) {
          console.error("Failed to fetch song details for now playing update", error);
          setCurrentSong(null);
        }
      } else {
        setCurrentSong(null);
      }
      setRefreshTrigger((prev) => prev + 1);
    };

    onUpdateSong(handleNowPlayingUpdate);

    return () => {
      offUpdateSong(handleNowPlayingUpdate);
    };
  }, [onUpdateSong, offUpdateSong, setCurrentSong, role, organizationId]);
  

  useEffect(() => {
    async function fetchOrgName() {
      try {
        const name = await getOrganizationName.getOrganizationName(organizationId);
        setOrganizationName(name);
      } catch (error) {
        console.error("Failed to fetch organization name", error);
      }
    }
    fetchOrgName();
  }, [organizationId]);

  const handleSongPlay = async (song: Song) => {
    const result = await addSongToOrg({
      organizationId,
      token: user?.token || '', 
      song: {
        ...song,
        duration: Number(song.duration),
        downloadUrl: song.downloadUrl || '',
      },
    });
    if (!result.success) {
      // 🔴 Show error notification
      const errorNotification = document.createElement('div');
      errorNotification.className =
        'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
      errorNotification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10A8 8 0 11.001 9.999 8 8 0 0118 10zm-9-4a1 1 0 012 0v4a1 1 0 11-2 0V6zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd"></path>
          </svg>
          ${result.message}
        </div>
      `;
      document.body.appendChild(errorNotification);

      setTimeout(() => {
        errorNotification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(errorNotification), 300);
      }, 3000);
      return;
    }

    // ✅ Show success notification
    const notification = document.createElement('div');
    notification.className =
      'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        Added "${song.name}" to queue!
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);

    LeaderboardService.addSongPlay(organizationId, song);
    emitSongPlayed({ songId: song.id, userId, organizationId });
    emitUpdateSong({songId: song.id, userId, organizationId});
    setRefreshTrigger((prev) => prev + 1);
     if (!currentSong) {
      await fetchAndUpdateNowPlaying();
    }
  };


  useEffect(() => {
    const handleLeaderboardUpdate = (data: { song: Song; userId: string; organizationId: string }) => {
      if (data.userId === userId) return;
      LeaderboardService.addSongPlay(data.organizationId, data.song);
      setRefreshTrigger((prev) => prev + 1);
    };

    onLeaderboardUpdated(handleLeaderboardUpdate);
    return () => {
      offLeaderboardUpdated(handleLeaderboardUpdate);
    };
  }, [onLeaderboardUpdated, offLeaderboardUpdated, userId]);

  useEffect(() => {
    const handleBroadcast = (data: { songId: string; userId: string }) => {
      if (data.userId === userId) return;
    };

    onSongPlayed(handleBroadcast);
    return () => {
      offSongPlayed(handleBroadcast);
    };
  }, [onSongPlayed, offSongPlayed, userId]);

  useEffect(() => {
    const handleSongVoted = async (data: { songId: string; userId: string; organizationId: string }) => {
      if (data.userId === userId) return;
      setRefreshTrigger((prev) => prev + 1);
    };

    onSongVoted(handleSongVoted);
    return () => {
      offSongVoted(handleSongVoted);
    };
  }, [onSongVoted, offSongVoted, userId]);

  useEffect(() => {
    const handleSongBoosted = async (data: { songId: string; userId: string; organizationId: string }) => {
      if (data.userId === userId) return;
      setRefreshTrigger((prev) => prev + 1);
    };

    onSongBoosted(handleSongBoosted);
    return () => {
      offSongBoosted(handleSongBoosted);
    };
  }, [onSongBoosted, offSongBoosted, userId]);
  
  const handleSkipSong = () => {
    fetchAndUpdateNowPlaying();
  };

  const tabs = [
    { id: 'search' as const, label: 'Search', icon: Search },
    { id: 'leaderboard' as const, label: 'Queue', icon: BarChart3 },
    { id: 'nowPlaying' as const, label: 'Now Playing', icon: Radio },
    { id: 'qr' as const, label: 'QR Code', icon: QrCode },
    { id: 'setting' as const, label: 'Settings', icon: Settings2Icon },
  ];
  const visibleTabs = role === 'ADMIN' ? tabs : tabs.filter(tab => tab.id !== 'qr' && tab.id !== 'setting');

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        <div className="hidden lg:flex flex-col w-64 bg-black border-r border-gray-800">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
                Meri Dhun
              </span>
            </div>
          </div>
          <nav className="flex-1 px-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3 px-4 py-2 text-gray-400 text-sm font-medium">
                <Home className="w-4 h-4" />
                <span>MENU</span>
              </div>
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === tab.id 
                        ? 'bg-gray-800 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Mic2 className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-semibold text-gray-300">Current Venue</h3>
              </div>
              <p className="text-lg font-bold text-white truncate">{organizationName}</p>
              <div className="flex items-center space-x-1 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Live</span>
              </div>
            </div>
          </nav>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="lg:hidden bg-black border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
                  Meri Dhun
                </span>
              </div>
            </div>
            <div className="flex mt-4 gap-1">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center justify-center px-1 py-2 rounded-lg font-medium whitespace-nowrap transition-all space-y-1 ${
                      activeTab === tab.id 
                        ? 'bg-green-500 text-black shadow-lg' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] leading-none">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
            <div className="p-6">
              {activeTab === 'search' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">Search Music</h1>
                      <p className="text-gray-400">Discover and add songs to the queue</p>
                    </div>
                    <div className="flex items-center space-x-2 text-green-400">
                      <Waves className="w-5 h-5" />
                      <span className="text-sm font-medium">Live Session</span>
                    </div>
                  </div>
                  <SongSearch organizationId={organizationId} onSongPlay={handleSongPlay} />
                </div>
              )}
              {activeTab === 'leaderboard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">Music Queue</h1>
                      <p className="text-gray-400">Vote for your favorite tracks</p>
                    </div>
                  </div>
                  <Leaderboard organizationId={organizationId} refreshTrigger={refreshTrigger} userId={userId || ''} emitSongVoted={emitSongVoted} emitSongBoosted={emitSongBoosted} isAdmin={role === "ADMIN"} currentPlayingSongId={currentSong?.id} />
                </div>
              )}
              {role === "ADMIN" && activeTab === 'qr' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">QR Code Access</h1>
                      <p className="text-gray-400">Share this QR code for guests to join</p>
                    </div>
                  </div>
                  <GenerateQr organizationId={organizationId} />
                </div>
              )}
              {role === "ADMIN" && activeTab === 'setting' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">Venue Settings</h1>
                      <p className="text-gray-400">Configure your venue preferences</p>
                    </div>
                  </div>
                  <VenueSettings id={organizationId || ""} />
                </div>
              )}
              {activeTab === 'nowPlaying' && (
                <div className="space-y-6 ">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">Now Playing</h1>
                      <p className="text-gray-400">Currently playing track</p>
                    </div>
                    <div className="flex items-center space-x-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live</span>
                    </div>
                  </div>
                  <NowPlaying 
                    song={currentSong} 
                    audioRef={audioRef} 
                    setSong={setCurrentSong} 
                    isDJ={role === "ADMIN"} 
                    onSkip={handleSkipSong} 
                    emitPlaybackUpdate={emitNowPlayingUpdated} 
                    onPlaybackUpdate={onNowPlayingUpdated} 
                    offPlaybackUpdate={offNowPlayingUpdated} 
                    organizationId={organizationId}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {currentSong && (
        <audio
          ref={audioRef}
          autoPlay
          onEnded={handleSkipSong}
          hidden
        />
      )}
    </div>
  );
}

// 'use client';
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { Music, QrCode, BarChart3, Settings2Icon, Home, Search, Radio, Waves, Mic2 } from 'lucide-react';
// import SongSearch from './SongSearch';
// import Leaderboard from './Leaderboard';
// import GenerateQr from './GenerateQr';
// import { Song } from '@/lib/song';
// import NowPlaying from './NowPlaying';
// import { LeaderboardService } from '@/lib/services/leaderboard';
// import { useSocket } from '@/hooks/useSocket';
// import { useCurrentUser } from '@/hooks/useCurrentUser';
// import { addSongToOrg } from '@/lib/features/addSong';
// import { useDjAvailability } from '@/lib/features/useDjAvailable';
// import { useNowPlayingStore } from '@/lib/stores/nowPlayingStore';
// import { getOrganizationName } from '@/lib/features/getOrganizationName';
// import VenueSettings from './VenueSettings';
// import { updateNowPlayingState, getNowPlayingState } from '@/lib/features/nowPlayingState';
// import { fetchSongDetails } from '@/lib/features/getSong';

// interface PubDashboardProps {
//   organizationId: string;
// }

// // Centralized function to update the now playing state in the backend.
// // It is no longer part of the component to avoid being recreated on every render.
// export async function updateNowPlayingWithQueue(organizationId: string, oldSongId?: string | null, userId?: string | null): Promise<Song | null> {
//     // 1. If an old song exists, remove it from the leaderboard.
//     if (oldSongId) {
//         await LeaderboardService.removeSongFromLeaderboard(organizationId, oldSongId);
//     }
//     // 2. Get the new leaderboard.
//     const leaderboard = await LeaderboardService.getLeaderboard(organizationId, userId as string);
//     const nextSong = leaderboard[0]?.song || null;
//     // console.log("Next song",nextSong);
//     // 3. Update the backend state with the next song.
//     const newSongId = nextSong ? nextSong.id : null;
//     await updateNowPlayingState(organizationId, newSongId);

//     return nextSong;
// }

// export default function PubDashboard({ organizationId }: PubDashboardProps) {
//   const user = useCurrentUser();
//   const userId = user?.userId;
//   const role = user?.role;
//   const [activeTab, setActiveTab] = useState<'search' | 'leaderboard' | 'request' | 'qr' | 'nowPlaying' | 'setting'>('search');
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const { currentSong, setCurrentSong, audioRef } = useNowPlayingStore();
//   const { djAvailable, loading } = useDjAvailability(organizationId);
//   const isInitialLoad = useRef(true);
//   const [recentSong, setRecentSong] = useState(null);
//   const {
//     emitSongPlayed,
//     emitSongBoosted,
//     emitSongVoted,
//     emitNowPlayingUpdated,
//     onLeaderboardUpdated,
//     onSongPlayed,
//     offSongPlayed,
//     offLeaderboardUpdated,
//     onSongVoted,
//     offSongVoted,
//     onSongBoosted,
//     offSongBoosted,
//     emitUpdateSong,
//     onUpdateSong,
//     offUpdateSong,
//     onNowPlayingUpdated,
//     offNowPlayingUpdated,
//   } = useSocket(organizationId, userId ?? '');
//   const [organizationName, setOrganizationName] = useState<string>("");
  
//   // Centralized function to fetch the next song, update the backend, and emit to all clients.
//   // Memoized with useCallback to prevent unnecessary re-creation.
//   const fetchAndUpdateNowPlaying = useCallback(async () => {
//     if (role !== "ADMIN") return;
    
//     console.log("Fetching and updating now playing song...");
//     const nextSong = await updateNowPlayingWithQueue(organizationId, currentSong?.id, userId);
//     console.log("Next song",nextSong);
//     setCurrentSong(nextSong);
    
//     // Emit the update to all clients
//     emitUpdateSong({ songId: nextSong?.id || null, userId, organizationId });

//   }, [role, organizationId, currentSong, setCurrentSong, userId, emitUpdateSong]);

//   // Use a ref to ensure this effect only runs once on the initial mount for the ADMIN.
//   // This prevents the infinite loop when the queue is empty.
//   // useEffect(() => {
//   //   async function fetchInitialState() {
//   //     // Prevents the hook from running again after the initial render.
//   //     if (!isInitialLoad.current) return;
//   //     isInitialLoad.current = false;

//   //     // Fetch the current playing state from the backend
//   //     const { nowPlayingState } = await getNowPlayingState(organizationId);
      
//   //     if (role === "ADMIN" && !nowPlayingState?.currentSong) {
//   //       // If no song is playing initially, and the user is an ADMIN, start playing the next song from the queue.
//   //       await fetchAndUpdateNowPlaying();
//   //     } else if (nowPlayingState?.currentSong) {
//   //       // If a song is already playing, set it in the local state for all users
        
//   //       setCurrentSong(nowPlayingState.currentSong);
//   //     }
//   //   }
//   //   fetchInitialState();
//   // }, [organizationId, role, setCurrentSong, fetchAndUpdateNowPlaying]);

//     useEffect(() => {
//     async function fetchAndUpdateNowPlaying() {
//         if (role !== "ADMIN") return;
        
//         console.log("Fetching and updating now playing song...");
//         const nextSong = await updateNowPlayingWithQueue(organizationId, currentSong?.id, userId);
//         console.log("Next song",nextSong);
//         setCurrentSong(nextSong);
        
//         // Emit the update to all clients
//         emitUpdateSong({ songId: nextSong?.id || null, userId, organizationId });
//     }

//     async function fetchInitialState() {
//       // Fetch the current playing state from the backend
//       const { nowPlayingState } = await getNowPlayingState(organizationId);
      
//       if (role === "ADMIN" && !nowPlayingState?.currentSong) {
//         // If no song is playing initially, and the user is an ADMIN, start playing the next song from the queue.
//         await fetchAndUpdateNowPlaying();
//       } else if (nowPlayingState?.currentSong) {
//         // If a song is already playing, set it in the local state for all users
//         setCurrentSong(nowPlayingState.currentSong);
//       }
//     }
//     fetchInitialState();
//   }, [organizationId, role, setCurrentSong, currentSong, userId]);
//   // Listen for updates from other clients for non-admin users
//   useEffect(() => {
//     if (role === "ADMIN") {
//       return; 
//     }

//     const handleNowPlayingUpdate = async ({ songId }: { songId: string | null; userId: string; organizationId: string }) => {
//       if (songId) {
//         try {
//           const songDetails = await fetchSongDetails(organizationId, songId);
//           console.log("Received from server: ",songDetails);
//           setCurrentSong(songDetails);
//         } catch (error) {
//           console.error("Failed to fetch song details for now playing update", error);
//           setCurrentSong(null);
//         }
//       } else {
//         setCurrentSong(null);
//       }
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onUpdateSong(handleNowPlayingUpdate);

//     return () => {
//       offUpdateSong(handleNowPlayingUpdate);
//     };
//   }, [onUpdateSong, offUpdateSong, setCurrentSong, role, organizationId]);
  

//   useEffect(() => {
//     async function fetchOrgName() {
//       try {
//         const name = await getOrganizationName.getOrganizationName(organizationId);
//         setOrganizationName(name);
//       } catch (error) {
//         console.error("Failed to fetch organization name", error);
//       }
//     }
//     fetchOrgName();
//   }, [organizationId]);

//   // Removed redundant fetchLeaderboard logic from here. The central state is now managed by the socket updates.

//   const handleSongPlay = async (song: Song) => {
//     const result = await addSongToOrg({
//       organizationId,
//       token: user?.token || '', 
//       song: {
//         ...song,
//         duration: Number(song.duration),
//         downloadUrl: song.downloadUrl || '',
//       },
//     });
//     if (!result.success) {
//       // 🔴 Show error notification
//       const errorNotification = document.createElement('div');
//       errorNotification.className =
//         'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
//       errorNotification.innerHTML = `
//         <div class="flex items-center">
//           <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M18 10A8 8 0 11.001 9.999 8 8 0 0118 10zm-9-4a1 1 0 012 0v4a1 1 0 11-2 0V6zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd"></path>
//           </svg>
//           ${result.message}
//         </div>
//       `;
//       document.body.appendChild(errorNotification);

//       setTimeout(() => {
//         errorNotification.style.transform = 'translateX(100%)';
//         setTimeout(() => document.body.removeChild(errorNotification), 300);
//       }, 3000);
//       return;
//     }

//     // ✅ Show success notification
//     const notification = document.createElement('div');
//     notification.className =
//       'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
//     notification.innerHTML = `
//       <div class="flex items-center">
//         <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//         </svg>
//         Added "${song.name}" to queue!
//       </div>
//     `;
//     document.body.appendChild(notification);

//     setTimeout(() => {
//       notification.style.transform = 'translateX(100%)';
//       setTimeout(() => document.body.removeChild(notification), 300);
//     }, 3000);

//     // Rest of your success logic
//     LeaderboardService.addSongPlay(organizationId, song);
//     emitSongPlayed({ songId: song.id, userId, organizationId });
//     // The leaderboard updated event now triggers a refresh and re-fetches the list for everyone.
//     // The `fetchAndUpdateNowPlaying` call will handle setting the new song for everyone.
//     emitUpdateSong({songId: song.id, userId, organizationId});
//     setRefreshTrigger((prev) => prev + 1);
//      if (!currentSong) {
//       await fetchAndUpdateNowPlaying();
//     }
//   };


//   useEffect(() => {
//     const handleLeaderboardUpdate = (data: { song: Song; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       LeaderboardService.addSongPlay(data.organizationId, data.song);
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onLeaderboardUpdated(handleLeaderboardUpdate);
//     return () => {
//       offLeaderboardUpdated(handleLeaderboardUpdate);
//     };
//   }, [onLeaderboardUpdated, offLeaderboardUpdated, userId]);

//   useEffect(() => {
//     const handleBroadcast = (data: { songId: string; userId: string }) => {
//       if (data.userId === userId) return;
//     };

//     onSongPlayed(handleBroadcast);
//     return () => {
//       offSongPlayed(handleBroadcast);
//     };
//   }, [onSongPlayed, offSongPlayed, userId]);

//   useEffect(() => {
//     const handleSongVoted = async (data: { songId: string; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onSongVoted(handleSongVoted);
//     return () => {
//       offSongVoted(handleSongVoted);
//     };
//   }, [onSongVoted, offSongVoted, userId]);

//   useEffect(() => {
//     const handleSongBoosted = async (data: { songId: string; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onSongBoosted(handleSongBoosted);
//     return () => {
//       offSongBoosted(handleSongBoosted);
//     };
//   }, [onSongBoosted, offSongBoosted, userId]);
  
//   // This function now replaces the old fetchLeaderboard
//   const handleSkipSong = () => {
    
//       fetchAndUpdateNowPlaying();
    
//   };

//   const tabs = [
//     { id: 'search' as const, label: 'Search', icon: Search },
//     { id: 'leaderboard' as const, label: 'Queue', icon: BarChart3 },
//     { id: 'nowPlaying' as const, label: 'Now Playing', icon: Radio },
//     { id: 'qr' as const, label: 'QR Code', icon: QrCode },
//     { id: 'setting' as const, label: 'Settings', icon: Settings2Icon },
//   ];
//   const visibleTabs = role === 'ADMIN' ? tabs : tabs.filter(tab => tab.id !== 'qr' && tab.id !== 'setting');

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Spotify-like Layout */}
//       <div className="flex h-screen">
//         {/* Sidebar - Desktop */}
//         <div className="hidden lg:flex flex-col w-64 bg-black border-r border-gray-800">
//           {/* Logo */}
//           <div className="p-6">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//                 <Music className="w-5 h-5 text-black" />
//               </div>
//               <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//                 Meri Dhun
//               </span>
//             </div>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-6">
//             <div className="space-y-2">
//               <div className="flex items-center space-x-3 px-4 py-2 text-gray-400 text-sm font-medium">
//                 <Home className="w-4 h-4" />
//                 <span>MENU</span>
//               </div>
//               {visibleTabs.map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
//                       activeTab === tab.id 
//                         ? 'bg-gray-800 text-white shadow-lg' 
//                         : 'text-gray-400 hover:text-white hover:bg-gray-900'
//                     }`}
//                   >
//                     <Icon className="w-5 h-5" />
//                     <span>{tab.label}</span>
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Organization Info */}
//             <div className="mt-8 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
//               <div className="flex items-center space-x-2 mb-2">
//                 <Mic2 className="w-4 h-4 text-green-400" />
//                 <h3 className="text-sm font-semibold text-gray-300">Current Venue</h3>
//               </div>
//               <p className="text-lg font-bold text-white truncate">{organizationName}</p>
//               <div className="flex items-center space-x-1 mt-2">
//                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                 <span className="text-xs text-green-400">Live</span>
//               </div>
//             </div>
//           </nav>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 flex flex-col">
//           {/* Mobile Header */}
//           <div className="lg:hidden bg-black border-b border-gray-800 p-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//                   <Music className="w-5 h-5 text-black" />
//                 </div>
//                 <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//                   Meri Dhun
//                 </span>
//               </div>
//             </div>
            
//             {/* FIX: Mobile Tab Navigation now stacks icon and label vertically */}
//             <div className="flex mt-4 gap-1">
//               {visibleTabs.map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`flex-1 flex flex-col items-center justify-center px-1 py-2 rounded-lg font-medium whitespace-nowrap transition-all space-y-1 ${
//                       activeTab === tab.id 
//                         ? 'bg-green-500 text-black shadow-lg' 
//                         : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//                     }`}
//                   >
//                     <Icon className="w-4 h-4" />
//                     <span className="text-[10px] leading-none">{tab.label}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Content Area */}
//           <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
//             <div className="p-6">
//               {activeTab === 'search' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Search Music</h1>
//                       <p className="text-gray-400">Discover and add songs to the queue</p>
//                     </div>
//                     <div className="flex items-center space-x-2 text-green-400">
//                       <Waves className="w-5 h-5" />
//                       <span className="text-sm font-medium">Live Session</span>
//                     </div>
//                   </div>
//                   <SongSearch organizationId={organizationId} onSongPlay={handleSongPlay} />
//                 </div>
//               )}
//               {activeTab === 'leaderboard' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Music Queue</h1>
//                       <p className="text-gray-400">Vote for your favorite tracks</p>
//                     </div>
//                   </div>
//                   <Leaderboard organizationId={organizationId} refreshTrigger={refreshTrigger} userId={userId || ''} emitSongVoted={emitSongVoted} emitSongBoosted={emitSongBoosted} isAdmin={role === "ADMIN"} currentPlayingSongId={currentSong?.id} />
//                 </div>
//               )}
//               {role === "ADMIN" && activeTab === 'qr' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">QR Code Access</h1>
//                       <p className="text-gray-400">Share this QR code for guests to join</p>
//                     </div>
//                   </div>
//                   <GenerateQr organizationId={organizationId} />
//                 </div>
//               )}
//               {role === "ADMIN" && activeTab === 'setting' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Venue Settings</h1>
//                       <p className="text-gray-400">Configure your venue preferences</p>
//                     </div>
//                   </div>
//                   <VenueSettings id={organizationId || ""} />
//                 </div>
//               )}
//               {activeTab === 'nowPlaying' && (
//                 <div className="space-y-6 ">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Now Playing</h1>
//                       <p className="text-gray-400">Currently playing track</p>
//                     </div>
//                     <div className="flex items-center space-x-2 text-green-400">
//                       <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                       <span className="text-sm font-medium">Live</span>
//                     </div>
//                   </div>
//                   <NowPlaying 
//                     song={currentSong} 
//                     audioRef={audioRef} 
//                     setSong={setCurrentSong} 
//                     isDJ={role === "ADMIN"} 
//                     onSkip={handleSkipSong} 
//                     emitPlaybackUpdate={emitNowPlayingUpdated} 
//                     onPlaybackUpdate={onNowPlayingUpdated} 
//                     offPlaybackUpdate={offNowPlayingUpdated} 
//                     organizationId={organizationId}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Global Audio Player */}
//       {currentSong && (
//         <audio
//           ref={audioRef}
//           autoPlay
//           onEnded={handleSkipSong}
//           hidden
//         />
//       )}
//     </div>
//   );
// }


// 'use client';
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { Music, QrCode, BarChart3, Settings2Icon, Home, Search, Radio, Waves, Mic2 } from 'lucide-react';
// import SongSearch from './SongSearch';
// import Leaderboard from './Leaderboard';
// import GenerateQr from './GenerateQr';
// import { Song } from '@/lib/song';
// import NowPlaying from './NowPlaying';
// import { LeaderboardService } from '@/lib/services/leaderboard';
// import { useSocket } from '@/hooks/useSocket';
// import { useCurrentUser } from '@/hooks/useCurrentUser';
// import { addSongToOrg } from '@/lib/features/addSong';
// import { useDjAvailability } from '@/lib/features/useDjAvailable';
// import { useNowPlayingStore } from '@/lib/stores/nowPlayingStore';
// import { getOrganizationName } from '@/lib/features/getOrganizationName';
// import VenueSettings from './VenueSettings';
// import { updateNowPlayingState, getNowPlayingState } from '@/lib/features/nowPlayingState';
// import { fetchSongDetails } from '@/lib/features/getSong';

// interface PubDashboardProps {
//   organizationId: string;
// }

// // Centralized function to update the now playing state in the backend.
// // It is no longer part of the component to avoid being recreated on every render.
// export async function updateNowPlayingWithQueue(organizationId: string, oldSongId?: string | null, userId?: string | null): Promise<Song | null> {
//     // 1. If an old song exists, remove it from the leaderboard.
//     if (oldSongId) {
//         await LeaderboardService.removeSongFromLeaderboard(organizationId, oldSongId);
//     }
//     // 2. Get the new leaderboard.
//     const leaderboard = await LeaderboardService.getLeaderboard(organizationId, userId as string);
//     const nextSong = leaderboard[0]?.song || null;
//     // console.log("Next song",nextSong);
//     // 3. Update the backend state with the next song.
//     const newSongId = nextSong ? nextSong.id : null;
//     await updateNowPlayingState(organizationId, newSongId);

//     return nextSong;
// }

// export default function PubDashboard({ organizationId }: PubDashboardProps) {
//   const user = useCurrentUser();
//   const userId = user?.userId;
//   const role = user?.role;
//   const [activeTab, setActiveTab] = useState<'search' | 'leaderboard' | 'request' | 'qr' | 'nowPlaying' | 'setting'>('search');
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const { currentSong, setCurrentSong, audioRef } = useNowPlayingStore();
//   const { djAvailable, loading } = useDjAvailability(organizationId);
//   const isInitialLoad = useRef(true);
//   const [recentSong, setRecentSong] = useState(null);
//   const {
//     emitSongPlayed,
//     emitSongBoosted,
//     emitSongVoted,
//     emitNowPlayingUpdated,
//     onLeaderboardUpdated,
//     onSongPlayed,
//     offSongPlayed,
//     offLeaderboardUpdated,
//     onSongVoted,
//     offSongVoted,
//     onSongBoosted,
//     offSongBoosted,
//     emitUpdateSong,
//     onUpdateSong,
//     offUpdateSong,
//     onNowPlayingUpdated,
//     offNowPlayingUpdated,
//   } = useSocket(organizationId, userId ?? '');
//   const [organizationName, setOrganizationName] = useState<string>("");
  
//   // Centralized function to fetch the next song, update the backend, and emit to all clients.
//   // Memoized with useCallback to prevent unnecessary re-creation.
//   const fetchAndUpdateNowPlaying = useCallback(async () => {
//     if (role !== "ADMIN") return;
    
//     console.log("Fetching and updating now playing song...");
//     const nextSong = await updateNowPlayingWithQueue(organizationId, currentSong?.id, userId);
//     console.log("Next song",nextSong);
//     setCurrentSong(nextSong);
    
//     // Emit the update to all clients
//     emitUpdateSong({ songId: nextSong?.id || null, userId, organizationId });

//   }, [role, organizationId, currentSong, setCurrentSong, userId, emitUpdateSong]);

//   // Use a ref to ensure this effect only runs once on the initial mount for the ADMIN.
//   // This prevents the infinite loop when the queue is empty.
//   useEffect(() => {
//     async function fetchInitialState() {
//       // Prevents the hook from running again after the initial render.
//       if (!isInitialLoad.current) return;
//       isInitialLoad.current = false;

//       // Fetch the current playing state from the backend
//       const { nowPlayingState } = await getNowPlayingState(organizationId);
      
//       if (role === "ADMIN" && !nowPlayingState?.currentSong) {
//         // If no song is playing initially, and the user is an ADMIN, start playing the next song from the queue.
//         await fetchAndUpdateNowPlaying();
//       } else if (nowPlayingState?.currentSong) {
//         // If a song is already playing, set it in the local state for all users
        
//         setCurrentSong(nowPlayingState.currentSong);
//       }
//     }
//     fetchInitialState();
//   }, [organizationId, role, setCurrentSong, fetchAndUpdateNowPlaying]);

  
//   // Listen for updates from other clients for non-admin users
//   useEffect(() => {
//     if (role === "ADMIN") {
//       return; 
//     }

//     const handleNowPlayingUpdate = async ({ songId }: { songId: string | null; userId: string; organizationId: string }) => {
//       if (songId) {
//         try {
//           const songDetails = await fetchSongDetails(organizationId, songId);
//           console.log("Received from server: ",songDetails);
//           setCurrentSong(songDetails);
//         } catch (error) {
//           console.error("Failed to fetch song details for now playing update", error);
//           setCurrentSong(null);
//         }
//       } else {
//         setCurrentSong(null);
//       }
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onUpdateSong(handleNowPlayingUpdate);

//     return () => {
//       offUpdateSong(handleNowPlayingUpdate);
//     };
//   }, [onUpdateSong, offUpdateSong, setCurrentSong, role, organizationId]);
  

//   useEffect(() => {
//     async function fetchOrgName() {
//       try {
//         const name = await getOrganizationName.getOrganizationName(organizationId);
//         setOrganizationName(name);
//       } catch (error) {
//         console.error("Failed to fetch organization name", error);
//       }
//     }
//     fetchOrgName();
//   }, [organizationId]);

//   // Removed redundant fetchLeaderboard logic from here. The central state is now managed by the socket updates.

//   const handleSongPlay = async (song: Song) => {
//     const result = await addSongToOrg({
//       organizationId,
//       token: user?.token || '', 
//       song: {
//         ...song,
//         duration: Number(song.duration),
//         downloadUrl: song.downloadUrl || '',
//       },
//     });
//     if (!result.success) {
//       // 🔴 Show error notification
//       const errorNotification = document.createElement('div');
//       errorNotification.className =
//         'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
//       errorNotification.innerHTML = `
//         <div class="flex items-center">
//           <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M18 10A8 8 0 11.001 9.999 8 8 0 0118 10zm-9-4a1 1 0 012 0v4a1 1 0 11-2 0V6zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd"></path>
//           </svg>
//           ${result.message}
//         </div>
//       `;
//       document.body.appendChild(errorNotification);

//       setTimeout(() => {
//         errorNotification.style.transform = 'translateX(100%)';
//         setTimeout(() => document.body.removeChild(errorNotification), 300);
//       }, 3000);
//       return;
//     }

//     // ✅ Show success notification
//     const notification = document.createElement('div');
//     notification.className =
//       'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
//     notification.innerHTML = `
//       <div class="flex items-center">
//         <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//         </svg>
//         Added "${song.name}" to queue!
//       </div>
//     `;
//     document.body.appendChild(notification);

//     setTimeout(() => {
//       notification.style.transform = 'translateX(100%)';
//       setTimeout(() => document.body.removeChild(notification), 300);
//     }, 3000);

//     // Rest of your success logic
//     LeaderboardService.addSongPlay(organizationId, song);
//     emitSongPlayed({ songId: song.id, userId, organizationId });
//     // The leaderboard updated event now triggers a refresh and re-fetches the list for everyone.
//     // The `fetchAndUpdateNowPlaying` call will handle setting the new song for everyone.
//     emitUpdateSong({songId: song.id, userId, organizationId});
//     setRefreshTrigger((prev) => prev + 1);
//   };


//   useEffect(() => {
//     const handleLeaderboardUpdate = (data: { song: Song; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       LeaderboardService.addSongPlay(data.organizationId, data.song);
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onLeaderboardUpdated(handleLeaderboardUpdate);
//     return () => {
//       offLeaderboardUpdated(handleLeaderboardUpdate);
//     };
//   }, [onLeaderboardUpdated, offLeaderboardUpdated, userId]);

//   useEffect(() => {
//     const handleBroadcast = (data: { songId: string; userId: string }) => {
//       if (data.userId === userId) return;
//     };

//     onSongPlayed(handleBroadcast);
//     return () => {
//       offSongPlayed(handleBroadcast);
//     };
//   }, [onSongPlayed, offSongPlayed, userId]);

//   useEffect(() => {
//     const handleSongVoted = async (data: { songId: string; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onSongVoted(handleSongVoted);
//     return () => {
//       offSongVoted(handleSongVoted);
//     };
//   }, [onSongVoted, offSongVoted, userId]);

//   useEffect(() => {
//     const handleSongBoosted = async (data: { songId: string; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onSongBoosted(handleSongBoosted);
//     return () => {
//       offSongBoosted(handleSongBoosted);
//     };
//   }, [onSongBoosted, offSongBoosted, userId]);
  
//   // This function now replaces the old fetchLeaderboard
//   const handleSkipSong = () => {
    
//       fetchAndUpdateNowPlaying();
    
//   };

//   const tabs = [
//     { id: 'search' as const, label: 'Search', icon: Search },
//     { id: 'leaderboard' as const, label: 'Queue', icon: BarChart3 },
//     { id: 'nowPlaying' as const, label: 'Now Playing', icon: Radio },
//     { id: 'qr' as const, label: 'QR Code', icon: QrCode },
//     { id: 'setting' as const, label: 'Settings', icon: Settings2Icon },
//   ];
//   const visibleTabs = role === 'ADMIN' ? tabs : tabs.filter(tab => tab.id !== 'qr' && tab.id !== 'setting');

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Spotify-like Layout */}
//       <div className="flex h-screen">
//         {/* Sidebar - Desktop */}
//         <div className="hidden lg:flex flex-col w-64 bg-black border-r border-gray-800">
//           {/* Logo */}
//           <div className="p-6">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//                 <Music className="w-5 h-5 text-black" />
//               </div>
//               <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//                 Meri Dhun
//               </span>
//             </div>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-6">
//             <div className="space-y-2">
//               <div className="flex items-center space-x-3 px-4 py-2 text-gray-400 text-sm font-medium">
//                 <Home className="w-4 h-4" />
//                 <span>MENU</span>
//               </div>
//               {visibleTabs.map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
//                       activeTab === tab.id 
//                         ? 'bg-gray-800 text-white shadow-lg' 
//                         : 'text-gray-400 hover:text-white hover:bg-gray-900'
//                     }`}
//                   >
//                     <Icon className="w-5 h-5" />
//                     <span>{tab.label}</span>
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Organization Info */}
//             <div className="mt-8 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
//               <div className="flex items-center space-x-2 mb-2">
//                 <Mic2 className="w-4 h-4 text-green-400" />
//                 <h3 className="text-sm font-semibold text-gray-300">Current Venue</h3>
//               </div>
//               <p className="text-lg font-bold text-white truncate">{organizationName}</p>
//               <div className="flex items-center space-x-1 mt-2">
//                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                 <span className="text-xs text-green-400">Live</span>
//               </div>
//             </div>
//           </nav>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 flex flex-col">
//           {/* Mobile Header */}
//           <div className="lg:hidden bg-black border-b border-gray-800 p-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//                   <Music className="w-5 h-5 text-black" />
//                 </div>
//                 <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//                   Meri Dhun
//                 </span>
//               </div>
//             </div>
            
//             {/* Mobile Tab Navigation */}
//             <div className="flex space-x-1 mt-4 overflow-x-auto pb-2">
//               {visibleTabs.map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
//                       activeTab === tab.id 
//                         ? 'bg-green-500 text-black shadow-lg' 
//                         : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//                     }`}
//                   >
//                     <Icon className="w-4 h-4" />
//                     <span className="text-sm">{tab.label}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Content Area */}
//           <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
//             <div className="p-6">
//               {activeTab === 'search' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Search Music</h1>
//                       <p className="text-gray-400">Discover and add songs to the queue</p>
//                     </div>
//                     <div className="flex items-center space-x-2 text-green-400">
//                       <Waves className="w-5 h-5" />
//                       <span className="text-sm font-medium">Live Session</span>
//                     </div>
//                   </div>
//                   <SongSearch organizationId={organizationId} onSongPlay={handleSongPlay} />
//                 </div>
//               )}
//               {activeTab === 'leaderboard' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Music Queue</h1>
//                       <p className="text-gray-400">Vote for your favorite tracks</p>
//                     </div>
//                   </div>
//                   <Leaderboard organizationId={organizationId} refreshTrigger={refreshTrigger} userId={userId || ''} emitSongVoted={emitSongVoted} emitSongBoosted={emitSongBoosted} isAdmin={role === "ADMIN"} currentPlayingSongId={currentSong?.id} />
//                 </div>
//               )}
//               {role === "ADMIN" && activeTab === 'qr' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">QR Code Access</h1>
//                       <p className="text-gray-400">Share this QR code for guests to join</p>
//                     </div>
//                   </div>
//                   <GenerateQr organizationId={organizationId} />
//                 </div>
//               )}
//               {role === "ADMIN" && activeTab === 'setting' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Venue Settings</h1>
//                       <p className="text-gray-400">Configure your venue preferences</p>
//                     </div>
//                   </div>
//                   <VenueSettings id={organizationId || ""} />
//                 </div>
//               )}
//               {activeTab === 'nowPlaying' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Now Playing</h1>
//                       <p className="text-gray-400">Currently playing track</p>
//                     </div>
//                     <div className="flex items-center space-x-2 text-green-400">
//                       <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                       <span className="text-sm font-medium">Live</span>
//                     </div>
//                   </div>
//                   <NowPlaying 
//                     song={currentSong} 
//                     audioRef={audioRef} 
//                     setSong={setCurrentSong} 
//                     isDJ={role === "ADMIN"} 
//                     onSkip={handleSkipSong} 
//                     emitPlaybackUpdate={emitNowPlayingUpdated} 
//                     onPlaybackUpdate={onNowPlayingUpdated} 
//                     offPlaybackUpdate={offNowPlayingUpdated} 
//                     organizationId={organizationId}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Global Audio Player */}
//       {currentSong && (
//         <audio
//           ref={audioRef}
//           autoPlay
//           onEnded={handleSkipSong}
//           hidden
//         />
//       )}
//     </div>
//   );
// }


// export default function PubDashboard({ organizationId }: PubDashboardProps) {
//   const user = useCurrentUser();
//   const userId = user?.userId;
//   const role = user?.role;
//   const [activeTab, setActiveTab] = useState<'search' | 'leaderboard' | 'request' | 'qr' | 'nowPlaying' | 'setting'>('search');
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const { currentSong, setCurrentSong, audioRef } = useNowPlayingStore();
//   const { djAvailable, loading } = useDjAvailability(organizationId);

//   const {
//     emitSongPlayed,
//     emitSongBoosted,
//     emitSongVoted,
//     emitSpecialRequest,
//     emitLeaderboardUpdated,
//     emitNowPlayingUpdated,
//     emitSkipSong,
//     onLeaderboardUpdated,
//     onSongPlayed,
//     offSongPlayed,
//     offLeaderboardUpdated,
//     onSongVoted,
//     offSongVoted,
//     onSongBoosted,
//     offSongBoosted,
//     onSpecialRequest,
//     offSpecialRequest,
//     emitUpdateSong,
//     onUpdateSong,
//     offUpdateSong,
//     onNowPlayingUpdated,
//     offNowPlayingUpdated,
//     onSkipSong,
//     offSkipSong,
//   } = useSocket(organizationId, userId ?? '');
//   const [organizationName, setOrganizationName] = useState<string>("");
 
  

//   useEffect(() => {
//     async function fetchOrgName() {
//       try {
//         const name = await getOrganizationName.getOrganizationName(organizationId);
//         setOrganizationName(name);
//       } catch (error) {
//         console.error("Failed to fetch organization name", error);
//       }
//     }

//     fetchOrgName();
//   }, [organizationId]);

//   useEffect(() => {
//     if (!userId) return;

//     async function fetchLeaderboard() {
//       const leaderboard = await LeaderboardService.getLeaderboard(organizationId, userId as string);
//       if (leaderboard.length > 0) {
//         const topSong = leaderboard[0].song;
//         if (!currentSong || currentSong.id !== topSong.id || currentSong.downloadUrl !== topSong.downloadUrl) {
//           setCurrentSong(topSong);
//         }
//       }
//     }

//     fetchLeaderboard();
//   }, [refreshTrigger, organizationId, userId]);

//   const handleSongPlay = async (song: Song) => {
//     const result = await addSongToOrg({
//       organizationId,
//       token: user?.token || '', 
//       song: {
//         ...song,
//         duration: Number(song.duration),
//         downloadUrl: song.downloadUrl || '',
//       },
//     });
//       if (!result.success) {
//       // 🔴 Show error notification
//       const errorNotification = document.createElement('div');
//       errorNotification.className =
//         'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
//       errorNotification.innerHTML = `
//         <div class="flex items-center">
//           <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M18 10A8 8 0 11.001 9.999 8 8 0 0118 10zm-9-4a1 1 0 012 0v4a1 1 0 11-2 0V6zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd"></path>
//           </svg>
//           ${result.message}
//         </div>
//       `;
//       document.body.appendChild(errorNotification);

//       setTimeout(() => {
//         errorNotification.style.transform = 'translateX(100%)';
//         setTimeout(() => document.body.removeChild(errorNotification), 300);
//       }, 3000);
//       return; // ❌ Stop here, don't proceed with success actions
//     }

//     // ✅ Show success notification
//     const notification = document.createElement('div');
//     notification.className =
//       'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-x-0';
//     notification.innerHTML = `
//       <div class="flex items-center">
//         <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//         </svg>
//         Added "${song.name}" to queue!
//       </div>
//     `;
//     document.body.appendChild(notification);

//     setTimeout(() => {
//       notification.style.transform = 'translateX(100%)';
//       setTimeout(() => document.body.removeChild(notification), 300);
//     }, 3000);

//     // Rest of your success logic
//     LeaderboardService.addSongPlay(organizationId, song);
//     emitSongPlayed({ songId: song.id, userId, organizationId });
//     emitLeaderboardUpdated({ song, userId, organizationId });

//     if (!currentSong || currentSong.id !== song.id) {
//       setCurrentSong(song);
//     }

//     setRefreshTrigger((prev) => prev + 1);
//   };


//   useEffect(() => {
//     const handleLeaderboardUpdate = (data: { song: Song; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       LeaderboardService.addSongPlay(data.organizationId, data.song);
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onLeaderboardUpdated(handleLeaderboardUpdate);
//     return () => {
//       offLeaderboardUpdated(handleLeaderboardUpdate);
//     };
//   }, [onLeaderboardUpdated, offLeaderboardUpdated, userId]);

//   useEffect(() => {
//     const handleBroadcast = (data: { songId: string; userId: string }) => {
//       if (data.userId === userId) return;
//     };

//     onSongPlayed(handleBroadcast);
//     return () => {
//       offSongPlayed(handleBroadcast);
//     };
//   }, [onSongPlayed, offSongPlayed, userId]);

//   useEffect(() => {
//     const handleSongVoted = async (data: { songId: string; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onSongVoted(handleSongVoted);
//     return () => {
//       offSongVoted(handleSongVoted);
//     };
//   }, [onSongVoted, offSongVoted, userId]);

//   useEffect(() => {
//     const handleSongBoosted = async (data: { songId: string; userId: string; organizationId: string }) => {
//       if (data.userId === userId) return;
//       setRefreshTrigger((prev) => prev + 1);
//     };

//     onSongBoosted(handleSongBoosted);
//     return () => {
//       offSongBoosted(handleSongBoosted);
//     };
//   }, [onSongBoosted, offSongBoosted, userId]);

//   const fetchLeaderboard = async () => {
//     if (!currentSong) return;
//     await LeaderboardService.removeSongFromLeaderboard(organizationId, currentSong.id);
    
//     const updated = await LeaderboardService.getLeaderboard(organizationId, userId as string);
//     if (updated.length > 0) {
//       setCurrentSong(updated[0].song);
//       emitSkipSong(updated[0].song);
//     } else {
//       setCurrentSong(null);
//     }
//     setRefreshTrigger((prev) => prev + 1);
//   };

//   const handleSongEnd = () => {
//     if (djAvailable) {
//       fetchLeaderboard(); 
//     }
//   };

//   const tabs = [
//     { id: 'search' as const, label: 'Search', icon: Search },
//     { id: 'leaderboard' as const, label: 'Queue', icon: BarChart3 },
//     { id: 'nowPlaying' as const, label: 'Now Playing', icon: Radio },
//    // { id: 'request' as const, label: 'Requests', icon: MessageCircleCodeIcon },
//     { id: 'qr' as const, label: 'QR Code', icon: QrCode },
//     { id: 'setting' as const, label: 'Settings', icon: Settings2Icon},
//   ];
//   const visibleTabs = role === 'ADMIN' ? tabs : tabs.filter(tab => tab.id !== 'qr' && tab.id !== 'setting');

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Spotify-like Layout */}
//       <div className="flex h-screen">
//         {/* Sidebar - Desktop */}
//         <div className="hidden lg:flex flex-col w-64 bg-black border-r border-gray-800">
//           {/* Logo */}
//           <div className="p-6">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//                 <Music className="w-5 h-5 text-black" />
//               </div>
//               <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//                 Meri Dhun
//               </span>
//             </div>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-6">
//             <div className="space-y-2">
//               <div className="flex items-center space-x-3 px-4 py-2 text-gray-400 text-sm font-medium">
//                 <Home className="w-4 h-4" />
//                 <span>MENU</span>
//               </div>
//               {visibleTabs.map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
//                       activeTab === tab.id 
//                         ? 'bg-gray-800 text-white shadow-lg' 
//                         : 'text-gray-400 hover:text-white hover:bg-gray-900'
//                     }`}
//                   >
//                     <Icon className="w-5 h-5" />
//                     <span>{tab.label}</span>
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Organization Info */}
//             <div className="mt-8 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
//               <div className="flex items-center space-x-2 mb-2">
//                 <Mic2 className="w-4 h-4 text-green-400" />
//                 <h3 className="text-sm font-semibold text-gray-300">Current Venue</h3>
//               </div>
//               <p className="text-lg font-bold text-white truncate">{organizationName}</p>
//               <div className="flex items-center space-x-1 mt-2">
//                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                 <span className="text-xs text-green-400">Live</span>
//               </div>
//             </div>
//           </nav>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 flex flex-col">
//           {/* Mobile Header */}
//           <div className="lg:hidden bg-black border-b border-gray-800 p-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
//                   <Music className="w-5 h-5 text-black" />
//                 </div>
//                 <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-white bg-clip-text text-transparent">
//                   Meri Dhun
//                 </span>
//               </div>
//             </div>
            
//             {/* Mobile Tab Navigation */}
//             <div className="flex space-x-1 mt-4 overflow-x-auto pb-2">
//               {visibleTabs.map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
//                       activeTab === tab.id 
//                         ? 'bg-green-500 text-black shadow-lg' 
//                         : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//                     }`}
//                   >
//                     <Icon className="w-4 h-4" />
//                     <span className="text-sm">{tab.label}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Content Area */}
//           <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
//             <div className="p-6">
//               {activeTab === 'search' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Search Music</h1>
//                       <p className="text-gray-400">Discover and add songs to the queue</p>
//                     </div>
//                     <div className="flex items-center space-x-2 text-green-400">
//                       <Waves className="w-5 h-5" />
//                       <span className="text-sm font-medium">Live Session</span>
//                     </div>
//                   </div>
//                   <SongSearch organizationId={organizationId} onSongPlay={handleSongPlay} />
//                 </div>
//               )}
//               {activeTab === 'leaderboard' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Music Queue</h1>
//                       <p className="text-gray-400">Vote for your favorite tracks</p>
//                     </div>
//                   </div>
//                   <Leaderboard organizationId={organizationId} refreshTrigger={refreshTrigger} userId={userId || ''} emitSongVoted={emitSongVoted} emitSongBoosted={emitSongBoosted} isAdmin={role === "ADMIN"} currentPlayingSongId={currentSong?.id} />
//                 </div>
//               )}
//               {/* {activeTab === 'request' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Special Requests</h1>
//                       <p className="text-gray-400">Make dedications and special announcements</p>
//                     </div>
//                   </div>
//                   <SpecialRequests organizationId={organizationId} userId={userId || ''} isDjMode={role === "ADMIN"} emitSpecialRequest={emitSpecialRequest} onSpecialRequest={onSpecialRequest} offSpecialRequest={offSpecialRequest}/>
//                 </div>
//               )} */}
//               {role === "ADMIN" && activeTab === 'qr' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">QR Code Access</h1>
//                       <p className="text-gray-400">Share this QR code for guests to join</p>
//                     </div>
//                   </div>
//                   <GenerateQr organizationId={organizationId} />
//                 </div>
//               )}
//               {role === "ADMIN" && activeTab === 'setting' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Venue Settings</h1>
//                       <p className="text-gray-400">Configure your venue preferences</p>
//                     </div>
//                   </div>
//                   <VenueSettings id={organizationId || ""} />
//                 </div>
//               )}
//               {activeTab === 'nowPlaying' && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h1 className="text-3xl font-bold text-white mb-2">Now Playing</h1>
//                       <p className="text-gray-400">Currently playing track</p>
//                     </div>
//                     <div className="flex items-center space-x-2 text-green-400">
//                       <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                       <span className="text-sm font-medium">Live</span>
//                     </div>
//                   </div>
//                   <NowPlaying song={currentSong} audioRef={audioRef} setSong={setCurrentSong} isDJ={role === "ADMIN"} onSkip={fetchLeaderboard} emitPlaybackUpdate={emitNowPlayingUpdated} onPlaybackUpdate={onNowPlayingUpdated} offPlaybackUpdate={offNowPlayingUpdated} emitSkipSong= {emitSkipSong} onSkipSong={onSkipSong} offSkipSong={offSkipSong} organizationId={organizationId}/>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Global Audio Player */}
//       {currentSong && (
//         <audio
//           ref={audioRef}
//           autoPlay
//           onEnded={handleSongEnd}
//           hidden
//         />
//       )}
//     </div>
//   );
// }