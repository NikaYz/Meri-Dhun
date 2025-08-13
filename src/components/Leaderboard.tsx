'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Music, Clock, User, Disc, RotateCcw, Crown, Medal, Award, TrendingUp, Zap } from 'lucide-react';
import { LeaderboardService } from '@/lib/services/leaderboard';
import { LeaderboardEntry } from '@/lib/song';
import VotingInterface from './VotingInterface';
import Image from 'next/image';

interface LeaderboardProps {
  organizationId: string;
  refreshTrigger?: number;
  userId: string;
  emitSongVoted: (data: { songId: string; userId: string; organizationId: string }) => void;
  emitSongBoosted: (data: { songId: string; userId: string; organizationId: string }) => void;
  isAdmin: boolean;
  currentPlayingSongId?: string;
}

export default function Leaderboard({ organizationId, refreshTrigger, userId, emitSongVoted, emitSongBoosted, isAdmin, currentPlayingSongId }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Wrap loadLeaderboard in useCallback. It will only be recreated if
  // its dependencies (organizationId or userId) change. This makes
  // it a stable function that we can safely add to the useEffect dependency array.
  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    const data = await LeaderboardService.getLeaderboard(organizationId, userId);
    setLeaderboard(data);
    setLoading(false);
  }, [organizationId, userId]);

  useEffect(() => {
    // Call the stable loadLeaderboard function.
    loadLeaderboard();
  }, [loadLeaderboard, refreshTrigger]);

  const handleClearLeaderboard = () => {
    // NOTE: For this collaborative environment, it's a best practice to
    // replace window.confirm with a custom modal component for user feedback.
    // window.confirm may not be visible to the user.
    // The rest of the logic is kept for demonstration purposes.
    if (confirm('Are you sure you want to clear the queue? This action cannot be undone.')) {
      LeaderboardService.clearLeaderboard(organizationId);
      loadLeaderboard();
    }
  };

  const formatDuration = (duration: string) => {
    const seconds = parseInt(duration);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatLastPlayed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };
  const currentPlayingEntry = leaderboard.find(e => e.song.id === currentPlayingSongId);
  const otherEntries = leaderboard.filter(e => e.song.id !== currentPlayingSongId);
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-4 h-4 sm:w-6 sm:h-6 text-gray-300" />;
      case 3:
        return <Award className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500" />;
      default:
        return <span className="w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center text-sm sm:text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black shadow-lg shadow-yellow-500/25';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-300 text-black shadow-lg shadow-gray-400/25';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/25';
      default:
        return 'bg-gray-800 text-gray-300 border border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 sm:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
 
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 sm:p-6 text-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/20 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-black" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Music Queue</h2>
              <p className="text-black/80 flex items-center space-x-2 text-sm sm:text-base">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Live voting in progress</span>
              </p>
            </div>
          </div>
          {leaderboard.length > 0 && isAdmin && (
            <button
              onClick={handleClearLeaderboard}
              className="flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-black/20 hover:bg-black/30 rounded-xl transition-colors text-black font-semibold text-xs sm:text-sm"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Clear Queue
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 sm:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Music className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Queue is empty</h3>
            <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">Start searching and adding songs to build your music queue! The community will vote for their favorites.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pinned now playing song */}
            {currentPlayingEntry && (
              <div
                key={currentPlayingEntry.song.id}
                className="relative flex items-center p-3 sm:p-5 rounded-2xl bg-green-900 border-4 border-green-500 shadow-lg mb-4"
              >
                <Image
                  src={currentPlayingEntry.song.image}
                  alt={currentPlayingEntry.song.name}
                  width={80}
                  height={80}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-green-500 mr-2 sm:mr-4"
                />
                <div className="flex-1 text-white font-bold text-base sm:text-lg">
                  {currentPlayingEntry.song.name}
                  <span className="ml-2 px-2 py-1 text-[10px] sm:text-xs bg-green-600 rounded">Now Playing</span>
                  <div className="text-xs sm:text-sm text-green-300">
                    {currentPlayingEntry.song.primaryArtists?.map(a => a.name).join(', ')}
                  </div>
                </div>
              </div>
            )}
            
            {otherEntries.map((entry) => (
              <div
                key={entry.song.id}
                className={`relative flex items-center flex-wrap gap-y-2 p-3 sm:p-5 
                  rounded-2xl transition-all duration-300 hover:shadow-lg group
                  ${entry.rank <= 3 
                    ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 shadow-lg' 
                    : 'bg-gray-800 border border-gray-700 hover:bg-gray-750'
                  }`}
              >
                {/* Rank Badge */}
                <div className="flex-shrink-0 mr-2 sm:mr-4">
                  <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${getRankBadgeColor(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </div>
                </div>

                {/* Song Image */}
                <div className="flex-shrink-0 mr-2 sm:mr-4">
                  <Image
                    src={entry.song.image}
                    alt={entry.song.name}
                    width={80}
                    height={80}
                    className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-600"
                  />
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate max-w-[140px] sm:max-w-none text-sm sm:text-lg mb-0.5">
                    {entry.song.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-sm text-gray-400 mb-1 sm:mb-2">
                    <div className="flex items-center truncate max-w-[100px] sm:max-w-none">
                      <User className="w-3 h-3 mr-0.5" />
                      <span className="truncate">{entry.song.primaryArtists?.map(a => a.name).join(', ')}</span>
                    </div>
                    {entry.song.album && (
                      <div className="flex items-center truncate max-w-[80px] sm:max-w-none">
                        <Disc className="w-3 h-3 mr-0.5" />
                        <span className="truncate">{entry.song.album}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-0.5" />
                      <span>{formatDuration(entry.song.duration)}</span>
                    </div>
                  </div>
                  <div className="text-[9px] sm:text-xs text-gray-500">
                    Added: {formatLastPlayed(entry.song.lastPlayed || "")}
                  </div>
                </div>

                {/* Voting and Play Count Container */}
                <div className="flex items-center space-x-2 sm:space-x-4 ml-auto mt-2 sm:mt-0">
                  {/* Voting */}
                  <div className="flex-shrink-0">
                    <VotingInterface
                      entry={entry}
                      organizationId={organizationId}
                      userId={userId}
                      onVote={loadLeaderboard}
                      emitSongVoted={emitSongVoted}
                      emitSongBoosted={emitSongBoosted}
                      canVote={true}
                    />
                  </div>

                  {/* Play Count */}
                  <div className="flex-shrink-0 text-right">
                    <div className="bg-gradient-to-r from-green-500/20 to-green-400/20 text-green-400 px-2 py-1 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-sm font-bold border border-green-500/30">
                      <div className="flex items-center space-x-0.5 sm:space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>{entry.playCount}</span>
                      </div>
                      <div className="text-[8px] sm:text-xs text-green-300">
                        {entry.playCount === 1 ? 'play' : 'plays'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Trophy, Music, Clock, User, Disc, RotateCcw, Crown, Medal, Award, TrendingUp, Zap } from 'lucide-react';
// import { LeaderboardService } from '@/lib/services/leaderboard';
// import { LeaderboardEntry } from '@/lib/song';
// import VotingInterface from './VotingInterface';
// import Image from 'next/image';

// interface LeaderboardProps {
//   organizationId: string;
//   refreshTrigger?: number;
//   userId: string;
//   emitSongVoted: (data: { songId: string; userId: string; organizationId: string }) => void;
//   emitSongBoosted: (data: { songId: string; userId: string; organizationId: string }) => void;
//   isAdmin: boolean;
//   currentPlayingSongId?: string;
// }

// export default function Leaderboard({ organizationId, refreshTrigger, userId, emitSongVoted, emitSongBoosted, isAdmin, currentPlayingSongId }: LeaderboardProps) {
//   const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadLeaderboard();
//   }, [organizationId, refreshTrigger, userId]);

//   const loadLeaderboard = async () => {
//     setLoading(true);
//     const data = await LeaderboardService.getLeaderboard(organizationId, userId);
//     setLeaderboard(data);
//     setLoading(false);
//   };

//   const handleClearLeaderboard = () => {
//     // NOTE: In a real-world app, you would show a custom modal here instead of using window.confirm.
//     // For this example, we'll simulate the action directly.
//     if (confirm('Are you sure you want to clear the queue? This action cannot be undone.')) {
//       LeaderboardService.clearLeaderboard(organizationId);
//       loadLeaderboard();
//     }
//   };

//   const formatDuration = (duration: string) => {
//     const seconds = parseInt(duration);
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   const formatLastPlayed = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
//     if (diffInMinutes < 1) return 'Just now';
//     if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
//     if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
//     return `${Math.floor(diffInMinutes / 1440)}d ago`;
//   };
//   const currentPlayingEntry = leaderboard.find(e => e.song.id === currentPlayingSongId);
//   const otherEntries = leaderboard.filter(e => e.song.id !== currentPlayingSongId);
  
//   const getRankIcon = (rank: number) => {
//     switch (rank) {
//       case 1:
//         return <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />;
//       case 2:
//         return <Medal className="w-4 h-4 sm:w-6 sm:h-6 text-gray-300" />;
//       case 3:
//         return <Award className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500" />;
//       default:
//         return <span className="w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center text-sm sm:text-lg font-bold text-gray-400">#{rank}</span>;
//     }
//   };

//   const getRankBadgeColor = (rank: number) => {
//     switch (rank) {
//       case 1:
//         return 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black shadow-lg shadow-yellow-500/25';
//       case 2:
//         return 'bg-gradient-to-r from-gray-400 to-gray-300 text-black shadow-lg shadow-gray-400/25';
//       case 3:
//         return 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/25';
//       default:
//         return 'bg-gray-800 text-gray-300 border border-gray-700';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 sm:p-8">
//         <div className="animate-pulse">
//           <div className="h-8 bg-gray-700 rounded mb-6"></div>
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className="flex items-center space-x-4 mb-4">
//               <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
//               <div className="flex-1">
//                 <div className="h-4 bg-gray-700 rounded mb-2"></div>
//                 <div className="h-3 bg-gray-700 rounded w-2/3"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }
 
//   return (
//     <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
//       <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 sm:p-6 text-black">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/20 rounded-full flex items-center justify-center">
//               <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-black" />
//             </div>
//             <div>
//               <h2 className="text-xl sm:text-2xl font-bold">Music Queue</h2>
//               <p className="text-black/80 flex items-center space-x-2 text-sm sm:text-base">
//                 <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
//                 <span>Live voting in progress</span>
//               </p>
//             </div>
//           </div>
//           {leaderboard.length > 0 && isAdmin && (
//             <button
//               onClick={handleClearLeaderboard}
//               className="flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-black/20 hover:bg-black/30 rounded-xl transition-colors text-black font-semibold text-xs sm:text-sm"
//             >
//               <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
//               Clear Queue
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="p-4 sm:p-6">
//         {leaderboard.length === 0 ? (
//           <div className="text-center py-8 sm:py-16">
//             <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
//               <Music className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
//             </div>
//             <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Queue is empty</h3>
//             <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">Start searching and adding songs to build your music queue! The community will vote for their favorites.</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {/* Pinned now playing song */}
//             {currentPlayingEntry && (
//               <div
//                 key={currentPlayingEntry.song.id}
//                 className="relative flex items-center p-3 sm:p-5 rounded-2xl bg-green-900 border-4 border-green-500 shadow-lg mb-4"
//               >
//                 <Image
//                   src={currentPlayingEntry.song.image}
//                   alt={currentPlayingEntry.song.name}
//                   className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-green-500 mr-2 sm:mr-4"
//                 />
//                 <div className="flex-1 text-white font-bold text-base sm:text-lg">
//                   {currentPlayingEntry.song.name}
//                   <span className="ml-2 px-2 py-1 text-[10px] sm:text-xs bg-green-600 rounded">Now Playing</span>
//                   <div className="text-xs sm:text-sm text-green-300">
//                     {currentPlayingEntry.song.primaryArtists?.map(a => a.name).join(', ')}
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {otherEntries.map((entry) => (
//               <div
//                 key={entry.song.id}
//                 className={`relative flex items-center flex-wrap gap-y-2 p-3 sm:p-5 
//                   rounded-2xl transition-all duration-300 hover:shadow-lg group
//                   ${entry.rank <= 3 
//                     ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 shadow-lg' 
//                     : 'bg-gray-800 border border-gray-700 hover:bg-gray-750'
//                   }`}
//               >
//                 {/* Rank Badge */}
//                 <div className="flex-shrink-0 mr-2 sm:mr-4">
//                   <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${getRankBadgeColor(entry.rank)}`}>
//                     {getRankIcon(entry.rank)}
//                   </div>
//                 </div>

//                 {/* Song Image */}
//                 <div className="flex-shrink-0 mr-2 sm:mr-4">
//                   <Image
//                     src={entry.song.image}
//                     alt={entry.song.name}
//                     className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-600"
//                   />
//                 </div>

//                 {/* Song Info */}
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-bold text-white truncate max-w-[140px] sm:max-w-none text-sm sm:text-lg mb-0.5">
//                     {entry.song.name}
//                   </h3>
//                   <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-sm text-gray-400 mb-1 sm:mb-2">
//                     <div className="flex items-center truncate max-w-[100px] sm:max-w-none">
//                       <User className="w-3 h-3 mr-0.5" />
//                       <span className="truncate">{entry.song.primaryArtists?.map(a => a.name).join(', ')}</span>
//                     </div>
//                     {entry.song.album && (
//                       <div className="flex items-center truncate max-w-[80px] sm:max-w-none">
//                         <Disc className="w-3 h-3 mr-0.5" />
//                         <span className="truncate">{entry.song.album}</span>
//                       </div>
//                     )}
//                     <div className="flex items-center">
//                       <Clock className="w-3 h-3 mr-0.5" />
//                       <span>{formatDuration(entry.song.duration)}</span>
//                     </div>
//                   </div>
//                   <div className="text-[9px] sm:text-xs text-gray-500">
//                     Added: {formatLastPlayed(entry.song.lastPlayed || "")}
//                   </div>
//                 </div>

//                 {/* Voting and Play Count Container */}
//                 <div className="flex items-center space-x-2 sm:space-x-4 ml-auto mt-2 sm:mt-0">
//                   {/* Voting */}
//                   <div className="flex-shrink-0">
//                     <VotingInterface
//                       entry={entry}
//                       organizationId={organizationId}
//                       userId={userId}
//                       onVote={loadLeaderboard}
//                       emitSongVoted={emitSongVoted}
//                       emitSongBoosted={emitSongBoosted}
//                       canVote={true}
//                     />
//                   </div>

//                   {/* Play Count */}
//                   <div className="flex-shrink-0 text-right">
//                     <div className="bg-gradient-to-r from-green-500/20 to-green-400/20 text-green-400 px-2 py-1 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-sm font-bold border border-green-500/30">
//                       <div className="flex items-center space-x-0.5 sm:space-x-1">
//                         <Zap className="w-3 h-3" />
//                         <span>{entry.playCount}</span>
//                       </div>
//                       <div className="text-[8px] sm:text-xs text-green-300">
//                         {entry.playCount === 1 ? 'play' : 'plays'}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// // import React, { useState, useEffect } from 'react';
// // import { Trophy, Music, Clock, User, Disc, RotateCcw, Crown, Medal, Award, TrendingUp, Zap, Flame } from 'lucide-react';
// // import { LeaderboardService } from '@/lib/services/leaderboard';
// // import { LeaderboardEntry } from '@/lib/song';
// // import VotingInterface from './VotingInterface';

// // interface LeaderboardProps {
// //   organizationId: string;
// //   refreshTrigger?: number;
// //   userId: string;
// //   emitSongVoted: (data: { songId: string; userId: string; organizationId: string }) => void;
// //   emitSongBoosted: (data: { songId: string; userId: string; organizationId: string }) => void;
// //   isAdmin: boolean;
// //   currentPlayingSongId?: string;
// // }

// // export default function Leaderboard({ organizationId, refreshTrigger, userId, emitSongVoted, emitSongBoosted, isAdmin, currentPlayingSongId }: LeaderboardProps) {
// //   const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     loadLeaderboard();
// //   }, [organizationId, refreshTrigger]);

// //   const loadLeaderboard = async () => {
// //     setLoading(true);
// //     const data = await LeaderboardService.getLeaderboard(organizationId, userId);
// //     setLeaderboard(data);
// //     setLoading(false);
// //   };

// //   const handleClearLeaderboard = () => {
// //     if (window.confirm('Are you sure you want to clear the queue? This action cannot be undone.')) {
// //       LeaderboardService.clearLeaderboard(organizationId);
// //       loadLeaderboard();
// //     }
// //   };

// //   const formatDuration = (duration: string) => {
// //     const seconds = parseInt(duration);
// //     const minutes = Math.floor(seconds / 60);
// //     const remainingSeconds = seconds % 60;
// //     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
// //   };

// //   const formatLastPlayed = (dateString: string) => {
// //     const date = new Date(dateString);
// //     const now = new Date();
// //     const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
// //     if (diffInMinutes < 1) return 'Just now';
// //     if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
// //     if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
// //     return `${Math.floor(diffInMinutes / 1440)}d ago`;
// //   };
// //   const currentPlayingEntry = leaderboard.find(e => e.song.id === currentPlayingSongId);
// //   const otherEntries = leaderboard.filter(e => e.song.id !== currentPlayingSongId);
// //   const getRankIcon = (rank: number) => {
// //     switch (rank) {
// //       case 1:
// //         return <Crown className="w-6 h-6 text-yellow-400" />;
// //       case 2:
// //         return <Medal className="w-6 h-6 text-gray-300" />;
// //       case 3:
// //         return <Award className="w-6 h-6 text-amber-500" />;
// //       default:
// //         return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-400">#{rank}</span>;
// //     }
// //   };

// //   const getRankBadgeColor = (rank: number) => {
// //     switch (rank) {
// //       case 1:
// //         return 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black shadow-lg shadow-yellow-500/25';
// //       case 2:
// //         return 'bg-gradient-to-r from-gray-400 to-gray-300 text-black shadow-lg shadow-gray-400/25';
// //       case 3:
// //         return 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/25';
// //       default:
// //         return 'bg-gray-800 text-gray-300 border border-gray-700';
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
// //         <div className="animate-pulse">
// //           <div className="h-8 bg-gray-700 rounded mb-6"></div>
// //           {[...Array(5)].map((_, i) => (
// //             <div key={i} className="flex items-center space-x-4 mb-4">
// //               <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
// //               <div className="flex-1">
// //                 <div className="h-4 bg-gray-700 rounded mb-2"></div>
// //                 <div className="h-3 bg-gray-700 rounded w-2/3"></div>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     );
// //   }
 
// //   return (
// //     <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
// //       <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-black">
// //         <div className="flex items-center justify-between">
// //           <div className="flex items-center space-x-3">
// //             <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
// //               <Trophy className="w-7 h-7 text-black" />
// //             </div>
// //             <div>
// //               <h2 className="text-2xl font-bold">Music Queue</h2>
// //               <p className="text-black/80 flex items-center space-x-2">
// //                 <TrendingUp className="w-4 h-4" />
// //                 <span>Live voting in progress</span>
// //               </p>
// //             </div>
// //           </div>
// //           {leaderboard.length > 0 && isAdmin && (
// //             <button
// //               onClick={handleClearLeaderboard}
// //               className="flex items-center px-4 py-2 bg-black/20 hover:bg-black/30 rounded-xl transition-colors text-black font-semibold"
// //             >
// //               <RotateCcw className="w-4 h-4 mr-2" />
// //               Clear Queue
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       <div className="p-6">
// //         {leaderboard.length === 0 ? (
// //           <div className="text-center py-16">
// //             <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
// //               <Music className="w-10 h-10 text-gray-500" />
// //             </div>
// //             <h3 className="text-xl font-semibold text-white mb-3">Queue is empty</h3>
// //             <p className="text-gray-400 max-w-md mx-auto">Start searching and adding songs to build your music queue! The community will vote for their favorites.</p>
// //           </div>
// //         ) : (
// //           <div className="space-y-4">
// //   {/* Pinned now playing song */}
// //   {currentPlayingEntry && (
// //     <div
// //       key={currentPlayingEntry.song.id}
// //       className="relative flex items-center p-5 rounded-2xl bg-green-900 border-4 border-green-500 shadow-lg mb-4"
// //     >
// //       {/* Reuse your existing song entry UI or extract as a component */}
// //       <img
// //         src={currentPlayingEntry.song.image}
// //         alt={currentPlayingEntry.song.name}
// //         className="w-20 h-20 rounded-xl object-cover border border-green-500 mr-4"
// //       />
// //       <div className="flex-1 text-white font-bold text-lg">
// //         {currentPlayingEntry.song.name}
// //         <span className="ml-2 px-2 py-1 text-xs bg-green-600 rounded">Now Playing</span>
// //         <div className="text-sm text-green-300">
// //           {currentPlayingEntry.song.primaryArtists?.map(a => a.name).join(', ')}
// //         </div>
// //       </div>
// //       {/* Add voting/play count UI if needed */}
// //     </div>
// //   )}
// //     {otherEntries.map((entry) => (

// //             // {leaderboard.map((entry, index) => (
// //               <div
// //                 key={entry.song.id}
// //                 className={`relative flex items-center flex-wrap p-3 sm:p-5 
// //                   rounded-2xl transition-all duration-300 hover:shadow-lg group
// //                   ${entry.rank <= 3 
// //                     ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 shadow-lg' 
// //                     : 'bg-gray-800 border border-gray-700 hover:bg-gray-750'
// //                   }`}
// //               >
// //                 {/* Rank Badge */}
// //                 <div className="flex-shrink-0 mr-2 sm:mr-4">
// //                   <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${getRankBadgeColor(entry.rank)}`}>
// //                     {getRankIcon(entry.rank)}
// //                   </div>
// //                 </div>

// //                 {/* Song Image */}
// //                 <div className="flex-shrink-0 mr-2 sm:mr-4">
// //                   <img
// //                     src={entry.song.image}
// //                     alt={entry.song.name}
// //                     className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-600"
// //                   />
// //                 </div>

// //                 {/* Song Info */}
// //                 <div className="flex-1 min-w-0">
// //                   <h3 className="font-bold text-white truncate max-w-[140px] sm:max-w-none text-sm sm:text-lg mb-0.5">
// //                     {entry.song.name}
// //                   </h3>
// //                   <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-sm text-gray-400 mb-1 sm:mb-2">
// //                     <div className="flex items-center truncate max-w-[100px] sm:max-w-none">
// //                       <User className="w-3 h-3 mr-0.5" />
// //                       <span className="truncate">{entry.song.primaryArtists?.map(a => a.name).join(', ')}</span>
// //                     </div>
// //                     {entry.song.album && (
// //                       <div className="flex items-center truncate max-w-[80px] sm:max-w-none">
// //                         <Disc className="w-3 h-3 mr-0.5" />
// //                         <span className="truncate">{entry.song.album}</span>
// //                       </div>
// //                     )}
// //                     <div className="flex items-center">
// //                       <Clock className="w-3 h-3 mr-0.5" />
// //                       <span>{formatDuration(entry.song.duration)}</span>
// //                     </div>
// //                   </div>
// //                   <div className="text-[9px] sm:text-xs text-gray-500">
// //                     Added: {formatLastPlayed(entry.song.lastPlayed || "")}
// //                   </div>
// //                 </div>

// //                 {/* Voting */}
// //                 <div className="flex-shrink-0 ml-auto mr-2 sm:mr-4">
// //                   <VotingInterface
// //                     entry={entry}
// //                     organizationId={organizationId}
// //                     userId={userId}
// //                     onVote={loadLeaderboard}
// //                     emitSongVoted={emitSongVoted}
// //                     emitSongBoosted={emitSongBoosted}
// //                     canVote={true}
// //                   />
// //                 </div>

// //                 {/* Play Count */}
// //                 <div className="flex-shrink-0 text-right">
// //                   <div className="bg-gradient-to-r from-green-500/20 to-green-400/20 text-green-400 px-2 py-1 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-sm font-bold border border-green-500/30">
// //                     <div className="flex items-center space-x-0.5 sm:space-x-1">
// //                       <Zap className="w-3 h-3" />
// //                       <span>{entry.playCount}</span>
// //                     </div>
// //                     <div className="text-[8px] sm:text-xs text-green-300">
// //                       {entry.playCount === 1 ? 'play' : 'plays'}
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>

// //              ))}
// //            </div>
// //          )}
// //        </div>
// //      </div>
// //   );
// // }