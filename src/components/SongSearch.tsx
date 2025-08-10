import React, { useState, useEffect, useRef } from 'react';
import { Search, Music, Clock, User, Disc, Play, Headphones, Zap, TrendingUp } from 'lucide-react';
import { JioSaavnService } from '@/lib/services/jiosavaan';
import { LeaderboardService } from '@/lib/services/leaderboard';
import { Song } from '@/lib/song';

interface SongSearchProps {
  organizationId: string;
  onSongPlay?: (song: Song) => void;
}

export default function SongSearch({ organizationId, onSongPlay }: SongSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      const searchResults = await JioSaavnService.searchSongs(query);
      setResults(searchResults);
      setShowResults(true);
      setLoading(false);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSongSelect = (song: Song) => {
    LeaderboardService.addSongPlay(organizationId, song);
    onSongPlay?.(song);
    setQuery('');
    setShowResults(false);
    setResults([]);
  };

  const formatDuration = (duration: string) => {
    const seconds = parseInt(duration);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-3 space-y-3 sm:space-y-0">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center flex-shrink-0">
            <Headphones className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Find Your Perfect Track</h2>
            <p className="text-gray-400">Search from millions of songs and add them to the queue</p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-2xl mx-auto px-4">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs, artists, or albums..."
          className="w-full pl-16 pr-6 py-5 text-lg bg-gray-900 border-2 border-gray-700 rounded-2xl focus:border-green-500 focus:outline-none transition-all duration-300 text-white placeholder-gray-400 shadow-lg"
        />
        {loading && (
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl mx-4">
          <div className="p-4 sm:p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-2 sm:space-y-0">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span>Search Results</span>
              </h3>
              <span className="text-sm text-gray-400">{results.length} tracks found</span>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {results.map((song, index) => (
              <div
                key={song.id}
                onClick={() => handleSongSelect(song)}
                className="flex flex-col sm:flex-row sm:items-center p-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-b-0 transition-all duration-300 group"
              >
                <div className="relative flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                  <img
                    src={song.image}
                    alt={song.name}
                    className="w-16 h-16 rounded-xl object-cover shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                  <h3 className="font-bold text-white truncate text-lg group-hover:text-green-400 transition-colors duration-300">
                    {song.name}
                  </h3>
                  <div className="flex flex-wrap items-center text-sm text-gray-400 mt-1 space-x-3">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      <span className="truncate">{song.primaryArtists?.map((artist) => artist.name).join(', ')}</span>
                    </div>
                    {song.album && (
                      <div className="flex items-center">
                        <Disc className="w-3 h-3 mr-1" />
                        <span className="truncate">{song.album}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDuration(song.duration)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full sm:w-auto flex-shrink-0 sm:ml-4">
                  <button className="bg-gradient-to-r from-green-500 to-green-400 text-black px-4 py-2 w-full rounded-full text-sm font-bold opacity-100 transition-all duration-300 transform sm:opacity-0 sm:group-hover:opacity-100 sm:group-hover:scale-105 flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Add to Queue</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showResults && results.length === 0 && !loading && query.trim().length >= 2 && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 sm:p-12 text-center shadow-2xl mx-4">
          <Music className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <h3 className="text-white text-xl font-bold mb-2">No tracks found</h3>
          <p className="text-gray-400 mb-4">We couldn't find any songs matching "{query}"</p>
          <p className="text-gray-500 text-sm">Try searching with different keywords or artist names</p>
        </div>
      )}

      {!showResults && !loading && (
        <div className="text-center py-12 px-4">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Start typing to search</h3>
          <p className="text-gray-500">Discover millions of tracks and add them to the queue</p>
        </div>
      )}
    </div>
  );
}
// import React, { useState, useEffect, useRef } from 'react';
// import { Search, Music, Clock, User, Disc, Play, Headphones, Zap, TrendingUp } from 'lucide-react';
// import { JioSaavnService } from '@/lib/services/jiosavaan';
// import { LeaderboardService } from '@/lib/services/leaderboard';
// import { Song } from '@/lib/song';

// interface SongSearchProps {
//   organizationId: string;
//   onSongPlay?: (song: Song) => void;
// }

// export default function SongSearch({ organizationId, onSongPlay }: SongSearchProps) {
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState<Song[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [showResults, setShowResults] = useState(false);
//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }
//     if (query.trim().length < 2) {
//       setResults([]);
//       setShowResults(false);
//       return;
//     }
//     searchTimeoutRef.current = setTimeout(async () => {
//       setLoading(true);
//       const searchResults = await JioSaavnService.searchSongs(query);
//       setResults(searchResults);
//       setShowResults(true);
//       setLoading(false);
//     }, 500);

//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, [query]);

//   const handleSongSelect = (song: Song) => {
//     LeaderboardService.addSongPlay(organizationId, song);
//     onSongPlay?.(song);
//     setQuery('');
//     setShowResults(false);
//     setResults([]);
//   };

//   const formatDuration = (duration: string) => {
//     const seconds = parseInt(duration);
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div className="space-y-6">
//       {/* Search Header */}
//       <div className="text-center space-y-4">
//         <div className="flex items-center justify-center space-x-3">
//           <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center">
//             <Headphones className="w-6 h-6 text-black" />
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold text-white">Find Your Perfect Track</h2>
//             <p className="text-gray-400">Search from millions of songs and add them to the queue</p>
//           </div>
//         </div>
//       </div>

//       {/* Search Input */}
//       <div className="relative max-w-2xl mx-auto">
//         <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Search for songs, artists, or albums..."
//           className="w-full pl-16 pr-6 py-5 text-lg bg-gray-900 border-2 border-gray-700 rounded-2xl focus:border-green-500 focus:outline-none transition-all duration-300 text-white placeholder-gray-400 shadow-lg"
//         />
//         {loading && (
//           <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
//             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
//           </div>
//         )}
//       </div>

//       {/* Search Results */}
//       {showResults && results.length > 0 && (
//         <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
//           <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
//                 <TrendingUp className="w-5 h-5 text-green-400" />
//                 <span>Search Results</span>
//               </h3>
//               <span className="text-sm text-gray-400">{results.length} tracks found</span>
//             </div>
//           </div>
//           <div className="max-h-96 overflow-y-auto">
//             {results.map((song, index) => (
//               <div
//                 key={song.id}
//                 onClick={() => handleSongSelect(song)}
//                 className="flex items-center p-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-b-0 transition-all duration-300 group"
//               >
//                 <div className="relative flex-shrink-0 mr-4">
//                   <img
//                     src={song.image}
//                     alt={song.name}
//                     className="w-16 h-16 rounded-xl object-cover shadow-lg"
//                   />
//                   <div className="absolute inset-0 bg-black bg-opacity-60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                     <Play className="w-6 h-6 text-green-400" />
//                   </div>
//                   <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                     {index + 1}
//                   </div>
//                 </div>
                
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-bold text-white truncate text-lg group-hover:text-green-400 transition-colors duration-300">
//                     {song.name}
//                   </h3>
//                   <div className="flex items-center text-sm text-gray-400 mt-1 space-x-3">
//                     <div className="flex items-center">
//                       <User className="w-3 h-3 mr-1" />
//                       <span className="truncate">{song.primaryArtists?.map((artist) => artist.name).join(', ')}</span>
//                     </div>
//                     {song.album && (
//                       <div className="flex items-center">
//                         <Disc className="w-3 h-3 mr-1" />
//                         <span className="truncate">{song.album}</span>
//                       </div>
//                     )}
//                     <div className="flex items-center">
//                       <Clock className="w-3 h-3 mr-1" />
//                       <span>{formatDuration(song.duration)}</span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="flex-shrink-0 ml-4">
//                   <div className="bg-gradient-to-r from-green-500 to-green-400 text-black px-4 py-2 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105 flex items-center space-x-2">
//                     <Zap className="w-4 h-4" />
//                     <span>Add to Queue</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {showResults && results.length === 0 && !loading && query.trim().length >= 2 && (
//         <div className="bg-gray-900 border border-gray-700 rounded-2xl p-12 text-center shadow-2xl">
//           <Music className="w-20 h-20 text-gray-600 mx-auto mb-6" />
//           <h3 className="text-white text-xl font-bold mb-2">No tracks found</h3>
//           <p className="text-gray-400 mb-4">We couldn't find any songs matching "{query}"</p>
//           <p className="text-gray-500 text-sm">Try searching with different keywords or artist names</p>
//         </div>
//       )}

//       {!showResults && !loading && (
//         <div className="text-center py-12">
//           <div className="flex items-center justify-center space-x-4 mb-6">
//             <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center">
//               <Search className="w-8 h-8 text-gray-400" />
//             </div>
//           </div>
//           <h3 className="text-xl font-semibold text-gray-400 mb-2">Start typing to search</h3>
//           <p className="text-gray-500">Discover millions of tracks and add them to the queue</p>
//         </div>
//       )}
//     </div>
//   );
// }