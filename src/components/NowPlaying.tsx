import React, { useEffect, useState, useCallback } from 'react';
import { Song } from '@/lib/song';
import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
import Image from 'next/image';

interface NowPlayingProps {
  song: Song | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  setSong: (s: Song | null) => void;
  isDJ: boolean;
  onSkip: () => void;
  emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
  onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
  offPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
  // offPlaybackUpdate: (callback: (data?: any) => void) => void;
  organizationId: string,
}

export default function NowPlaying({
  song,
  audioRef,
  isDJ,
  onSkip,
  emitPlaybackUpdate,
  onPlaybackUpdate,
  offPlaybackUpdate,
}: NowPlayingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
  const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
  const [volume, setVolume] = useState(initialVolume);

  const handleSkipClick = () => {
    console.log("Skipping the song from DJ controls.");
    onSkip();
  };

  // DJ's logic to handle song ending
  useEffect(() => {
    if (!isDJ) return;
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      console.log("Song ended, fetching next from queue.");
      onSkip();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [isDJ, audioRef, onSkip]);

  // DJ's logic to broadcast playback position
  useEffect(() => {
    if (!isDJ) return;
    const audio = audioRef.current;
    if (!audio) return;

    const interval = setInterval(() => {
      emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
    }, 500);

    return () => clearInterval(interval);
  }, [isDJ, song, audioRef, emitPlaybackUpdate]);

  // This hook handles the main audio element logic, including setting source
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song?.downloadUrl) return;

    const handleMetadataLoaded = () => {
      setIsAudioReady(true);
      setDuration(audio.duration);
    };
    
    // Check if metadata is already loaded
    if (audio.readyState >= 1) { 
      setIsAudioReady(true);
      setDuration(audio.duration);
    } else {
      setIsAudioReady(false);
    }

    // Set the audio source if it's a new song
    if (audio.src !== song.downloadUrl) {
      audio.src = song.downloadUrl;
      audio.load();
      audio.dataset.songId = String(song.id); 
    }

    // Set volume and mute for non-DJs
    audio.volume = volume;
    if (!isDJ) audio.muted = true;

    // DJ-specific event listeners
    if (isDJ) {
      const onTimeUpdate = () => setCurrentTime(audio.currentTime);
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('loadedmetadata', handleMetadataLoaded);
      
      return () => {
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
      };
    } else {
      // For non-DJs, we only need to listen for metadata to know the song is ready
      audio.addEventListener('loadedmetadata', handleMetadataLoaded);
      return () => {
        audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
      };
    }
  }, [song?.id, song?.downloadUrl, audioRef, isDJ, volume]);

  // Non-DJ's logic to sync with the DJ's playback
  const handlePlaybackUpdate = useCallback(({ time, isPlaying: newIsPlaying }: { time: number; isPlaying: boolean }) => {
    const audio = audioRef.current;
    if (!audio || !isAudioReady) { // Only sync if the audio element is ready
      return;
    }

    const timeDifference = Math.abs(audio.currentTime - time);
    if (timeDifference > 1) { // Sync if difference is more than 1 second to avoid excessive syncing
      audio.currentTime = time;
    }
    
    setCurrentTime(time);
    setIsPlaying(newIsPlaying);
    
    if (newIsPlaying && audio.paused) {
      audio.play().catch(console.error);
    } else if (!newIsPlaying && !audio.paused) {
      audio.pause();
    }
  }, [audioRef, isAudioReady]);

  useEffect(() => {
    if (isDJ) return;

    onPlaybackUpdate(handlePlaybackUpdate);
    return () => offPlaybackUpdate(handlePlaybackUpdate);
  }, [isDJ, handlePlaybackUpdate, onPlaybackUpdate, offPlaybackUpdate]);


  const togglePlay = () => {
    if (!isDJ) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isDJ || !isAudioReady) return;
    
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isDJ) return;
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    const audio = audioRef.current;
    if (audio) audio.volume = newVolume;
    sessionStorage.setItem("volume", newVolume.toString());
  };

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!song) {
    return (
      <div className="w-full max-w-full bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-400 p-4 text-black">
          <h2 className="text-xl font-bold mb-1">Now Playing</h2>
          <div className="flex items-center text-black/80">
            <div className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-2xl bg-gray-800/50 flex items-center justify-center shadow-lg">
              <Music className="w-10 h-10 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Ready to start the music?</h3>
              <p className="text-sm text-gray-400">Search and add the first song to get the party started!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-400 p-4 text-black">
        <h2 className="text-xl font-bold mb-1">Now Playing</h2>
        <div className="flex items-center text-black/80">
          <div className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm">Live</span>
        </div>
      </div>

      <div className="p-6">
        {/* Everything stacked vertically */}
        <div className="flex flex-col items-center space-y-6">
          {/* Album Art - Centered */}
          <div className="flex-shrink-0 w-full flex justify-center">
            <Image
              src={song.image}
              alt={song.name}
              width={80}
              height={80}
              className="w-32 h-32 rounded-2xl object-cover shadow-lg"
            />
          </div>

          {/* Song Info - Centered */}
          <div className="w-full text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">{song.name}</h3>
              <p className="text-sm text-gray-400">
                By: {song.primaryArtists?.map(a => a.name).join(', ')}
              </p>
              {song.album && (
                <p className="text-xs text-gray-500">Album: {song.album}</p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(parseInt(song.duration))}</span>
              </div>
              <div className="relative">
                <div className="w-full h-2 bg-gray-800 rounded-full">
                  <div
                    className="h-2 bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercentage}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                  disabled={!isDJ || !isAudioReady}
                />
              </div>
            </div>

            {/* Controls */}
            {isDJ ? (
              <div className="w-full flex flex-col items-center space-y-4">
                {/* Play Controls */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-green-400 text-black rounded-full hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                  <button
                    onClick={handleSkipClick}
                    className="flex items-center justify-center w-12 h-12 bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center justify-center space-x-3 w-full max-w-xs">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={handleVolumeChange}
                    className="accent-green-500 w-24 sm:w-20 "
                  />
                  <span className="text-xs text-gray-400 w-10 text-right">{Math.round(volume * 100)}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Listening to live stream</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// import React, { useEffect, useState, useCallback } from 'react';
// import { Song } from '@/lib/song';
// import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';

// interface NowPlayingProps {
//   song: Song | null;
//   audioRef: React.RefObject<HTMLAudioElement | null>;
//   setSong: (s: Song | null) => void;
//   isDJ: boolean;
//   onSkip: () => void;
//   emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
//   onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
//   offPlaybackUpdate: (callback: (data?: any) => void) => void;
//   organizationId: string,
// }

// export default function NowPlaying({
//   song,
//   audioRef,
//   setSong,
//   isDJ,
//   onSkip,
//   organizationId,
//   emitPlaybackUpdate,
//   onPlaybackUpdate,
//   offPlaybackUpdate,
// }: NowPlayingProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [isAudioReady, setIsAudioReady] = useState(false);
//   const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
//   const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
//   const [volume, setVolume] = useState(initialVolume);

//   const handleSkipClick = () => {
//     console.log("Skipping the song from DJ controls.");
//     onSkip();
//   };

//   // DJ's logic to handle song ending
//   useEffect(() => {
//     if (!isDJ) return;
//     const audio = audioRef.current;
//     if (!audio) return;

//     const handleEnded = () => {
//       console.log("Song ended, fetching next from queue.");
//       onSkip();
//     };

//     audio.addEventListener('ended', handleEnded);
//     return () => audio.removeEventListener('ended', handleEnded);
//   }, [isDJ, audioRef, onSkip]);

//   // DJ's logic to broadcast playback position
//   useEffect(() => {
//     if (!isDJ) return;
//     const audio = audioRef.current;
//     if (!audio) return;

//     const interval = setInterval(() => {
//       emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
//     }, 500);

//     return () => clearInterval(interval);
//   }, [isDJ, song, audioRef, emitPlaybackUpdate]);

//   // This hook handles the main audio element logic, including setting source
//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio || !song?.downloadUrl) return;

//     const handleMetadataLoaded = () => {
//       setIsAudioReady(true);
//       setDuration(audio.duration);
//     };
    
//     // Check if metadata is already loaded
//     if (audio.readyState >= 1) { 
//       setIsAudioReady(true);
//       setDuration(audio.duration);
//     } else {
//       setIsAudioReady(false);
//     }

//     // Set the audio source if it's a new song
//     if (audio.src !== song.downloadUrl) {
//       audio.src = song.downloadUrl;
//       audio.load();
//       audio.dataset.songId = String(song.id); 
//     }

//     // Set volume and mute for non-DJs
//     audio.volume = volume;
//     if (!isDJ) audio.muted = true;

//     // DJ-specific event listeners
//     if (isDJ) {
//       const onTimeUpdate = () => setCurrentTime(audio.currentTime);
//       const onPlay = () => setIsPlaying(true);
//       const onPause = () => setIsPlaying(false);

//       audio.addEventListener('timeupdate', onTimeUpdate);
//       audio.addEventListener('play', onPlay);
//       audio.addEventListener('pause', onPause);
//       audio.addEventListener('loadedmetadata', handleMetadataLoaded);
      
//       return () => {
//         audio.removeEventListener('timeupdate', onTimeUpdate);
//         audio.removeEventListener('play', onPlay);
//         audio.removeEventListener('pause', onPause);
//         audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
//       };
//     } else {
//       // For non-DJs, we only need to listen for metadata to know the song is ready
//       audio.addEventListener('loadedmetadata', handleMetadataLoaded);
//       return () => {
//         audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
//       };
//     }
//   }, [song?.id, song?.downloadUrl, audioRef, isDJ, volume]);

//   // Non-DJ's logic to sync with the DJ's playback
//   const handlePlaybackUpdate = useCallback(({ time, isPlaying: newIsPlaying }: { time: number; isPlaying: boolean }) => {
//     const audio = audioRef.current;
//     if (!audio || !isAudioReady) { // Only sync if the audio element is ready
//       return;
//     }

//     const timeDifference = Math.abs(audio.currentTime - time);
//     if (timeDifference > 1) { // Sync if difference is more than 1 second to avoid excessive syncing
//       audio.currentTime = time;
//     }
    
//     setCurrentTime(time);
//     setIsPlaying(newIsPlaying);
    
//     if (newIsPlaying && audio.paused) {
//       audio.play().catch(console.error);
//     } else if (!newIsPlaying && !audio.paused) {
//       audio.pause();
//     }
//   }, [audioRef, isAudioReady]);

//   useEffect(() => {
//     if (isDJ) return;

//     onPlaybackUpdate(handlePlaybackUpdate);
//     return () => offPlaybackUpdate(handlePlaybackUpdate);
//   }, [isDJ, handlePlaybackUpdate, onPlaybackUpdate, offPlaybackUpdate]);


//   const togglePlay = () => {
//     if (!isDJ) return;
//     const audio = audioRef.current;
//     if (!audio) return;

//     if (audio.paused) {
//       audio.play().catch(console.error);
//     } else {
//       audio.pause();
//     }
//   };
  
//   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!isDJ || !isAudioReady) return;
    
//     const audio = audioRef.current;
//     if (!audio) return;

//     const newTime = (parseFloat(e.target.value) / 100) * duration;
//     audio.currentTime = newTime;
//     setCurrentTime(newTime);
//   };

//   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!isDJ) return;
//     const newVolume = parseFloat(e.target.value) / 100;
//     setVolume(newVolume);
//     const audio = audioRef.current;
//     if (audio) audio.volume = newVolume;
//     sessionStorage.setItem("volume", newVolume.toString());
//   };

//   const formatTime = (sec: number) => {
//     if (isNaN(sec)) return '0:00';
//     const minutes = Math.floor(sec / 60);
//     const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
//     return `${minutes}:${seconds}`;
//   };

//   const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

//   if (!song) {
//     return (
//       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//         <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
//           <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
//           <div className="flex items-center text-purple-100">
//             <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
//             Live
//           </div>
//         </div>
//         <div className="p-4 sm:p-8 flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 text-center md:text-left">
//           {/* MODIFIED: Use a relative width for the image container on small screens */}
//           <div className="flex-shrink-0 w-1/2 max-w-[128px] mx-auto md:w-48 md:h-48">
//             <div className="w-full h-full rounded-xl bg-gray-200 flex items-center justify-center shadow-lg">
//               <Music className="w-1/2 h-1/2 text-gray-500" />
//             </div>
//           </div>
//           <div className="flex-1 min-w-0">
//             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Ready to start the music?</h3>
//             <p className="text-sm md:text-lg text-gray-600">Search and add the first song to get the party started!</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden ">
//       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
//         <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
//         <div className="flex items-center text-purple-100">
//           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
//           Live
//         </div>
//       </div>

//       <div className="p-4 sm:p-2">
//         <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
//           {/* MODIFIED: Use a relative width for the image container on small screens */}
//           <div className="flex-shrink-0 w-1/2 max-w-[128px] mx-auto md:w-48 md:h-48 px-1">
//             <img
//               src={song.image}
//               alt={song.name}
//               className="w-full h-full aspect-square rounded-xl object-cover shadow-lg"
//             />
//           </div>

//           <div className="flex-1 min-w-0 text-center md:text-left ">
//             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
//             <p className="text-sm md:text-lg text-gray-600 mb-4 truncate">
//                By: {song.primaryArtists?.map(a => a.name).join(', ')}
//             </p>
//             {song.album && (
//               <p className="text-xs md:text-sm text-gray-500 mb-4">Album: {song.album}</p>
//             )}

//             <div className="space-y-2">
//               <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
//                 <span>{formatTime(currentTime)}</span>
//                 <span>{formatTime(parseInt(song.duration))}</span>
//               </div>
//               <div className="relative">
//                 <div className="w-full h-2 bg-gray-200 rounded-full">
//                   <div
//                     className="h-2 bg-purple-600 rounded-full transition-all duration-300"
//                     style={{ width: `${progressPercentage}%` }}
//                   ></div>
//                 </div>
//                 <input
//                   type="range"
//                   min="0"
//                   max="100"
//                   value={progressPercentage}
//                   onChange={handleSeek}
//                   className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
//                   disabled={!isDJ || !isAudioReady}
//                 />
//               </div>
//             </div>

//             {isDJ ? (
//               <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
//                 <div className="flex items-center space-x-4">
//                   <button
//                     onClick={togglePlay}
//                     className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
//                   >
//                     {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
//                   </button>
//                   <button
//                     onClick={handleSkipClick}
//                     className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
//                   >
//                     <SkipForward className="w-5 h-5" />
//                   </button>
//                 </div>

//                 <div className="flex items-center space-x-2 w-full sm:w-auto mt-4 sm:mt-0 justify-center">
//                   <Volume2 className="w-5 h-5 text-gray-600" />
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={volume * 100}
//                     onChange={handleVolumeChange}
//                     className="w-24 sm:w-20"
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div className="mt-6 text-sm text-gray-500 text-center">
//                 You are listening to the live stream
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// // 'use client';
// // import React, { useEffect, useState, useCallback } from 'react';
// // import { Song } from '@/lib/song';
// // import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';

// // interface NowPlayingProps {
// //   song: Song | null;
// //   audioRef: React.RefObject<HTMLAudioElement | null>;
// //   setSong: (s: Song | null) => void;
// //   isDJ: boolean;
// //   onSkip: () => void;
// //   emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
// //   onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
// //   offPlaybackUpdate: (callback: (data?: any) => void) => void;
// //   // NOTE: emitSkipSong, onSkipSong, and offSkipSong are removed as per the new workflow
// //   organizationId: string,
// // }

// // export default function NowPlaying({
// //   song,
// //   audioRef,
// //   setSong,
// //   isDJ,
// //   onSkip,
// //   organizationId,
// //   emitPlaybackUpdate,
// //   onPlaybackUpdate,
// //   offPlaybackUpdate,
// // }: NowPlayingProps) {
// //   const [isPlaying, setIsPlaying] = useState(false);
// //   const [currentTime, setCurrentTime] = useState(0);
// //   const [duration, setDuration] = useState(0);
// //   const [isAudioReady, setIsAudioReady] = useState(false);
// //   const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
// //   const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
// //   const [volume, setVolume] = useState(initialVolume);

// //   const handleSkipClick = () => {
// //     console.log("Skipping the song from DJ controls.");
// //     onSkip();
// //   };

// //   // DJ's logic to handle song ending
// //   useEffect(() => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const handleEnded = () => {
// //       console.log("Song ended, fetching next from queue.");
// //       onSkip();
// //     };

// //     audio.addEventListener('ended', handleEnded);
// //     return () => audio.removeEventListener('ended', handleEnded);
// //   }, [isDJ, audioRef, onSkip]);

// //   // DJ's logic to broadcast playback position
// //   useEffect(() => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const interval = setInterval(() => {
// //       emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
// //     }, 500);

// //     return () => clearInterval(interval);
// //   }, [isDJ, song, audioRef, emitPlaybackUpdate]);

// //   // This hook handles the main audio element logic, including setting source
// //   useEffect(() => {
// //     const audio = audioRef.current;
// //     if (!audio || !song?.downloadUrl) return;

// //     const handleMetadataLoaded = () => {
// //       setIsAudioReady(true);
// //       setDuration(audio.duration);
// //     };
    
// //     // Check if metadata is already loaded
// //     if (audio.readyState >= 1) { 
// //       setIsAudioReady(true);
// //       setDuration(audio.duration);
// //     } else {
// //       setIsAudioReady(false);
// //     }

// //     // Set the audio source if it's a new song
// //     if (audio.src !== song.downloadUrl) {
// //       audio.src = song.downloadUrl;
// //       audio.load();
// //       audio.dataset.songId = String(song.id); 
// //     }

// //     // Set volume and mute for non-DJs
// //     audio.volume = volume;
// //     if (!isDJ) audio.muted = true;

// //     // DJ-specific event listeners
// //     if (isDJ) {
// //       const onTimeUpdate = () => setCurrentTime(audio.currentTime);
// //       const onPlay = () => setIsPlaying(true);
// //       const onPause = () => setIsPlaying(false);

// //       audio.addEventListener('timeupdate', onTimeUpdate);
// //       audio.addEventListener('play', onPlay);
// //       audio.addEventListener('pause', onPause);
// //       audio.addEventListener('loadedmetadata', handleMetadataLoaded);
      
// //       return () => {
// //         audio.removeEventListener('timeupdate', onTimeUpdate);
// //         audio.removeEventListener('play', onPlay);
// //         audio.removeEventListener('pause', onPause);
// //         audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
// //       };
// //     } else {
// //       // For non-DJs, we only need to listen for metadata to know the song is ready
// //       audio.addEventListener('loadedmetadata', handleMetadataLoaded);
// //       return () => {
// //         audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
// //       };
// //     }
// //   }, [song?.id, song?.downloadUrl, audioRef, isDJ, volume]);

// //   // Non-DJ's logic to sync with the DJ's playback
// //   const handlePlaybackUpdate = useCallback(({ time, isPlaying: newIsPlaying }: { time: number; isPlaying: boolean }) => {
// //     const audio = audioRef.current;
// //     if (!audio || !isAudioReady) { // Only sync if the audio element is ready
// //       return;
// //     }

// //     const timeDifference = Math.abs(audio.currentTime - time);
// //     if (timeDifference > 1) { // Sync if difference is more than 1 second to avoid excessive syncing
// //       audio.currentTime = time;
// //     }
    
// //     setCurrentTime(time);
// //     setIsPlaying(newIsPlaying);
    
// //     if (newIsPlaying && audio.paused) {
// //       audio.play().catch(console.error);
// //     } else if (!newIsPlaying && !audio.paused) {
// //       audio.pause();
// //     }
// //   }, [audioRef, isAudioReady]);

// //   useEffect(() => {
// //     if (isDJ) return;

// //     onPlaybackUpdate(handlePlaybackUpdate);
// //     return () => offPlaybackUpdate(handlePlaybackUpdate);
// //   }, [isDJ, handlePlaybackUpdate, onPlaybackUpdate, offPlaybackUpdate]);


// //   const togglePlay = () => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     if (audio.paused) {
// //       audio.play().catch(console.error);
// //     } else {
// //       audio.pause();
// //     }
// //   };
  
// //   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!isDJ || !isAudioReady) return;
    
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const newTime = (parseFloat(e.target.value) / 100) * duration;
// //     audio.currentTime = newTime;
// //     setCurrentTime(newTime);
// //   };

// //   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!isDJ) return;
// //     const newVolume = parseFloat(e.target.value) / 100;
// //     setVolume(newVolume);
// //     const audio = audioRef.current;
// //     if (audio) audio.volume = newVolume;
// //     sessionStorage.setItem("volume", newVolume.toString());
// //   };

// //   const formatTime = (sec: number) => {
// //     if (isNaN(sec)) return '0:00';
// //     const minutes = Math.floor(sec / 60);
// //     const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
// //     return `${minutes}:${seconds}`;
// //   };

// //   const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

// //   if (!song) {
// //     return (
// //       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// //         <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// //           <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// //           <div className="flex items-center text-purple-100">
// //             <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// //             Live
// //           </div>
// //         </div>
// //         <div className="p-4 sm:p-8 flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 text-center md:text-left">
// //           {/* Use explicit widths for mobile to prevent overflow */}
// //           <div className="flex-shrink-0 w-32 h-32 mx-auto md:w-48 md:h-48">
// //             <div className="w-full h-full rounded-xl bg-gray-200 flex items-center justify-center shadow-lg">
// //               <Music className="w-1/2 h-1/2 text-gray-500" />
// //             </div>
// //           </div>
// //           <div className="flex-1 min-w-0">
// //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Ready to start the music?</h3>
// //             <p className="text-sm md:text-lg text-gray-600">Search and add the first song to get the party started!</p>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// //       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// //         <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// //         <div className="flex items-center text-purple-100">
// //           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// //           Live
// //         </div>
// //       </div>

// //       <div className="p-4 sm:p-2">
// //         <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
// //           {/* Use explicit widths for mobile to prevent overflow */}
// //           <div className="flex-shrink-0 w-32 h-32 mx-auto md:w-48 md:h-48">
// //             <img
// //               src={song.image}
// //               alt={song.name}
// //               className="w-full h-full aspect-square rounded-xl object-cover shadow-lg"
// //             />
// //           </div>

// //           <div className="flex-1 min-w-0 text-center md:text-left">
// //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
// //             <p className="text-sm md:text-lg text-gray-600 mb-4 truncate">
// //                By: {song.primaryArtists?.map(a => a.name).join(', ')}
// //             </p>
// //             {song.album && (
// //               <p className="text-xs md:text-sm text-gray-500 mb-4">Album: {song.album}</p>
// //             )}

// //             <div className="space-y-2">
// //               <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
// //                 <span>{formatTime(currentTime)}</span>
// //                 <span>{formatTime(parseInt(song.duration))}</span>
// //               </div>
// //               <div className="relative">
// //                 <div className="w-full h-2 bg-gray-200 rounded-full">
// //                   <div
// //                     className="h-2 bg-purple-600 rounded-full transition-all duration-300"
// //                     style={{ width: `${progressPercentage}%` }}
// //                   ></div>
// //                 </div>
// //                 <input
// //                   type="range"
// //                   min="0"
// //                   max="100"
// //                   value={progressPercentage}
// //                   onChange={handleSeek}
// //                   className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
// //                   disabled={!isDJ || !isAudioReady}
// //                 />
// //               </div>
// //             </div>

// //             {isDJ ? (
// //               <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
// //                 <div className="flex items-center space-x-4">
// //                   <button
// //                     onClick={togglePlay}
// //                     className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
// //                   >
// //                     {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
// //                   </button>
// //                   <button
// //                     onClick={handleSkipClick}
// //                     className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
// //                   >
// //                     <SkipForward className="w-5 h-5" />
// //                   </button>
// //                 </div>

// //                 <div className="flex items-center space-x-2 w-full sm:w-auto mt-4 sm:mt-0 justify-center">
// //                   <Volume2 className="w-5 h-5 text-gray-600" />
// //                   <input
// //                     type="range"
// //                     min="0"
// //                     max="100"
// //                     value={volume * 100}
// //                     onChange={handleVolumeChange}
// //                     className="w-24 sm:w-20"
// //                   />
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="mt-6 text-sm text-gray-500 text-center">
// //                 You are listening to the live stream
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // 'use client';
// // import React, { useEffect, useState, useCallback } from 'react';
// // import { Song } from '@/lib/song';
// // import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
// // import { fetchSongDetails } from '@/lib/features/getSong';

// // interface NowPlayingProps {
// //   song: Song | null;
// //   audioRef: React.RefObject<HTMLAudioElement | null>;
// //   setSong: (s: Song | null) => void;
// //   isDJ: boolean;
// //   onSkip: () => void;
// //   emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
// //   onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
// //   offPlaybackUpdate: (callback: (data?: any) => void) => void;
// //   // NOTE: emitSkipSong, onSkipSong, and offSkipSong are removed as per the new workflow
// //   organizationId: string,
// // }

// // export default function NowPlaying({
// //   song,
// //   audioRef,
// //   setSong,
// //   isDJ,
// //   onSkip,
// //   organizationId,
// //   emitPlaybackUpdate,
// //   onPlaybackUpdate,
// //   offPlaybackUpdate,
// // }: NowPlayingProps) {
// //   const [isPlaying, setIsPlaying] = useState(false);
// //   const [currentTime, setCurrentTime] = useState(0);
// //   const [duration, setDuration] = useState(0);
// //   const [isAudioReady, setIsAudioReady] = useState(false);
// //   const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
// //   const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
// //   const [volume, setVolume] = useState(initialVolume);

// //   const handleSkipClick = () => {
// //     console.log("Skipping the song from DJ controls.");
// //     onSkip();
// //   };

// //   // DJ's logic to handle song ending
// //   useEffect(() => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const handleEnded = () => {
// //       console.log("Song ended, fetching next from queue.");
// //       onSkip();
// //     };

// //     audio.addEventListener('ended', handleEnded);
// //     return () => audio.removeEventListener('ended', handleEnded);
// //   }, [isDJ, audioRef, onSkip]);

// //   // DJ's logic to broadcast playback position
// //   useEffect(() => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const interval = setInterval(() => {
// //       emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
// //     }, 500);

// //     return () => clearInterval(interval);
// //   }, [isDJ, song, audioRef, emitPlaybackUpdate]);

// //   // This hook handles the main audio element logic, including setting source
// //   // NOTE: `volume` has been removed from the dependency array to prevent the song from pausing
// //   // when the volume is changed.
// //   useEffect(() => {
// //     const audio = audioRef.current;
// //     if (!audio || !song?.downloadUrl) return;

// //     const handleMetadataLoaded = () => {
// //       setIsAudioReady(true);
// //       setDuration(audio.duration);
// //     };
    
// //     // Check if metadata is already loaded
// //     if (audio.readyState >= 1) { 
// //       setIsAudioReady(true);
// //       setDuration(audio.duration);
// //     } else {
// //       setIsAudioReady(false);
// //     }

// //     // Set the audio source if it's a new song
// //     if (audio.src !== song.downloadUrl) {
// //       audio.src = song.downloadUrl;
// //       audio.load();
// //       audio.dataset.songId = String(song.id); 
// //     }

// //     // Set volume and mute for non-DJs as requested
// //     audio.volume = volume;
// //     if (!isDJ) audio.muted = true;

// //     // DJ-specific event listeners
// //     if (isDJ) {
// //       const onTimeUpdate = () => setCurrentTime(audio.currentTime);
// //       const onPlay = () => setIsPlaying(true);
// //       const onPause = () => setIsPlaying(false);

// //       audio.addEventListener('timeupdate', onTimeUpdate);
// //       audio.addEventListener('play', onPlay);
// //       audio.addEventListener('pause', onPause);
// //       audio.addEventListener('loadedmetadata', handleMetadataLoaded);
      
// //       return () => {
// //         audio.removeEventListener('timeupdate', onTimeUpdate);
// //         audio.removeEventListener('play', onPlay);
// //         audio.removeEventListener('pause', onPause);
// //         audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
// //       };
// //     } else {
// //       audio.addEventListener('loadedmetadata', handleMetadataLoaded);
// //       return () => {
// //         audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
// //       };
// //     }
// //   }, [song?.id, song?.downloadUrl, audioRef, isDJ]);


// //   // Non-DJ's logic to sync with the ADMIN's playback
// //   useEffect(() => {
// //     if (isDJ) return;

// //     const handlePlaybackUpdate = ({ time, isPlaying: newIsPlaying }: { time: number; isPlaying: boolean }) => {
// //       const audio = audioRef.current;
// //       if (!audio) return;

// //       const timeDifference = Math.abs(audio.currentTime - time);
// //       if (timeDifference > 1) { // Sync if difference is more than 1 second to avoid excessive syncing
// //         audio.currentTime = time;
// //       }
      
// //       setCurrentTime(time);
// //       setIsPlaying(newIsPlaying);
      
// //       if (newIsPlaying && audio.paused) {
// //         audio.play().catch(console.error);
// //       } else if (!newIsPlaying && !audio.paused) {
// //         audio.pause();
// //       }
// //     };

// //     onPlaybackUpdate(handlePlaybackUpdate);
// //     return () => offPlaybackUpdate(handlePlaybackUpdate);
// //   }, [isDJ, audioRef, onPlaybackUpdate, offPlaybackUpdate]);


// //   const togglePlay = () => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     if (audio.paused) {
// //       audio.play().catch(console.error);
// //     } else {
// //       audio.pause();
// //     }
// //   };
  
// //   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!isDJ || !isAudioReady) return;
    
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const newTime = (parseFloat(e.target.value) / 100) * duration;
// //     audio.currentTime = newTime;
// //     setCurrentTime(newTime);
// //   };

// //   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!isDJ) return;
// //     const newVolume = parseFloat(e.target.value) / 100;
// //     setVolume(newVolume);
// //     const audio = audioRef.current;
// //     if (audio) audio.volume = newVolume;
// //     sessionStorage.setItem("volume", newVolume.toString());
// //   };

// //   // NOTE: This redundant useEffect for volume has been removed. 
// //   // The handleVolumeChange function now sets the volume directly on the audio element.

// //   const formatTime = (sec: number) => {
// //     if (isNaN(sec)) return '0:00';
// //     const minutes = Math.floor(sec / 60);
// //     const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
// //     return `${minutes}:${seconds}`;
// //   };

// //   const progressPercentage = song?.duration && parseInt(song.duration) > 0 ? (currentTime / parseInt(song.duration)) * 100 : 0;

// //   if (!song) {
// //     return (
// //       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// //         <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// //           <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// //           <div className="flex items-center text-purple-100">
// //             <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// //             Live
// //           </div>
// //         </div>
// //         <div className="p-4 sm:p-8 flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 text-center md:text-left">
// //           <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto md:w-48">
// //             <div className="w-full h-auto aspect-square rounded-xl bg-gray-200 flex items-center justify-center shadow-lg">
// //               <Music className="w-1/2 h-1/2 text-gray-500" />
// //             </div>
// //           </div>
// //           <div className="flex-1 min-w-0">
// //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Ready to start the music?</h3>
// //             <p className="text-sm md:text-lg text-gray-600">Search and add the first song to get the party started!</p>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// //       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// //         <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// //         <div className="flex items-center text-purple-100">
// //           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// //           Live
// //         </div>
// //       </div>

// //       <div className="p-4 sm:p-2">
// //         <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
// //           {/* FIX: Removed px-3 from this div to prevent horizontal scrolling on mobile */}
// //           <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto md:w-48">
// //             <img
// //               src={song.image}
// //               alt={song.name}
// //               className="w-full h-auto aspect-square rounded-xl object-cover shadow-lg"
// //             />
// //           </div>

// //           <div className="flex-1 min-w-0 text-center md:text-left">
// //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
// //             <p className="text-sm md:text-lg text-gray-600 mb-4 truncate">
// //                By: {song.primaryArtists?.map(a => a.name).join(', ')}
// //             </p>
// //             {song.album && (
// //               <p className="text-xs md:text-sm text-gray-500 mb-4">Album: {song.album}</p>
// //             )}

// //             <div className="space-y-2">
// //               <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
// //                 <span>{formatTime(currentTime)}</span>
// //                 <span>{formatTime(parseInt(song.duration))}</span>
// //               </div>
// //               <div className="relative">
// //                 <div className="w-full h-2 bg-gray-200 rounded-full">
// //                   <div
// //                     className="h-2 bg-purple-600 rounded-full transition-all duration-300"
// //                     style={{ width: `${progressPercentage}%` }}
// //                   ></div>
// //                 </div>
// //                 <input
// //                   type="range"
// //                   min="0"
// //                   max="100"
// //                   value={progressPercentage}
// //                   onChange={handleSeek}
// //                   className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
// //                   disabled={!isDJ || !isAudioReady}
// //                 />
// //               </div>
// //             </div>

// //             {isDJ ? (
// //               <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
// //                 <div className="flex items-center space-x-4">
// //                   <button
// //                     onClick={togglePlay}
// //                     className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
// //                   >
// //                     {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
// //                   </button>
// //                   <button
// //                     onClick={handleSkipClick}
// //                     className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
// //                   >
// //                     <SkipForward className="w-5 h-5" />
// //                   </button>
// //                 </div>

// //                 <div className="flex items-center space-x-2 w-full sm:w-auto mt-4 sm:mt-0 justify-center">
// //                   <Volume2 className="w-5 h-5 text-gray-600" />
// //                   <input
// //                     type="range"
// //                     min="0"
// //                     max="100"
// //                     value={volume * 100}
// //                     onChange={handleVolumeChange}
// //                     className="w-24 sm:w-20"
// //                   />
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="mt-6 text-sm text-gray-500 text-center">
// //                 You are listening to the live stream
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // 'use client';
// // import React, { useEffect, useState, useCallback } from 'react';
// // import { Song } from '@/lib/song';
// // import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
// // import { fetchSongDetails } from '@/lib/features/getSong';

// // interface NowPlayingProps {
// //   song: Song | null;
// //   audioRef: React.RefObject<HTMLAudioElement | null>;
// //   setSong: (s: Song | null) => void;
// //   isDJ: boolean;
// //   onSkip: () => void;
// //   emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
// //   onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
// //   offPlaybackUpdate: (callback: (data?: any) => void) => void;
// //   // NOTE: emitSkipSong, onSkipSong, and offSkipSong are removed as per the new workflow
// //   organizationId: string,
// // }

// // export default function NowPlaying({
// //   song,
// //   audioRef,
// //   setSong,
// //   isDJ,
// //   onSkip,
// //   organizationId,
// //   emitPlaybackUpdate,
// //   onPlaybackUpdate,
// //   offPlaybackUpdate,
// // }: NowPlayingProps) {
// //   const [isPlaying, setIsPlaying] = useState(false);
// //   const [currentTime, setCurrentTime] = useState(0);
// //   const [duration, setDuration] = useState(0);
// //   const [isAudioReady, setIsAudioReady] = useState(false);
// //   const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
// //   const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
// //   const [volume, setVolume] = useState(initialVolume);

// //   const handleSkipClick = () => {
// //     console.log("Skipping the song from DJ controls.");
// //     onSkip();
// //   };

// //   // DJ's logic to handle song ending
// //   useEffect(() => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const handleEnded = () => {
// //       console.log("Song ended, fetching next from queue.");
// //       onSkip();
// //     };

// //     audio.addEventListener('ended', handleEnded);
// //     return () => audio.removeEventListener('ended', handleEnded);
// //   }, [isDJ, audioRef, onSkip]);

// //   // DJ's logic to broadcast playback position
// //   useEffect(() => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const interval = setInterval(() => {
// //       emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
// //     }, 500);

// //     return () => clearInterval(interval);
// //   }, [isDJ, song, audioRef, emitPlaybackUpdate]);

// //   // This hook handles the main audio element logic, including setting source
// //   // NOTE: `volume` has been removed from the dependency array to prevent the song from pausing
// //   // when the volume is changed.
// //   useEffect(() => {
// //     const audio = audioRef.current;
// //     if (!audio || !song?.downloadUrl) return;

// //     const handleMetadataLoaded = () => {
// //       setIsAudioReady(true);
// //       setDuration(audio.duration);
// //     };
    
// //     // Check if metadata is already loaded
// //     if (audio.readyState >= 1) { 
// //       setIsAudioReady(true);
// //       setDuration(audio.duration);
// //     } else {
// //       setIsAudioReady(false);
// //     }

// //     // Set the audio source if it's a new song
// //     if (audio.src !== song.downloadUrl) {
// //       audio.src = song.downloadUrl;
// //       audio.load();
// //       audio.dataset.songId = String(song.id); 
// //     }

// //     // Set volume and mute for non-DJs as requested
// //     audio.volume = volume;
// //     if (!isDJ) audio.muted = true;

// //     // DJ-specific event listeners
// //     if (isDJ) {
// //       const onTimeUpdate = () => setCurrentTime(audio.currentTime);
// //       const onPlay = () => setIsPlaying(true);
// //       const onPause = () => setIsPlaying(false);

// //       audio.addEventListener('timeupdate', onTimeUpdate);
// //       audio.addEventListener('play', onPlay);
// //       audio.addEventListener('pause', onPause);
// //       audio.addEventListener('loadedmetadata', handleMetadataLoaded);
      
// //       return () => {
// //         audio.removeEventListener('timeupdate', onTimeUpdate);
// //         audio.removeEventListener('play', onPlay);
// //         audio.removeEventListener('pause', onPause);
// //         audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
// //       };
// //     } else {
// //       audio.addEventListener('loadedmetadata', handleMetadataLoaded);
// //       return () => {
// //         audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
// //       };
// //     }
// //   }, [song?.id, song?.downloadUrl, audioRef, isDJ]);


// //   // Non-DJ's logic to sync with the ADMIN's playback
// //   useEffect(() => {
// //     if (isDJ) return;

// //     const handlePlaybackUpdate = ({ time, isPlaying: newIsPlaying }: { time: number; isPlaying: boolean }) => {
// //       const audio = audioRef.current;
// //       if (!audio) return;

// //       const timeDifference = Math.abs(audio.currentTime - time);
// //       if (timeDifference > 1) { // Sync if difference is more than 1 second to avoid excessive syncing
// //         audio.currentTime = time;
// //       }
      
// //       setCurrentTime(time);
// //       setIsPlaying(newIsPlaying);
      
// //       if (newIsPlaying && audio.paused) {
// //         audio.play().catch(console.error);
// //       } else if (!newIsPlaying && !audio.paused) {
// //         audio.pause();
// //       }
// //     };

// //     onPlaybackUpdate(handlePlaybackUpdate);
// //     return () => offPlaybackUpdate(handlePlaybackUpdate);
// //   }, [isDJ, audioRef, onPlaybackUpdate, offPlaybackUpdate]);


// //   const togglePlay = () => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     if (audio.paused) {
// //       audio.play().catch(console.error);
// //     } else {
// //       audio.pause();
// //     }
// //   };
  
// //   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!isDJ || !isAudioReady) return;
    
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const newTime = (parseFloat(e.target.value) / 100) * duration;
// //     audio.currentTime = newTime;
// //     setCurrentTime(newTime);
// //   };

// //   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!isDJ) return;
// //     const newVolume = parseFloat(e.target.value) / 100;
// //     setVolume(newVolume);
// //     const audio = audioRef.current;
// //     if (audio) audio.volume = newVolume;
// //     sessionStorage.setItem("volume", newVolume.toString());
// //   };

// //   // NOTE: This redundant useEffect for volume has been removed. 
// //   // The handleVolumeChange function now sets the volume directly on the audio element.

// //   const formatTime = (sec: number) => {
// //     if (isNaN(sec)) return '0:00';
// //     const minutes = Math.floor(sec / 60);
// //     const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
// //     return `${minutes}:${seconds}`;
// //   };

// //   const progressPercentage = song?.duration && parseInt(song.duration) > 0 ? (currentTime / parseInt(song.duration)) * 100 : 0;

// //   if (!song) {
// //     return (
// //       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// //         <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// //           <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// //           <div className="flex items-center text-purple-100">
// //             <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// //             Live
// //           </div>
// //         </div>
// //         <div className="p-4 sm:p-8 flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 text-center md:text-left">
// //           <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto md:w-48">
// //             <div className="w-full h-auto aspect-square rounded-xl bg-gray-200 flex items-center justify-center shadow-lg">
// //               <Music className="w-1/2 h-1/2 text-gray-500" />
// //             </div>
// //           </div>
// //           <div className="flex-1 min-w-0">
// //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Ready to start the music?</h3>
// //             <p className="text-sm md:text-lg text-gray-600">Search and add the first song to get the party started!</p>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// //       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// //         <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// //         <div className="flex items-center text-purple-100">
// //           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// //           Live
// //         </div>
// //       </div>

// //       <div className="p-4 sm:p-8">
// //         <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
// //           {/* FIX: The image container now has a fixed width on medium screens and up */}
// //           <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto md:w-48 px-3">
// //             <img
// //               src={song.image}
// //               alt={song.name}
// //               className="w-full h-auto aspect-square rounded-xl object-cover shadow-lg"
// //             />
// //           </div>

// //           <div className="flex-1 min-w-0 text-center md:text-left">
// //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
// //             <p className="text-sm md:text-lg text-gray-600 mb-4 truncate">
// //                By: {song.primaryArtists?.map(a => a.name).join(', ')}
// //             </p>
// //             {song.album && (
// //               <p className="text-xs md:text-sm text-gray-500 mb-4">Album: {song.album}</p>
// //             )}

// //             <div className="space-y-2">
// //               <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
// //                 <span>{formatTime(currentTime)}</span>
// //                 <span>{formatTime(parseInt(song.duration))}</span>
// //               </div>
// //               <div className="relative">
// //                 <div className="w-full h-2 bg-gray-200 rounded-full">
// //                   <div
// //                     className="h-2 bg-purple-600 rounded-full transition-all duration-300"
// //                     style={{ width: `${progressPercentage}%` }}
// //                   ></div>
// //                 </div>
// //                 <input
// //                   type="range"
// //                   min="0"
// //                   max="100"
// //                   value={progressPercentage}
// //                   onChange={handleSeek}
// //                   className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
// //                   disabled={!isDJ || !isAudioReady}
// //                 />
// //               </div>
// //             </div>

// //             {isDJ ? (
// //               <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
// //                 <div className="flex items-center space-x-4">
// //                   <button
// //                     onClick={togglePlay}
// //                     className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
// //                   >
// //                     {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
// //                   </button>
// //                   <button
// //                     onClick={handleSkipClick}
// //                     className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
// //                   >
// //                     <SkipForward className="w-5 h-5" />
// //                   </button>
// //                 </div>

// //                 <div className="flex items-center space-x-2 w-full sm:w-auto mt-4 sm:mt-0 justify-center">
// //                   <Volume2 className="w-5 h-5 text-gray-600" />
// //                   <input
// //                     type="range"
// //                     min="0"
// //                     max="100"
// //                     value={volume * 100}
// //                     onChange={handleVolumeChange}
// //                     className="w-24 sm:w-20"
// //                   />
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="mt-6 text-sm text-gray-500 text-center">
// //                 You are listening to the live stream
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // 'use client';
// // import React, { useEffect, useState, useCallback } from 'react';
// // import { Song } from '@/lib/song';
// // import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
// // import { fetchSongDetails } from '@/lib/features/getSong';

// // interface NowPlayingProps {
// //   song: Song | null;
// //   audioRef: React.RefObject<HTMLAudioElement | null>;
// //   setSong: (s: Song | null) => void;
// //   isDJ: boolean;
// //   onSkip: () => void;
// //   emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
// //   onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
// //   offPlaybackUpdate: (callback: (data?: any) => void) => void;
// //   // NOTE: emitSkipSong, onSkipSong, and offSkipSong are removed as per the new workflow
// //   organizationId: string,
// // }

// // export default function NowPlaying({
// //   song,
// //   audioRef,
// //   setSong,
// //   isDJ,
// //   onSkip,
// //   organizationId,
// //   emitPlaybackUpdate,
// //   onPlaybackUpdate,
// //   offPlaybackUpdate,
// // }: NowPlayingProps) {
// //   const [isPlaying, setIsPlaying] = useState(false);
// //   const [currentTime, setCurrentTime] = useState(0);
// //   const [duration, setDuration] = useState(0);
// //   const [isAudioReady, setIsAudioReady] = useState(false);
// //   const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
// //   const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
// //   const [volume, setVolume] = useState(initialVolume);

// //   const handleSkipClick = () => {
// //     console.log("Skipping the song from DJ controls.");
// //     onSkip();
// //   };

// //   // DJ's logic to handle song ending
// //   useEffect(() => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const handleEnded = () => {
// //       console.log("Song ended, fetching next from queue.");
// //       onSkip();
// //     };

// //     audio.addEventListener('ended', handleEnded);
// //     return () => audio.removeEventListener('ended', handleEnded);
// //   }, [isDJ, audioRef, onSkip]);

// //   // DJ's logic to broadcast playback position
// //   useEffect(() => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const interval = setInterval(() => {
// //       emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
// //     }, 500);

// //     return () => clearInterval(interval);
// //   }, [isDJ, song, audioRef, emitPlaybackUpdate]);

// //   // This hook handles the main audio element logic, including setting source
// //   // NOTE: `volume` has been removed from the dependency array to prevent the song from pausing
// //   // when the volume is changed.
// //   useEffect(() => {
// //     const audio = audioRef.current;
// //     if (!audio || !song?.downloadUrl) return;

// //     const handleMetadataLoaded = () => {
// //       setIsAudioReady(true);
// //       setDuration(audio.duration);
// //     };
    
// //     // Check if metadata is already loaded
// //     if (audio.readyState >= 1) { 
// //       setIsAudioReady(true);
// //       setDuration(audio.duration);
// //     } else {
// //       setIsAudioReady(false);
// //     }

// //     // Set the audio source if it's a new song
// //     if (audio.src !== song.downloadUrl) {
// //       audio.src = song.downloadUrl;
// //       audio.load();
// //       audio.dataset.songId = String(song.id); 
// //     }

// //     // Set volume and mute for non-DJs as requested
// //     audio.volume = volume;
// //     if (!isDJ) audio.muted = true;

// //     // DJ-specific event listeners
// //     if (isDJ) {
// //       const onTimeUpdate = () => setCurrentTime(audio.currentTime);
// //       const onPlay = () => setIsPlaying(true);
// //       const onPause = () => setIsPlaying(false);

// //       audio.addEventListener('timeupdate', onTimeUpdate);
// //       audio.addEventListener('play', onPlay);
// //       audio.addEventListener('pause', onPause);
// //       audio.addEventListener('loadedmetadata', handleMetadataLoaded);
      
// //       return () => {
// //         audio.removeEventListener('timeupdate', onTimeUpdate);
// //         audio.removeEventListener('play', onPlay);
// //         audio.removeEventListener('pause', onPause);
// //         audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
// //       };
// //     } else {
// //       audio.addEventListener('loadedmetadata', handleMetadataLoaded);
// //       return () => {
// //         audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
// //       };
// //     }
// //   }, [song?.id, song?.downloadUrl, audioRef, isDJ]);


// //   // Non-DJ's logic to sync with the ADMIN's playback
// //   useEffect(() => {
// //     if (isDJ) return;

// //     const handlePlaybackUpdate = ({ time, isPlaying: newIsPlaying }: { time: number; isPlaying: boolean }) => {
// //       const audio = audioRef.current;
// //       if (!audio) return;

// //       const timeDifference = Math.abs(audio.currentTime - time);
// //       if (timeDifference > 1) { // Sync if difference is more than 1 second to avoid excessive syncing
// //         audio.currentTime = time;
// //       }
      
// //       setCurrentTime(time);
// //       setIsPlaying(newIsPlaying);
      
// //       if (newIsPlaying && audio.paused) {
// //         audio.play().catch(console.error);
// //       } else if (!newIsPlaying && !audio.paused) {
// //         audio.pause();
// //       }
// //     };

// //     onPlaybackUpdate(handlePlaybackUpdate);
// //     return () => offPlaybackUpdate(handlePlaybackUpdate);
// //   }, [isDJ, audioRef, onPlaybackUpdate, offPlaybackUpdate]);


// //   const togglePlay = () => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     if (audio.paused) {
// //       audio.play().catch(console.error);
// //     } else {
// //       audio.pause();
// //     }
// //   };
  
// //   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!isDJ || !isAudioReady) return;
    
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const newTime = (parseFloat(e.target.value) / 100) * duration;
// //     audio.currentTime = newTime;
// //     setCurrentTime(newTime);
// //   };

// //   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!isDJ) return;
// //     const newVolume = parseFloat(e.target.value) / 100;
// //     setVolume(newVolume);
// //     const audio = audioRef.current;
// //     if (audio) audio.volume = newVolume;
// //     sessionStorage.setItem("volume", newVolume.toString());
// //   };

// //   // NOTE: This redundant useEffect for volume has been removed. 
// //   // The handleVolumeChange function now sets the volume directly on the audio element.

// //   const formatTime = (sec: number) => {
// //     if (isNaN(sec)) return '0:00';
// //     const minutes = Math.floor(sec / 60);
// //     const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
// //     return `${minutes}:${seconds}`;
// //   };

// //   const progressPercentage = song?.duration && parseInt(song.duration) > 0 ? (currentTime / parseInt(song.duration)) * 100 : 0;

// //   if (!song) {
// //     return (
// //       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// //         <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// //           <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// //           <div className="flex items-center text-purple-100">
// //             <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// //             Live
// //           </div>
// //         </div>
// //         <div className="p-4 sm:p-8 flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 text-center md:text-left">
// //           <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto sm:max-w-none">
// //             <div className="w-full h-auto aspect-square rounded-xl bg-gray-200 flex items-center justify-center shadow-lg">
// //               <Music className="w-1/2 h-1/2 text-gray-500" />
// //             </div>
// //           </div>
// //           <div className="flex-1 min-w-0">
// //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Ready to start the music?</h3>
// //             <p className="text-sm md:text-lg text-gray-600">Search and add the first song to get the party started!</p>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// //       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// //         <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// //         <div className="flex items-center text-purple-100">
// //           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// //           Live
// //         </div>
// //       </div>

// //       <div className="p-4 sm:p-8">
// //         <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
// //           <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto sm:max-w-none">
// //             <img
// //               src={song.image}
// //               alt={song.name}
// //               className="w-full h-auto aspect-square rounded-xl object-cover shadow-lg"
// //             />
// //           </div>

// //           <div className="flex-1 min-w-0 text-center md:text-left">
// //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
// //             <p className="text-sm md:text-lg text-gray-600 mb-4 truncate">
// //               {/* {song.primaryArtists} */}
// //                By: {song.primaryArtists?.map(a => a.name).join(', ')}
             
// //             </p>
// //             {song.album && (
// //               <p className="text-xs md:text-sm text-gray-500 mb-4">Album: {song.album}</p>
// //             )}

// //             <div className="space-y-2">
// //               <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
// //                 <span>{formatTime(currentTime)}</span>
// //                 <span>{formatTime(parseInt(song.duration))}</span>
// //               </div>
// //               <div className="relative">
// //                 <div className="w-full h-2 bg-gray-200 rounded-full">
// //                   <div
// //                     className="h-2 bg-purple-600 rounded-full transition-all duration-300"
// //                     style={{ width: `${progressPercentage}%` }}
// //                   ></div>
// //                 </div>
// //                 <input
// //                   type="range"
// //                   min="0"
// //                   max="100"
// //                   value={progressPercentage}
// //                   onChange={handleSeek}
// //                   className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
// //                   disabled={!isDJ || !isAudioReady}
// //                 />
// //               </div>
// //             </div>

// //             {isDJ ? (
// //               <div className="flex items-center justify-between mt-6">
// //                 <div className="flex items-center space-x-4">
// //                   <button
// //                     onClick={togglePlay}
// //                     className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
// //                   >
// //                     {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
// //                   </button>
// //                   <button
// //                     onClick={handleSkipClick}
// //                     className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
// //                   >
// //                     <SkipForward className="w-5 h-5" />
// //                   </button>
// //                 </div>

// //                 <div className="flex items-center space-x-2">
// //                   <Volume2 className="w-5 h-5 text-gray-600" />
// //                   <input
// //                     type="range"
// //                     min="0"
// //                     max="100"
// //                     value={volume * 100}
// //                     onChange={handleVolumeChange}
// //                     className="w-20"
// //                   />
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="mt-6 text-sm text-gray-500 text-center">
// //                 You are listening to the live stream
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // import React, { useEffect, useState, useCallback } from 'react';
// // import { Song } from '@/lib/song';
// // import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
// // import { fetchSongDetails } from '@/lib/features/getSong';

// // interface NowPlayingProps {
// //   song: Song | null;
// //   audioRef: React.RefObject<HTMLAudioElement | null>;
// //   setSong: (s: Song | null) => void;
// //   isDJ: boolean;
// //   onSkip: () => void;
// //   emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
// //   onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
// //   offPlaybackUpdate: (callback: (data?: any) => void) => void;
// //   // NOTE: emitSkipSong, onSkipSong, and offSkipSong are removed as per the new workflow
// //   organizationId: string,
// // }

// // export default function NowPlaying({
// //   song,
// //   audioRef,
// //   setSong,
// //   isDJ,
// //   onSkip,
// //   organizationId,
// //   emitPlaybackUpdate,
// //   onPlaybackUpdate,
// //   offPlaybackUpdate,
// // }: NowPlayingProps) {
// //   const [isPlaying, setIsPlaying] = useState(false);
// //   const [currentTime, setCurrentTime] = useState(0);
// //   const [duration, setDuration] = useState(0);
// //   const [isAudioReady, setIsAudioReady] = useState(false);
// //   const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
// //   const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
// //   const [volume, setVolume] = useState(initialVolume);

// //   const handleSkipClick = () => {
// //     console.log("Skipping the song from DJ controls.");
// //     onSkip();
// //   };

// //   // DJ's logic to handle song ending
// //   useEffect(() => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const handleEnded = () => {
// //       console.log("Song ended, fetching next from queue.");
// //       onSkip();
// //     };

// //     audio.addEventListener('ended', handleEnded);
// //     return () => audio.removeEventListener('ended', handleEnded);
// //   }, [isDJ, audioRef, onSkip]);

// //   // DJ's logic to broadcast playback position
// //   useEffect(() => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const interval = setInterval(() => {
// //       emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
// //     }, 500);

// //     return () => clearInterval(interval);
// //   }, [isDJ, song, audioRef, emitPlaybackUpdate]);

// //   // This hook handles the main audio element logic, including setting source and volume
// //   useEffect(() => {
// //     const audio = audioRef.current;
// //     if (!audio || !song?.downloadUrl) return;

// //     const handleMetadataLoaded = () => {
// //       setIsAudioReady(true);
// //       setDuration(audio.duration);
// //     };
    
// //     // Check if metadata is already loaded
// //     if (audio.readyState >= 1) { 
// //       setIsAudioReady(true);
// //       setDuration(audio.duration);
// //     } else {
// //       setIsAudioReady(false);
// //     }

// //     // Set the audio source if it's a new song
// //     if (audio.src !== song.downloadUrl) {
// //       audio.src = song.downloadUrl;
// //       audio.load();
// //       audio.dataset.songId = String(song.id); 
// //     }

// //     // Set volume and play for DJ, and mute for non-DJs as requested
// //     audio.volume = volume;
// //     if (isDJ) {
// //       audio.muted = false;
// //       audio.play().catch((err) => console.warn('Autoplay failed for DJ:', err));
// //     } else {
// //       audio.muted = true;
// //     }

// //     const onTimeUpdate = () => setCurrentTime(audio.currentTime);
// //     const onPlay = () => setIsPlaying(true);
// //     const onPause = () => setIsPlaying(false);

// //     audio.addEventListener('timeupdate', onTimeUpdate);
// //     audio.addEventListener('loadedmetadata', handleMetadataLoaded);
// //     audio.addEventListener('play', onPlay);
// //     audio.addEventListener('pause', onPause);

// //     return () => {
// //       audio.removeEventListener('timeupdate', onTimeUpdate);
// //       audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
// //       audio.removeEventListener('play', onPlay);
// //       audio.removeEventListener('pause', onPause);
// //     };
// //   }, [song?.id, song?.downloadUrl, audioRef, volume, isDJ]);

// //   // Non-DJ's logic to sync with the ADMIN's playback
// //   useEffect(() => {
// //     if (isDJ) return;

// //     const handlePlaybackUpdate = ({ time, isPlaying: newIsPlaying }: { time: number; isPlaying: boolean }) => {
// //       const audio = audioRef.current;
// //       if (!audio) return;

// //       const timeDifference = Math.abs(audio.currentTime - time);
// //       if (timeDifference > 0.5) { // Sync if difference is more than half a second
// //         audio.currentTime = time;
// //       }
      
// //       setCurrentTime(time);

// //       // This logic is now handled in the parent `PubDashboard` component
// //       // This is a new helper effect that handles the song change from the socket update.
// //       // It is now the responsibility of PubDashboard to call the socket.
// //       // The onUpdateSong logic is now handled in the parent component.
// //       // This component simply receives the new 'song' prop and the useEffect above handles it.
// //     };

// //     onPlaybackUpdate(handlePlaybackUpdate);
// //     return () => offPlaybackUpdate(handlePlaybackUpdate);
// //   }, [isDJ, audioRef, onPlaybackUpdate, offPlaybackUpdate]);

// //   const togglePlay = () => {
// //     if (!isDJ) return;
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     if (audio.paused) {
// //       audio.play().catch(console.error);
// //     } else {
// //       audio.pause();
// //     }
// //   };
// //   console.log(song);
// //   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!isDJ || !isAudioReady) return;
    
// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const newTime = (parseFloat(e.target.value) / 100) * duration;
// //     audio.currentTime = newTime;
// //     setCurrentTime(newTime);
// //   };

// //   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!isDJ) return;
// //     const newVolume = parseFloat(e.target.value) / 100;
// //     setVolume(newVolume);
// //     const audio = audioRef.current;
// //     if (audio) audio.volume = newVolume;
// //     sessionStorage.setItem("volume", newVolume.toString());
// //   };

// //   useEffect(() => {
// //     const audio = audioRef.current;
// //     if (audio) audio.volume = volume;
// //   }, [volume, audioRef]);

// //   const formatTime = (sec: number) => {
// //     if (isNaN(sec)) return '0:00';
// //     const minutes = Math.floor(sec / 60);
// //     const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
// //     return `${minutes}:${seconds}`;
// //   };

// //   const progressPercentage = song?.duration && parseInt(song.duration) > 0 ? (currentTime / parseInt(song.duration)) * 100 : 0;

// //   if (!song) {
// //     return (
// //       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// //         <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// //           <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// //           <div className="flex items-center text-purple-100">
// //             <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// //             Live
// //           </div>
// //         </div>
// //         <div className="p-4 sm:p-8 flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 text-center md:text-left">
// //           <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto sm:max-w-none">
// //             <div className="w-full h-auto aspect-square rounded-xl bg-gray-200 flex items-center justify-center shadow-lg">
// //               <Music className="w-1/2 h-1/2 text-gray-500" />
// //             </div>
// //           </div>
// //           <div className="flex-1 min-w-0">
// //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Ready to start the music?</h3>
// //             <p className="text-sm md:text-lg text-gray-600">Search and add the first song to get the party started!</p>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// //       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// //         <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// //         <div className="flex items-center text-purple-100">
// //           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// //           Live
// //         </div>
// //       </div>

// //       <div className="p-4 sm:p-8">
// //         <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
// //           <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto sm:max-w-none">
// //             <img
// //               src={song.image}
// //               alt={song.name}
// //               className="w-full h-auto aspect-square rounded-xl object-cover shadow-lg"
// //             />
// //           </div>

// //           <div className="flex-1 min-w-0 text-center md:text-left">
// //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
// //             <p className="text-sm md:text-lg text-gray-600 mb-4 truncate">
// //               {/* {song.primaryArtists} */}
// //                By: {song.primaryArtists?.map(a => a.name).join(', ')}
             
// //             </p>
// //             {song.album && (
// //               <p className="text-xs md:text-sm text-gray-500 mb-4">Album: {song.album}</p>
// //             )}

// //             <div className="space-y-2">
// //               <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
// //                 <span>{formatTime(currentTime)}</span>
// //                 <span>{formatTime(parseInt(song.duration))}</span>
// //               </div>
// //               <div className="relative">
// //                 <div className="w-full h-2 bg-gray-200 rounded-full">
// //                   <div
// //                     className="h-2 bg-purple-600 rounded-full transition-all duration-300"
// //                     style={{ width: `${progressPercentage}%` }}
// //                   ></div>
// //                 </div>
// //                 <input
// //                   type="range"
// //                   min="0"
// //                   max="100"
// //                   value={progressPercentage}
// //                   onChange={handleSeek}
// //                   className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
// //                   disabled={!isDJ || !isAudioReady}
// //                 />
// //               </div>
// //             </div>

// //             {isDJ ? (
// //               <div className="flex items-center justify-between mt-6">
// //                 <div className="flex items-center space-x-4">
// //                   <button
// //                     onClick={togglePlay}
// //                     className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
// //                   >
// //                     {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
// //                   </button>
// //                   <button
// //                     onClick={handleSkipClick}
// //                     className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
// //                   >
// //                     <SkipForward className="w-5 h-5" />
// //                   </button>
// //                 </div>

// //                 <div className="flex items-center space-x-2">
// //                   <Volume2 className="w-5 h-5 text-gray-600" />
// //                   <input
// //                     type="range"
// //                     min="0"
// //                     max="100"
// //                     value={volume * 100}
// //                     onChange={handleVolumeChange}
// //                     className="w-20"
// //                   />
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="mt-6 text-sm text-gray-500 text-center">
// //                 You are listening to the live stream
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // // import React, { useEffect, useState } from 'react';
// // // import { Song } from '@/lib/song';
// // // import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
// // // import LastPlayedSong from '@/lib/features/lastPlayed';

// // // interface NowPlayingProps {
// // //   song: Song | null;
// // //   audioRef: React.RefObject<HTMLAudioElement | null>;
// // //   setSong: (s: Song | null) => void;
// // //   isDJ: boolean;
// // //   onSkip: () => void;
// // //   emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
// // //   onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
// // //   offPlaybackUpdate: (callback: (data?: any) => void) => void;
// // //   emitSkipSong: (data: { song: Song }) => void;
// // //   onSkipSong: (callback: (data: { song: Song }) => void) => void;
// // //   offSkipSong: (callback: (data: { song: Song }) => void) => void;
// // //   organizationId: string,
// // // }

// // // export default function NowPlaying({
// // //   song,
// // //   audioRef,
// // //   setSong,
// // //   isDJ,
// // //   onSkip,
// // //   organizationId,
// // //   emitPlaybackUpdate,
// // //   onPlaybackUpdate,
// // //   offPlaybackUpdate,
// // //   emitSkipSong,
// // //   onSkipSong,
// // //   offSkipSong
// // // }: NowPlayingProps) {
// // //   const [isPlaying, setIsPlaying] = useState(false);
// // //   const [currentTime, setCurrentTime] = useState(0);
// // //   const [duration, setDuration] = useState(0);
// // //   const [isAudioReady, setIsAudioReady] = useState(false);
// // //   const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
// // //   const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
// // //   const [volume, setVolume] = useState(initialVolume);

// // //   const handleSkipClick = async () => {
// // //     try {
// // //       console.log("skipping the song");
// // //       if (song) await LastPlayedSong(song.id, organizationId);
// // //       onSkip();
// // //     } catch (err) {
// // //       console.error("Failed to save last played song:", err);
// // //       onSkip();
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (!isDJ) return;
// // //     const audio = audioRef.current;
// // //     if (!audio) return;

// // //     const handleEnded = async () => {
// // //       console.log("skipping the song");
// // //       if (song) await LastPlayedSong(song.id, organizationId);
// // //       onSkip();
// // //     };

// // //     audio.addEventListener('ended', handleEnded);
// // //     return () => audio.removeEventListener('ended', handleEnded);
// // //   }, [isDJ, song]);

// // //   useEffect(() => {
// // //     if (isDJ) return;

// // //     const handleSkipSong = (data: { song: Song }) => {
// // //       if (data.song) {
// // //         setSong(data.song);
// // //         setCurrentTime(0);
// // //         setIsPlaying(false);
// // //       } else {
// // //         console.warn("Received null or invalid song on skip");
// // //       }
// // //     };

// // //     onSkipSong(handleSkipSong);
// // //     return () => offSkipSong(handleSkipSong);
// // //   }, [isDJ, setSong, onSkipSong, offSkipSong]);

// // //   useEffect(() => {
// // //     if (!isDJ) return;
// // //     const audio = audioRef.current;
// // //     if (!audio || !song) return;

// // //     const interval = setInterval(() => {
// // //       emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
// // //     }, 500);

// // //     return () => clearInterval(interval);
// // //   }, [isDJ, song, audioRef, emitPlaybackUpdate]);

// // //   useEffect(() => {
// // //     const audio = audioRef.current;
// // //     if (!audio || !song?.downloadUrl) return;

// // //     const handleMetadataLoaded = () => {
// // //       setIsAudioReady(true);
// // //       setDuration(audio.duration);
// // //     };
    
// // //     if (audio.readyState >= 1) { 
// // //       setIsAudioReady(true);
// // //       setDuration(audio.duration);
// // //     } else {
// // //       setIsAudioReady(false);
// // //     }

// // //     if (audio.src !== song.downloadUrl) {
// // //       audio.src = song.downloadUrl;
// // //       audio.load();
// // //       audio.dataset.songId = String(song.id); 
      
// // //       if (isDJ) {
// // //         audio.volume = volume;
// // //         audio.play().catch((err) => console.warn('Autoplay failed:', err));
// // //       } else {
// // //         audio.muted = true;
// // //       }
// // //     } else {
// // //       if (isDJ) {
// // //         audio.volume = volume;
// // //       } else {
// // //         audio.muted = true;
// // //       }
// // //     }

// // //     const onTimeUpdate = () => setCurrentTime(audio.currentTime);
// // //     const onPlay = () => setIsPlaying(true);
// // //     const onPause = () => setIsPlaying(false);

// // //     audio.addEventListener('timeupdate', onTimeUpdate);
// // //     audio.addEventListener('loadedmetadata', handleMetadataLoaded);
// // //     audio.addEventListener('play', onPlay);
// // //     audio.addEventListener('pause', onPause);

// // //     return () => {
// // //       audio.removeEventListener('timeupdate', onTimeUpdate);
// // //       audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
// // //       audio.removeEventListener('play', onPlay);
// // //       audio.removeEventListener('pause', onPause);
// // //     };
// // //   }, [song?.id, song?.downloadUrl, audioRef, volume, isDJ]);

// // //   useEffect(() => {
// // //     if (isDJ) return;

// // //     const handlePlaybackUpdate = ({ time, isPlaying }: { time: number; isPlaying: boolean }) => {
// // //       const audio = audioRef.current;
// // //       if (!audio) return;

// // //       const timeDifference = Math.abs(audio.currentTime - time);
// // //       if (timeDifference > 0.3) {
// // //         audio.currentTime = time;
// // //       }
      
// // //       setCurrentTime(time);

// // //       if (isPlaying && audio.paused) {
// // //         audio.play().catch((err) => {
// // //           if (!err.message.includes('play() request was interrupted')) {
// // //             console.error('Autoplay failed:', err);
// // //           }
// // //         });
// // //       } else if (!isPlaying && !audio.paused) {
// // //         audio.pause();
// // //       }
// // //     };

// // //     onPlaybackUpdate(handlePlaybackUpdate);
// // //     return () => offPlaybackUpdate(handlePlaybackUpdate);
// // //   }, [isDJ, audioRef, onPlaybackUpdate, offPlaybackUpdate]);

// // //   useEffect(() => {
// // //     if (isDJ && song) {
// // //       emitSkipSong({ song });
// // //     }
// // //   }, [song, isDJ, emitSkipSong]);

// // //   const togglePlay = () => {
// // //     const audio = audioRef.current;
// // //     if (!audio) return;

// // //     if (audio.paused) {
// // //       audio.play().catch(console.error);
// // //     } else {
// // //       audio.pause();
// // //     }
// // //   };

// // //   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
// // //     if (!isDJ || !isAudioReady) return;
    
// // //     const audio = audioRef.current;
// // //     if (!audio) return;

// // //     const newTime = (parseFloat(e.target.value) / 100) * duration;
// // //     audio.currentTime = newTime;
// // //     setCurrentTime(newTime);
// // //   };

// // //   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// // //     if (!isDJ) return;
// // //     const newVolume = parseFloat(e.target.value) / 100;
// // //     setVolume(newVolume);
// // //     const audio = audioRef.current;
// // //     if (audio) audio.volume = newVolume;
// // //     sessionStorage.setItem("volume", newVolume.toString());
// // //   };

// // //   useEffect(() => {
// // //     const audio = audioRef.current;
// // //     if (audio) audio.volume = volume;
// // //   }, [volume, audioRef]);

// // //   const formatTime = (sec: number) => {
// // //     if (isNaN(sec)) return '0:00';
// // //     const minutes = Math.floor(sec / 60);
// // //     const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
// // //     return `${minutes}:${seconds}`;
// // //   };

// // //   const progressPercentage = song?.duration && parseInt(song.duration) > 0 ? (currentTime / parseInt(song.duration)) * 100 : 0;

// // //   if (!song) {
// // //     return (
// // //       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// // //         <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// // //           <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// // //           <div className="flex items-center text-purple-100">
// // //             <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// // //             Live
// // //           </div>
// // //         </div>
// // //         <div className="p-4 sm:p-8 flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 text-center md:text-left">
// // //           <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto sm:max-w-none">
// // //             <div className="w-full h-auto aspect-square rounded-xl bg-gray-200 flex items-center justify-center shadow-lg">
// // //               <Music className="w-1/2 h-1/2 text-gray-500" />
// // //             </div>
// // //           </div>
// // //           <div className="flex-1 min-w-0">
// // //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Ready to start the music?</h3>
// // //             <p className="text-sm md:text-lg text-gray-600">Search and add the first song to get the party started!</p>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// // //       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// // //         <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// // //         <div className="flex items-center text-purple-100">
// // //           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// // //           Live
// // //         </div>
// // //       </div>

// // //       <div className="p-4 sm:p-8">
// // //         <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
// // //           <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto sm:max-w-none">
// // //             <img
// // //               src={song.image}
// // //               alt={song.name}
// // //               className="w-full h-auto aspect-square rounded-xl object-cover shadow-lg"
// // //             />
// // //           </div>

// // //           <div className="flex-1 min-w-0 text-center md:text-left">
// // //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
// // //             <p className="text-sm md:text-lg text-gray-600 mb-4 truncate">
// // //               {song.primaryArtists?.map((a) => a.name).join(', ')}
// // //             </p>
// // //             {song.album && (
// // //               <p className="text-xs md:text-sm text-gray-500 mb-4">Album: {song.album}</p>
// // //             )}

// // //             <div className="space-y-2">
// // //               <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
// // //                 <span>{formatTime(currentTime)}</span>
// // //                 <span>{formatTime(parseInt(song.duration))}</span>
// // //               </div>
// // //               <div className="relative">
// // //                 <div className="w-full h-2 bg-gray-200 rounded-full">
// // //                   <div
// // //                     className="h-2 bg-purple-600 rounded-full transition-all duration-300"
// // //                     style={{ width: `${progressPercentage}%` }}
// // //                   ></div>
// // //                 </div>
// // //                 <input
// // //                   type="range"
// // //                   min="0"
// // //                   max="100"
// // //                   value={progressPercentage}
// // //                   onChange={handleSeek}
// // //                   className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
// // //                   disabled={!isDJ || !isAudioReady}
// // //                 />
// // //               </div>
// // //             </div>

// // //             {isDJ ? (
// // //               <div className="flex items-center justify-between mt-6">
// // //                 <div className="flex items-center space-x-4">
// // //                   <button
// // //                     onClick={togglePlay}
// // //                     className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
// // //                   >
// // //                     {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
// // //                   </button>
// // //                   <button
// // //                     onClick={handleSkipClick}
// // //                     className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
// // //                   >
// // //                     <SkipForward className="w-5 h-5" />
// // //                   </button>
// // //                 </div>

// // //                 <div className="flex items-center space-x-2">
// // //                   <Volume2 className="w-5 h-5 text-gray-600" />
// // //                   <input
// // //                     type="range"
// // //                     min="0"
// // //                     max="100"
// // //                     value={volume * 100}
// // //                     onChange={handleVolumeChange}
// // //                     className="w-20"
// // //                   />
// // //                 </div>
// // //               </div>
// // //             ) : (
// // //               <div className="mt-6 text-sm text-gray-500 text-center">
// // //                 You are listening to the live stream
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // // import React, { useEffect, useState } from 'react';
// // // import { Song } from '@/lib/song';
// // // import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
// // // import LastPlayedSong from '@/lib/features/lastPlayed';

// // // interface NowPlayingProps {
// // //   song: Song | null;
// // //   audioRef: React.RefObject<HTMLAudioElement | null>;
// // //   setSong: (s: Song | null) => void;
// // //   isDJ: boolean;
// // //   onSkip: () => void;
// // //   emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
// // //   onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
// // //   offPlaybackUpdate: (callback: (data?: any) => void) => void;
// // //   emitSkipSong: (data: { song: Song }) => void;
// // //   onSkipSong: (callback: (data: { song: Song }) => void) => void;
// // //   offSkipSong: (callback: (data: { song: Song }) => void) => void;
// // //   organizationId: string,
// // // }

// // // export default function NowPlaying({
// // //   song,
// // //   audioRef,
// // //   setSong,
// // //   isDJ,
// // //   onSkip,
// // //   organizationId,
// // //   emitPlaybackUpdate,
// // //   onPlaybackUpdate,
// // //   offPlaybackUpdate,
// // //   emitSkipSong,
// // //   onSkipSong,
// // //   offSkipSong
// // // }: NowPlayingProps) {
// // //   const [isPlaying, setIsPlaying] = useState(false);
// // //   const [currentTime, setCurrentTime] = useState(0);
// // //   const [duration, setDuration] = useState(0);
// // //   const [isAudioReady, setIsAudioReady] = useState(false);
// // //   const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
// // //   const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
// // //   const [volume, setVolume] = useState(initialVolume);

// // //   const handleSkipClick = async () => {
// // //     try {
// // //       console.log("skipping the song");
// // //       if (song) await LastPlayedSong(song.id, organizationId);
// // //       onSkip();
// // //     } catch (err) {
// // //       console.error("Failed to save last played song:", err);
// // //       onSkip();
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (!isDJ) return;
// // //     const audio = audioRef.current;
// // //     if (!audio) return;

// // //     const handleEnded = async () => {
// // //       console.log("skipping the song");
// // //       if (song) await LastPlayedSong(song.id, organizationId);
// // //       onSkip();
// // //     };

// // //     audio.addEventListener('ended', handleEnded);
// // //     return () => audio.removeEventListener('ended', handleEnded);
// // //   }, [isDJ, song]);

// // //   useEffect(() => {
// // //     if (isDJ) return;

// // //     const handleSkipSong = (data: { song: Song }) => {
// // //       if (data.song) {
// // //         setSong(data.song);
// // //         setCurrentTime(0);
// // //         setIsPlaying(false);
// // //       } else {
// // //         console.warn("Received null or invalid song on skip");
// // //       }
// // //     };

// // //     onSkipSong(handleSkipSong);
// // //     return () => offSkipSong(handleSkipSong);
// // //   }, [isDJ, setSong, onSkipSong, offSkipSong]);

// // //   useEffect(() => {
// // //     if (!isDJ) return;
// // //     const audio = audioRef.current;
// // //     if (!audio || !song) return;

// // //     const interval = setInterval(() => {
// // //       emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
// // //     }, 500);

// // //     return () => clearInterval(interval);
// // //   }, [isDJ, song, audioRef, emitPlaybackUpdate]);

// // //   useEffect(() => {
// // //     const audio = audioRef.current;
// // //     if (!audio || !song?.downloadUrl) return;

// // //     const handleMetadataLoaded = () => {
// // //       setIsAudioReady(true);
// // //       setDuration(audio.duration);
// // //     };
    
// // //     if (audio.readyState >= 1) { 
// // //       setIsAudioReady(true);
// // //       setDuration(audio.duration);
// // //     } else {
// // //       setIsAudioReady(false);
// // //     }

// // //     if (audio.src !== song.downloadUrl) {
// // //       audio.src = song.downloadUrl;
// // //       audio.load();
// // //       audio.dataset.songId = String(song.id); 
      
// // //       if (isDJ) {
// // //         audio.volume = volume;
// // //         audio.play().catch((err) => console.warn('Autoplay failed:', err));
// // //       } else {
// // //         audio.muted = true;
// // //       }
// // //     } else {
// // //       if (isDJ) {
// // //         audio.volume = volume;
// // //       } else {
// // //         audio.muted = true;
// // //       }
// // //     }

// // //     const onTimeUpdate = () => setCurrentTime(audio.currentTime);
// // //     const onPlay = () => setIsPlaying(true);
// // //     const onPause = () => setIsPlaying(false);

// // //     audio.addEventListener('timeupdate', onTimeUpdate);
// // //     audio.addEventListener('loadedmetadata', handleMetadataLoaded);
// // //     audio.addEventListener('play', onPlay);
// // //     audio.addEventListener('pause', onPause);

// // //     return () => {
// // //       audio.removeEventListener('timeupdate', onTimeUpdate);
// // //       audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
// // //       audio.removeEventListener('play', onPlay);
// // //       audio.removeEventListener('pause', onPause);
// // //     };
// // //   }, [song?.id, song?.downloadUrl, audioRef, volume, isDJ]);

// // //   useEffect(() => {
// // //     if (isDJ) return;

// // //     const handlePlaybackUpdate = ({ time, isPlaying }: { time: number; isPlaying: boolean }) => {
// // //       const audio = audioRef.current;
// // //       if (!audio) return;

// // //       const timeDifference = Math.abs(audio.currentTime - time);
// // //       if (timeDifference > 0.3) {
// // //         audio.currentTime = time;
// // //       }
      
// // //       setCurrentTime(time);

// // //       if (isPlaying && audio.paused) {
// // //         audio.play().catch((err) => {
// // //           if (!err.message.includes('play() request was interrupted')) {
// // //             console.error('Autoplay failed:', err);
// // //           }
// // //         });
// // //       } else if (!isPlaying && !audio.paused) {
// // //         audio.pause();
// // //       }
// // //     };

// // //     onPlaybackUpdate(handlePlaybackUpdate);
// // //     return () => offPlaybackUpdate(handlePlaybackUpdate);
// // //   }, [isDJ, audioRef, onPlaybackUpdate, offPlaybackUpdate]);

// // //   useEffect(() => {
// // //     if (isDJ && song) {
// // //       emitSkipSong({ song });
// // //     }
// // //   }, [song, isDJ, emitSkipSong]);

// // //   const togglePlay = () => {
// // //     const audio = audioRef.current;
// // //     if (!audio) return;

// // //     if (audio.paused) {
// // //       audio.play().catch(console.error);
// // //     } else {
// // //       audio.pause();
// // //     }
// // //   };

// // //   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
// // //     if (!isDJ || !isAudioReady) return;
    
// // //     const audio = audioRef.current;
// // //     if (!audio) return;

// // //     const newTime = (parseFloat(e.target.value) / 100) * duration;
// // //     audio.currentTime = newTime;
// // //     setCurrentTime(newTime);
// // //   };

// // //   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// // //     if (!isDJ) return;
// // //     const newVolume = parseFloat(e.target.value) / 100;
// // //     setVolume(newVolume);
// // //     const audio = audioRef.current;
// // //     if (audio) audio.volume = newVolume;
// // //     sessionStorage.setItem("volume", newVolume.toString());
// // //   };

// // //   useEffect(() => {
// // //     const audio = audioRef.current;
// // //     if (audio) audio.volume = volume;
// // //   }, [volume, audioRef]);

// // //   const formatTime = (sec: number) => {
// // //     if (isNaN(sec)) return '0:00';
// // //     const minutes = Math.floor(sec / 60);
// // //     const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
// // //     return `${minutes}:${seconds}`;
// // //   };

// // //   const progressPercentage = song?.duration && parseInt(song.duration) > 0 ? (currentTime / parseInt(song.duration)) * 100 : 0;

// // //   if (!song) {
// // //     return (
// // //       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// // //         <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// // //           <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// // //           <div className="flex items-center text-purple-100">
// // //             <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// // //             Live
// // //           </div>
// // //         </div>
// // //         <div className="p-4 sm:p-8 flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 text-center md:text-left">
// // //           <div className="flex-shrink-0">
// // //             <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-200 flex items-center justify-center shadow-lg">
// // //               <Music className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500" />
// // //             </div>
// // //           </div>
// // //           <div className="flex-1 min-w-0">
// // //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Ready to start the music?</h3>
// // //             <p className="text-sm md:text-lg text-gray-600">Search and add the first song to get the party started!</p>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// // //       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
// // //         <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
// // //         <div className="flex items-center text-purple-100">
// // //           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// // //           Live
// // //         </div>
// // //       </div>

// // //       <div className="p-4 sm:p-8">
// // //         <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
// // //           <div className="flex-shrink-0">
// // //             <img
// // //               src={song.image}
// // //               alt={song.name}
// // //               className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover shadow-lg"
// // //             />
// // //           </div>

// // //           <div className="flex-1 min-w-0 text-center md:text-left">
// // //             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
// // //             <p className="text-sm md:text-lg text-gray-600 mb-4 truncate">
// // //               {song.primaryArtists?.map((a) => a.name).join(', ')}
// // //             </p>
// // //             {song.album && (
// // //               <p className="text-xs md:text-sm text-gray-500 mb-4">Album: {song.album}</p>
// // //             )}

// // //             <div className="space-y-2">
// // //               <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
// // //                 <span>{formatTime(currentTime)}</span>
// // //                 <span>{formatTime(parseInt(song.duration))}</span>
// // //               </div>
// // //               <div className="relative">
// // //                 <div className="w-full h-2 bg-gray-200 rounded-full">
// // //                   <div
// // //                     className="h-2 bg-purple-600 rounded-full transition-all duration-300"
// // //                     style={{ width: `${progressPercentage}%` }}
// // //                   ></div>
// // //                 </div>
// // //                 <input
// // //                   type="range"
// // //                   min="0"
// // //                   max="100"
// // //                   value={progressPercentage}
// // //                   onChange={handleSeek}
// // //                   className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
// // //                   disabled={!isDJ || !isAudioReady}
// // //                 />
// // //               </div>
// // //             </div>

// // //             {isDJ ? (
// // //               <div className="flex items-center justify-between mt-6">
// // //                 <div className="flex items-center space-x-4">
// // //                   <button
// // //                     onClick={togglePlay}
// // //                     className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
// // //                   >
// // //                     {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
// // //                   </button>
// // //                   <button
// // //                     onClick={handleSkipClick}
// // //                     className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
// // //                   >
// // //                     <SkipForward className="w-5 h-5" />
// // //                   </button>
// // //                 </div>

// // //                 <div className="flex items-center space-x-2">
// // //                   <Volume2 className="w-5 h-5 text-gray-600" />
// // //                   <input
// // //                     type="range"
// // //                     min="0"
// // //                     max="100"
// // //                     value={volume * 100}
// // //                     onChange={handleVolumeChange}
// // //                     className="w-20"
// // //                   />
// // //                 </div>
// // //               </div>
// // //             ) : (
// // //               <div className="mt-6 text-sm text-gray-500 text-center">
// // //                 You are listening to the live stream
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // import React, { useEffect, useState } from 'react';
// // // import { Song } from '@/lib/song';
// // // import { Play, Pause, SkipForward, Volume2 } from 'lucide-react';
// // // import LastPlayedSong from '@/lib/features/lastPlayed';

// // // interface NowPlayingProps {
// // //   song: Song | null;
// // //   audioRef: React.RefObject<HTMLAudioElement | null>;
// // //   setSong: (s: Song | null) => void;
// // //   isDJ: boolean;
// // //   onSkip: () => void;
// // //   emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
// // //   onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
// // //   offPlaybackUpdate: (callback: (data?: any) => void) => void;
// // //   emitSkipSong: (data: { song: Song }) => void;
// // //   onSkipSong: (callback: (data: { song: Song }) => void) => void;
// // //   offSkipSong: (callback: (data: { song: Song }) => void) => void;
// // //   organizationId: string,
// // // }

// // // export default function NowPlaying({
// // //   song,
// // //   audioRef,
// // //   setSong,
// // //   isDJ,
// // //   onSkip,
// // //   organizationId,
// // //   emitPlaybackUpdate,
// // //   onPlaybackUpdate,
// // //   offPlaybackUpdate,
// // //   emitSkipSong,
// // //   onSkipSong,
// // //   offSkipSong
// // // }: NowPlayingProps) {
// // //   const [isPlaying, setIsPlaying] = useState(false);
// // //   const [currentTime, setCurrentTime] = useState(0);
// // //   const [duration, setDuration] = useState(0);
// // //   const [isAudioReady, setIsAudioReady] = useState(false);
// // //   const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
// // //   const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
// // //   const [volume, setVolume] = useState(initialVolume);

// // //   const handleSkipClick = async () => {
// // //     try {
// // //       console.log("skipping the song")
// // //       alert("Skip clicked");
// // //       if (song) await LastPlayedSong(song.id, organizationId);
// // //       onSkip();
// // //     } catch (err) {
// // //       console.error("Failed to save last played song:", err);
// // //       onSkip();
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (!isDJ) return;
// // //     const audio = audioRef.current;
// // //     if (!audio) return;

// // //     const handleEnded = async () => {
// // //       console.log("skipping the song")
// // //       if (song) await LastPlayedSong(song.id, organizationId);
// // //       onSkip();
// // //     };

// // //     audio.addEventListener('ended', handleEnded);
// // //     return () => audio.removeEventListener('ended', handleEnded);
// // //   }, [isDJ, song]);

// // //   useEffect(() => {
// // //     if (isDJ) return;

// // //     const handleSkipSong = (data: { song: Song }) => {
// // //       if (data.song) {
// // //         setSong(data.song);
// // //         setCurrentTime(0);
// // //         setIsPlaying(false);
// // //       } else {
// // //         console.warn("Received null or invalid song on skip");
// // //       }
// // //     };

// // //     onSkipSong(handleSkipSong);
// // //     return () => offSkipSong(handleSkipSong);
// // //   }, [isDJ, setSong, onSkipSong, offSkipSong]);

// // //   useEffect(() => {
// // //     if (!isDJ) return;
// // //     const audio = audioRef.current;
// // //     if (!audio || !song) return;

// // //     const interval = setInterval(() => {
// // //       emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
// // //     }, 500);

// // //     return () => clearInterval(interval);
// // //   }, [isDJ, song, audioRef, emitPlaybackUpdate]);

// // //   useEffect(() => {
// // //     const audio = audioRef.current;
// // //     if (!audio || !song?.downloadUrl) return;

// // //     const handleMetadataLoaded = () => {
// // //       setIsAudioReady(true);
// // //       setDuration(audio.duration);
// // //     };
    
// // //     if (audio.readyState >= 1) { 
// // //       setIsAudioReady(true);
// // //       setDuration(audio.duration);
// // //     } else {
// // //       setIsAudioReady(false);
// // //     }

// // //     if (audio.src !== song.downloadUrl) {
// // //       audio.src = song.downloadUrl;
// // //       audio.load();
// // //       audio.dataset.songId = String(song.id); 
      
// // //       if (isDJ) {
// // //         audio.volume = volume;
// // //         audio.play().catch((err) => console.warn('Autoplay failed:', err));
// // //       } else {
// // //         audio.muted = true;
// // //       }
// // //     } else {
// // //       if (isDJ) {
// // //         audio.volume = volume;
// // //       } else {
// // //         audio.muted = true;
// // //       }
// // //     }

// // //     const onTimeUpdate = () => setCurrentTime(audio.currentTime);
// // //     const onPlay = () => setIsPlaying(true);
// // //     const onPause = () => setIsPlaying(false);

// // //     audio.addEventListener('timeupdate', onTimeUpdate);
// // //     audio.addEventListener('loadedmetadata', handleMetadataLoaded);
// // //     audio.addEventListener('play', onPlay);
// // //     audio.addEventListener('pause', onPause);

// // //     return () => {
// // //       audio.removeEventListener('timeupdate', onTimeUpdate);
// // //       audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
// // //       audio.removeEventListener('play', onPlay);
// // //       audio.removeEventListener('pause', onPause);
// // //     };
// // //   }, [song?.id, song?.downloadUrl, audioRef, volume, isDJ]);

// // //   useEffect(() => {
// // //     if (isDJ) return;

// // //     const handlePlaybackUpdate = ({ time, isPlaying }: { time: number; isPlaying: boolean }) => {
// // //       const audio = audioRef.current;
// // //       if (!audio) return;

// // //       const timeDifference = Math.abs(audio.currentTime - time);
// // //       if (timeDifference > 0.3) {
// // //         audio.currentTime = time;
// // //       }
      
// // //       setCurrentTime(time);

// // //       if (isPlaying && audio.paused) {
// // //         audio.play().catch((err) => {
// // //           if (!err.message.includes('play() request was interrupted')) {
// // //             console.error('Autoplay failed:', err);
// // //           }
// // //         });
// // //       } else if (!isPlaying && !audio.paused) {
// // //         audio.pause();
// // //       }
// // //     };

// // //     onPlaybackUpdate(handlePlaybackUpdate);
// // //     return () => offPlaybackUpdate(handlePlaybackUpdate);
// // //   }, [isDJ, audioRef, onPlaybackUpdate, offPlaybackUpdate]);

// // //   useEffect(() => {
// // //     if (isDJ && song) {
// // //       emitSkipSong({ song });
// // //     }
// // //   }, [song, isDJ, emitSkipSong]);

// // //   const togglePlay = () => {
// // //     const audio = audioRef.current;
// // //     if (!audio) return;

// // //     if (audio.paused) {
// // //       audio.play().catch(console.error);
// // //     } else {
// // //       audio.pause();
// // //     }
// // //   };

// // //   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
// // //     if (!isDJ || !isAudioReady) return;
    
// // //     const audio = audioRef.current;
// // //     if (!audio) return;

// // //     const newTime = (parseFloat(e.target.value) / 100) * duration;
// // //     audio.currentTime = newTime;
// // //     setCurrentTime(newTime);
// // //   };

// // //   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// // //     if (!isDJ) return;
// // //     const newVolume = parseFloat(e.target.value) / 100;
// // //     setVolume(newVolume);
// // //     const audio = audioRef.current;
// // //     if (audio) audio.volume = newVolume;
// // //     sessionStorage.setItem("volume", newVolume.toString());
// // //   };

// // //   useEffect(() => {
// // //     const audio = audioRef.current;
// // //     if (audio) audio.volume = volume;
// // //   }, [volume, audioRef]);

// // //   const formatTime = (sec: number) => {
// // //     if (isNaN(sec)) return '0:00';
// // //     const minutes = Math.floor(sec / 60);
// // //     const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
// // //     return `${minutes}:${seconds}`;
// // //   };

// // //   const progressPercentage = song?.duration && parseInt(song.duration) > 0 ? (currentTime / parseInt(song.duration)) * 100 : 0;

// // //   if (!song) {
// // //     return (
// // //       <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center min-h-[300px]">
// // //         <div className="text-center">
// // //           <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to start the music?</h2>
// // //           <p className="text-lg text-gray-600">Search and add the first song to get the party started!</p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// // //       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
// // //         <h2 className="text-2xl font-bold mb-2">Now Playing</h2>
// // //         <div className="flex items-center text-purple-100">
// // //           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
// // //           Live
// // //         </div>
// // //       </div>

// // //       <div className="p-8">
// // //         <div className="flex items-center space-x-6">
// // //           <div className="flex-shrink-0">
// // //             <img
// // //               src={song.image}
// // //               alt={song.name}
// // //               className="w-32 h-32 rounded-xl object-cover shadow-lg"
// // //             />
// // //           </div>

// // //           <div className="flex-1 min-w-0">
// // //             <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
// // //             <p className="text-lg text-gray-600 mb-4 truncate">
// // //               {song.primaryArtists?.map((a) => a.name).join(', ')}
// // //             </p>
// // //             {song.album && (
// // //               <p className="text-sm text-gray-500 mb-4">Album: {song.album}</p>
// // //             )}

// // //             <div className="space-y-2">
// // //               <div className="flex items-center justify-between text-sm text-gray-500">
// // //                 <span>{formatTime(currentTime)}</span>
// // //                 <span>{formatTime(parseInt(song.duration))}</span>
// // //               </div>
// // //               <div className="relative">
// // //                 <div className="w-full h-2 bg-gray-200 rounded-full">
// // //                   <div
// // //                     className="h-2 bg-purple-600 rounded-full transition-all duration-300"
// // //                     style={{ width: `${progressPercentage}%` }}
// // //                   ></div>
// // //                 </div>
// // //                 <input
// // //                   type="range"
// // //                   min="0"
// // //                   max="100"
// // //                   value={progressPercentage}
// // //                   onChange={handleSeek}
// // //                   className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
// // //                   disabled={!isDJ || !isAudioReady}
// // //                 />
// // //               </div>
// // //             </div>

// // //             {isDJ ? (
// // //               <div className="flex items-center justify-between mt-6">
// // //                 <div className="flex items-center space-x-4">
// // //                   <button
// // //                     onClick={togglePlay}
// // //                     className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
// // //                   >
// // //                     {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
// // //                   </button>
// // //                   <button
// // //                     onClick={handleSkipClick}
// // //                     className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
// // //                   >
// // //                     <SkipForward className="w-5 h-5" />
// // //                   </button>
// // //                 </div>

// // //                 <div className="flex items-center space-x-2">
// // //                   <Volume2 className="w-5 h-5 text-gray-600" />
// // //                   <input
// // //                     type="range"
// // //                     min="0"
// // //                     max="100"
// // //                     value={volume * 100}
// // //                     onChange={handleVolumeChange}
// // //                     className="w-20"
// // //                   />
// // //                 </div>
// // //               </div>
// // //             ) : (
// // //               <div className="mt-6 text-sm text-gray-500 text-center">
// // //                 You are listening to the live stream
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }
