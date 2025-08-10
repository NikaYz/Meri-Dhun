import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, DollarSign, Clock, Zap, TrendingUp } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/song';
import { LeaderboardService } from '@/lib/services/leaderboard';
import { handleBoost as handleStripeBoost } from '../lib/features/handleBoost';

interface VotingInterfaceProps {
  entry: LeaderboardEntry;
  organizationId: string;
  userId: string;
  onVote: () => void;
  canVote: boolean;
  emitSongVoted: (data: { songId: string; userId: string; organizationId: string }) => void;
  emitSongBoosted: (data: { songId: string; userId: string; organizationId: string }) => void;
}

export default function VotingInterface({
  entry,
  organizationId,
  userId,
  onVote,
  canVote,
  emitSongVoted,
  emitSongBoosted,
}: VotingInterfaceProps) {
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostAmount, setBoostAmount] = useState(50);
  const [voting, setVoting] = useState(false);

  const showNotification = (message: string, color: string) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${color} text-white px-6 py-3 rounded-xl shadow-lg z-50 font-semibold`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };
  
  const handleVote = async (voteType: 'up' | 'down') => {
    if (!canVote || voting) return;
    setVoting(true);

    try {
      const result = await LeaderboardService.voteSong(
        organizationId,
        entry.song.id,
        voteType,
        userId
      );

      if (result === 'created') {
        showNotification(`Voted ${voteType}!`, 'bg-gradient-to-r from-green-500 to-green-400');
      } else if (result === 'updated') {
        showNotification(`Changed vote to ${voteType}!`, 'bg-gradient-to-r from-blue-500 to-blue-400');
      } else if (result === 'removed') {
        showNotification(`Removed your ${voteType} vote.`, 'bg-gradient-to-r from-yellow-500 to-yellow-400');
      } else {
        showNotification(`Error: You may have already voted.`, 'bg-gradient-to-r from-red-500 to-red-400');
      }

      onVote();
      emitSongVoted({
        songId: entry.song.id,
        userId,
        organizationId,
      });
    } catch (error) {
      showNotification('Vote failed. Please try again.', 'bg-gradient-to-r from-red-500 to-red-400');
    }

    setVoting(false);
  };

  const handleBoost = async () => {
    try {
      await handleStripeBoost(boostAmount, entry, userId, organizationId);
      setShowBoostModal(false);
    } catch (error) {
      showNotification('Boost failed. Please try again.', 'bg-gradient-to-r from-red-500 to-red-400');
    }
  };

  const canPlay = LeaderboardService.canPlaySong(
    organizationId,
    entry.song.id
  );

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
      {!canPlay && (
        <div className="flex items-center text-orange-400 text-xs bg-orange-500/20 px-2 sm:px-3 py-1 rounded-full border border-orange-500/30">
          <Clock className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Cooldown</span>
          <span className="sm:hidden">CD</span>
        </div>
      )}

      <div className="flex items-center space-x-1 sm:space-x-2">
        <button
          onClick={() => handleVote('up')}
          disabled={!canVote || voting}
          className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
            entry.userVote?.toLowerCase() === "up"
              ? 'bg-green-500/30 text-green-400 border-2 border-green-500/50 shadow-lg shadow-green-500/25'
              : canVote && !voting
              ? 'bg-gray-800 text-green-400 hover:bg-green-500/20 border-2 border-gray-600 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/25'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700'
          }`}
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          <span className="font-bold">{entry.song.upvotes ?? 0}</span>
        </button>

        <button
          onClick={() => handleVote('down')}
          disabled={!canVote || voting}
          className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
            entry.userVote?.toLowerCase() === "down"
              ? 'bg-red-500/30 text-red-400 border-2 border-red-500/50 shadow-lg shadow-red-500/25'
              : canVote && !voting
              ? 'bg-gray-800 text-red-400 hover:bg-red-500/20 border-2 border-gray-600 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/25'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700'
          }`}
        >
          <ThumbsDown className="w-4 h-4 mr-1" />
          <span className="font-bold">{entry?.song?.downvotes ?? 0}</span>
        </button>
      </div>

      <button
        onClick={() => setShowBoostModal(true)}
        className="flex items-center px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 text-yellow-400 hover:from-yellow-500/30 hover:to-yellow-400/30 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 border-2 border-yellow-500/30 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/25"
      >
        <Zap className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Boost</span>
        <span className="sm:hidden">$</span>
      </button>

      {showBoostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Boost This Track</h3>
              <p className="text-gray-400">
                Pay to move this song higher in the queue. Each boost adds significant priority points!
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Choose Boost Level
              </label>
              <select
                value={boostAmount}
                onChange={(e) => setBoostAmount(Number(e.target.value))}
                className="w-full p-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
              >
                <option value={50}>₹30 - Small Boost ⚡</option>
                <option value={90}>₹50 - Medium Boost ⚡⚡</option>
                <option value={150}>₹75 - Large Boost ⚡⚡⚡</option>
                <option value={200}>₹120 - Premium Boost 🚀</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleBoost}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold py-4 px-6 rounded-xl hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Pay ₹{boostAmount}
              </button>
              <button
                onClick={() => setShowBoostModal(false)}
                className="flex-1 bg-gray-700 text-gray-300 py-4 px-6 rounded-xl hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useState } from 'react';
// import { ThumbsUp, ThumbsDown, DollarSign, Clock, Zap, TrendingUp } from 'lucide-react';
// import { LeaderboardEntry } from '@/lib/song';
// import { LeaderboardService } from '@/lib/services/leaderboard';
// import { handleBoost as handleStripeBoost } from '../lib/features/handleBoost';

// interface VotingInterfaceProps {
//   entry: LeaderboardEntry;
//   organizationId: string;
//   userId: string;
//   onVote: () => void;
//   canVote: boolean;
//   emitSongVoted: (data: { songId: string; userId: string; organizationId: string }) => void;
//   emitSongBoosted: (data: { songId: string; userId: string; organizationId: string }) => void;
// }

// export default function VotingInterface({
//   entry,
//   organizationId,
//   userId,
//   onVote,
//   canVote,
//   emitSongVoted,
//   emitSongBoosted,
// }: VotingInterfaceProps) {
//   const [showBoostModal, setShowBoostModal] = useState(false);
//   const [boostAmount, setBoostAmount] = useState(50);
//   const [voting, setVoting] = useState(false);

//   const showNotification = (message: string, color: string) => {
//     const notification = document.createElement('div');
//     notification.className = `fixed top-4 right-4 ${color} text-white px-6 py-3 rounded-xl shadow-lg z-50 font-semibold`;
//     notification.textContent = message;
//     document.body.appendChild(notification);

//     setTimeout(() => {
//       document.body.removeChild(notification);
//     }, 3000);
//   };
  
//   const handleVote = async (voteType: 'up' | 'down') => {
//     if (!canVote || voting) return;
//     setVoting(true);

//     try {
//       const result = await LeaderboardService.voteSong(
//         organizationId,
//         entry.song.id,
//         voteType,
//         userId
//       );

//       if (result === 'created') {
//         showNotification(`Voted ${voteType}!`, 'bg-gradient-to-r from-green-500 to-green-400');
//       } else if (result === 'updated') {
//         showNotification(`Changed vote to ${voteType}!`, 'bg-gradient-to-r from-blue-500 to-blue-400');
//       } else if (result === 'removed') {
//         showNotification(`Removed your ${voteType} vote.`, 'bg-gradient-to-r from-yellow-500 to-yellow-400');
//       } else {
//         showNotification(`Error: You may have already voted.`, 'bg-gradient-to-r from-red-500 to-red-400');
//       }

//       onVote();
//       emitSongVoted({
//         songId: entry.song.id,
//         userId,
//         organizationId,
//       });
//     } catch (error) {
//       showNotification('Vote failed. Please try again.', 'bg-gradient-to-r from-red-500 to-red-400');
//     }

//     setVoting(false);
//   };

//   const handleBoost = async () => {
//     try {
//       await handleStripeBoost(boostAmount, entry, userId, organizationId);
//       setShowBoostModal(false);
//     } catch (error) {
//       showNotification('Boost failed. Please try again.', 'bg-gradient-to-r from-red-500 to-red-400');
//     }
//   };

//   const canPlay = LeaderboardService.canPlaySong(
//     organizationId,
//     entry.song.id
//   );

//   return (
//     <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
//       {!canPlay && (
//         <div className="flex items-center text-orange-400 text-xs bg-orange-500/20 px-2 sm:px-3 py-1 rounded-full border border-orange-500/30">
//           <Clock className="w-3 h-3 mr-1" />
//           <span className="hidden sm:inline">Cooldown</span>
//           <span className="sm:hidden">CD</span>
//         </div>
//       )}

//       <div className="flex items-center space-x-1 sm:space-x-2">
//         <button
//           onClick={() => handleVote('up')}
//           disabled={!canVote || voting}
//           className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
//             entry.userVote?.toLowerCase() === "up"
//               ? 'bg-green-500/30 text-green-400 border-2 border-green-500/50 shadow-lg shadow-green-500/25'
//               : canVote && !voting
//               ? 'bg-gray-800 text-green-400 hover:bg-green-500/20 border-2 border-gray-600 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/25'
//               : 'bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700'
//           }`}
//         >
//           <ThumbsUp className="w-4 h-4 mr-1" />
//           <span className="font-bold">{entry.song.upvotes ?? 0}</span>
//         </button>

//         <button
//           onClick={() => handleVote('down')}
//           disabled={!canVote || voting}
//           className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
//             entry.userVote?.toLowerCase() === "down"
//               ? 'bg-red-500/30 text-red-400 border-2 border-red-500/50 shadow-lg shadow-red-500/25'
//               : canVote && !voting
//               ? 'bg-gray-800 text-red-400 hover:bg-red-500/20 border-2 border-gray-600 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/25'
//               : 'bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700'
//           }`}
//         >
//           <ThumbsDown className="w-4 h-4 mr-1" />
//           <span className="font-bold">{entry?.song?.downvotes ?? 0}</span>
//         </button>
//       </div>

//       <button
//         onClick={() => setShowBoostModal(true)}
//         className="flex items-center px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 text-yellow-400 hover:from-yellow-500/30 hover:to-yellow-400/30 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 border-2 border-yellow-500/30 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/25"
//       >
//         <Zap className="w-4 h-4 mr-1" />
//         <span className="hidden sm:inline">Boost</span>
//         <span className="sm:hidden">$</span>
//       </button>

//       {showBoostModal && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-gray-900 border-2 border-gray-700 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <TrendingUp className="w-8 h-8 text-black" />
//               </div>
//               <h3 className="text-2xl font-bold text-white mb-2">Boost This Track</h3>
//               <p className="text-gray-400">
//                 Pay to move this song higher in the queue. Each boost adds significant priority points!
//               </p>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-300 mb-3">
//                 Choose Boost Level
//               </label>
//               <select
//                 value={boostAmount}
//                 onChange={(e) => setBoostAmount(Number(e.target.value))}
//                 className="w-full p-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
//               >
//                 <option value={50}>₹30 - Small Boost ⚡</option>
//                 <option value={90}>₹50 - Medium Boost ⚡⚡</option>
//                 <option value={150}>₹75 - Large Boost ⚡⚡⚡</option>
//                 <option value={200}>₹120 - Premium Boost 🚀</option>
//               </select>
//             </div>

//             <div className="flex space-x-3">
//               <button
//                 onClick={handleBoost}
//                 className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold py-4 px-6 rounded-xl hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
//               >
//                 Pay ₹{boostAmount}
//               </button>
//               <button
//                 onClick={() => setShowBoostModal(false)}
//                 className="flex-1 bg-gray-700 text-gray-300 py-4 px-6 rounded-xl hover:bg-gray-600 transition-colors font-semibold"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }