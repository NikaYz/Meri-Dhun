import React, { useEffect, useState } from 'react';
import { Song } from '@/lib/song';
import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
import LastPlayedSong from '@/lib/features/lastPlayed';

interface NowPlayingProps {
  song: Song | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  setSong: (s: Song | null) => void;
  isDJ: boolean;
  onSkip: () => void;
  emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
  onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
  offPlaybackUpdate: (callback: (data?: any) => void) => void;
  emitSkipSong: (data: { song: Song }) => void;
  onSkipSong: (callback: (data: { song: Song }) => void) => void;
  offSkipSong: (callback: (data: { song: Song }) => void) => void;
  organizationId: string,
}

export default function NowPlaying({
  song,
  audioRef,
  setSong,
  isDJ,
  onSkip,
  organizationId,
  emitPlaybackUpdate,
  onPlaybackUpdate,
  offPlaybackUpdate,
  emitSkipSong,
  onSkipSong,
  offSkipSong
}: NowPlayingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
  const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
  const [volume, setVolume] = useState(initialVolume);

  const handleSkipClick = async () => {
    try {
      console.log("skipping the song");
      if (song) await LastPlayedSong(song.id, organizationId);
      onSkip();
    } catch (err) {
      console.error("Failed to save last played song:", err);
      onSkip();
    }
  };

  useEffect(() => {
    if (!isDJ) return;
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = async () => {
      console.log("skipping the song");
      if (song) await LastPlayedSong(song.id, organizationId);
      onSkip();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [isDJ, song]);

  useEffect(() => {
    if (isDJ) return;

    const handleSkipSong = (data: { song: Song }) => {
      if (data.song) {
        setSong(data.song);
        setCurrentTime(0);
        setIsPlaying(false);
      } else {
        console.warn("Received null or invalid song on skip");
      }
    };

    onSkipSong(handleSkipSong);
    return () => offSkipSong(handleSkipSong);
  }, [isDJ, setSong, onSkipSong, offSkipSong]);

  useEffect(() => {
    if (!isDJ) return;
    const audio = audioRef.current;
    if (!audio || !song) return;

    const interval = setInterval(() => {
      emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
    }, 500);

    return () => clearInterval(interval);
  }, [isDJ, song, audioRef, emitPlaybackUpdate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song?.downloadUrl) return;

    const handleMetadataLoaded = () => {
      setIsAudioReady(true);
      setDuration(audio.duration);
    };
    
    if (audio.readyState >= 1) { 
      setIsAudioReady(true);
      setDuration(audio.duration);
    } else {
      setIsAudioReady(false);
    }

    if (audio.src !== song.downloadUrl) {
      audio.src = song.downloadUrl;
      audio.load();
      audio.dataset.songId = String(song.id); 
      
      if (isDJ) {
        audio.volume = volume;
        audio.play().catch((err) => console.warn('Autoplay failed:', err));
      } else {
        audio.muted = true;
      }
    } else {
      if (isDJ) {
        audio.volume = volume;
      } else {
        audio.muted = true;
      }
    }

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', handleMetadataLoaded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [song?.id, song?.downloadUrl, audioRef, volume, isDJ]);

  useEffect(() => {
    if (isDJ) return;

    const handlePlaybackUpdate = ({ time, isPlaying }: { time: number; isPlaying: boolean }) => {
      const audio = audioRef.current;
      if (!audio) return;

      const timeDifference = Math.abs(audio.currentTime - time);
      if (timeDifference > 0.3) {
        audio.currentTime = time;
      }
      
      setCurrentTime(time);

      if (isPlaying && audio.paused) {
        audio.play().catch((err) => {
          if (!err.message.includes('play() request was interrupted')) {
            console.error('Autoplay failed:', err);
          }
        });
      } else if (!isPlaying && !audio.paused) {
        audio.pause();
      }
    };

    onPlaybackUpdate(handlePlaybackUpdate);
    return () => offPlaybackUpdate(handlePlaybackUpdate);
  }, [isDJ, audioRef, onPlaybackUpdate, offPlaybackUpdate]);

  useEffect(() => {
    if (isDJ && song) {
      emitSkipSong({ song });
    }
  }, [song, isDJ, emitSkipSong]);

  const togglePlay = () => {
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

  useEffect(() => {
      const audio = audioRef.current;
      if (audio) audio.volume = volume;
  }, [volume, audioRef]);

  const formatTime = (sec: number) => {
      if (isNaN(sec)) return '0:00';
      const minutes = Math.floor(sec / 60);
      const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
  };

  const progressPercentage = song?.duration && parseInt(song.duration) > 0 ? (currentTime / parseInt(song.duration)) * 100 : 0;

  if (!song) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
          <div className="flex items-center text-purple-100">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Live
          </div>
        </div>
        <div className="p-4 sm:p-8 flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 text-center md:text-left">
          <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto sm:max-w-none">
            <div className="w-full h-auto aspect-square rounded-xl bg-gray-200 flex items-center justify-center shadow-lg">
              <Music className="w-1/2 h-1/2 text-gray-500" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Ready to start the music?</h3>
            <p className="text-sm md:text-lg text-gray-600">Search and add the first song to get the party started!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
        <div className="flex items-center text-purple-100">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Live
        </div>
      </div>

      <div className="p-4 sm:p-8">
        <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
          {/* 🚨 Fix: Add responsive width classes to the image container */}
          <div className="flex-shrink-0 w-full max-w-[12rem] md:w-48 lg:w-64 mx-auto md:mx-0">
            <img
              src={song.image}
              alt={song.name}
              className="w-full h-auto aspect-square rounded-xl object-cover shadow-lg"
            />
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
            <p className="text-sm md:text-lg text-gray-600 mb-4 truncate">
              {song.primaryArtists?.map((a) => a.name).join(', ')}
            </p>
            {song.album && (
              <p className="text-xs md:text-sm text-gray-500 mb-4">Album: {song.album}</p>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(parseInt(song.duration))}</span>
              </div>
              <div className="relative">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
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

            {isDJ ? (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </button>
                  <button
                    onClick={handleSkipClick}
                    className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-6 text-sm text-gray-500 text-center">
                You are listening to the live stream
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// import React, { useEffect, useState } from 'react';
// import { Song } from '@/lib/song';
// import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
// import LastPlayedSong from '@/lib/features/lastPlayed';

// interface NowPlayingProps {
//   song: Song | null;
//   audioRef: React.RefObject<HTMLAudioElement | null>;
//   setSong: (s: Song | null) => void;
//   isDJ: boolean;
//   onSkip: () => void;
//   emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
//   onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
//   offPlaybackUpdate: (callback: (data?: any) => void) => void;
//   emitSkipSong: (data: { song: Song }) => void;
//   onSkipSong: (callback: (data: { song: Song }) => void) => void;
//   offSkipSong: (callback: (data: { song: Song }) => void) => void;
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
//   emitSkipSong,
//   onSkipSong,
//   offSkipSong
// }: NowPlayingProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [isAudioReady, setIsAudioReady] = useState(false);
//   const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
//   const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
//   const [volume, setVolume] = useState(initialVolume);

//   const handleSkipClick = async () => {
//     try {
//       console.log("skipping the song");
//       if (song) await LastPlayedSong(song.id, organizationId);
//       onSkip();
//     } catch (err) {
//       console.error("Failed to save last played song:", err);
//       onSkip();
//     }
//   };

//   useEffect(() => {
//     if (!isDJ) return;
//     const audio = audioRef.current;
//     if (!audio) return;

//     const handleEnded = async () => {
//       console.log("skipping the song");
//       if (song) await LastPlayedSong(song.id, organizationId);
//       onSkip();
//     };

//     audio.addEventListener('ended', handleEnded);
//     return () => audio.removeEventListener('ended', handleEnded);
//   }, [isDJ, song]);

//   useEffect(() => {
//     if (isDJ) return;

//     const handleSkipSong = (data: { song: Song }) => {
//       if (data.song) {
//         setSong(data.song);
//         setCurrentTime(0);
//         setIsPlaying(false);
//       } else {
//         console.warn("Received null or invalid song on skip");
//       }
//     };

//     onSkipSong(handleSkipSong);
//     return () => offSkipSong(handleSkipSong);
//   }, [isDJ, setSong, onSkipSong, offSkipSong]);

//   useEffect(() => {
//     if (!isDJ) return;
//     const audio = audioRef.current;
//     if (!audio || !song) return;

//     const interval = setInterval(() => {
//       emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
//     }, 500);

//     return () => clearInterval(interval);
//   }, [isDJ, song, audioRef, emitPlaybackUpdate]);

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio || !song?.downloadUrl) return;

//     const handleMetadataLoaded = () => {
//       setIsAudioReady(true);
//       setDuration(audio.duration);
//     };
    
//     if (audio.readyState >= 1) { 
//       setIsAudioReady(true);
//       setDuration(audio.duration);
//     } else {
//       setIsAudioReady(false);
//     }

//     if (audio.src !== song.downloadUrl) {
//       audio.src = song.downloadUrl;
//       audio.load();
//       audio.dataset.songId = String(song.id); 
      
//       if (isDJ) {
//         audio.volume = volume;
//         audio.play().catch((err) => console.warn('Autoplay failed:', err));
//       } else {
//         audio.muted = true;
//       }
//     } else {
//       if (isDJ) {
//         audio.volume = volume;
//       } else {
//         audio.muted = true;
//       }
//     }

//     const onTimeUpdate = () => setCurrentTime(audio.currentTime);
//     const onPlay = () => setIsPlaying(true);
//     const onPause = () => setIsPlaying(false);

//     audio.addEventListener('timeupdate', onTimeUpdate);
//     audio.addEventListener('loadedmetadata', handleMetadataLoaded);
//     audio.addEventListener('play', onPlay);
//     audio.addEventListener('pause', onPause);

//     return () => {
//       audio.removeEventListener('timeupdate', onTimeUpdate);
//       audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
//       audio.removeEventListener('play', onPlay);
//       audio.removeEventListener('pause', onPause);
//     };
//   }, [song?.id, song?.downloadUrl, audioRef, volume, isDJ]);

//   useEffect(() => {
//     if (isDJ) return;

//     const handlePlaybackUpdate = ({ time, isPlaying }: { time: number; isPlaying: boolean }) => {
//       const audio = audioRef.current;
//       if (!audio) return;

//       const timeDifference = Math.abs(audio.currentTime - time);
//       if (timeDifference > 0.3) {
//         audio.currentTime = time;
//       }
      
//       setCurrentTime(time);

//       if (isPlaying && audio.paused) {
//         audio.play().catch((err) => {
//           if (!err.message.includes('play() request was interrupted')) {
//             console.error('Autoplay failed:', err);
//           }
//         });
//       } else if (!isPlaying && !audio.paused) {
//         audio.pause();
//       }
//     };

//     onPlaybackUpdate(handlePlaybackUpdate);
//     return () => offPlaybackUpdate(handlePlaybackUpdate);
//   }, [isDJ, audioRef, onPlaybackUpdate, offPlaybackUpdate]);

//   useEffect(() => {
//     if (isDJ && song) {
//       emitSkipSong({ song });
//     }
//   }, [song, isDJ, emitSkipSong]);

//   const togglePlay = () => {
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

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (audio) audio.volume = volume;
//   }, [volume, audioRef]);

//   const formatTime = (sec: number) => {
//     if (isNaN(sec)) return '0:00';
//     const minutes = Math.floor(sec / 60);
//     const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
//     return `${minutes}:${seconds}`;
//   };

//   const progressPercentage = song?.duration && parseInt(song.duration) > 0 ? (currentTime / parseInt(song.duration)) * 100 : 0;

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
//           <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto sm:max-w-none">
//             <div className="w-full h-auto aspect-square rounded-xl bg-gray-200 flex items-center justify-center shadow-lg">
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
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
//         <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
//         <div className="flex items-center text-purple-100">
//           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
//           Live
//         </div>
//       </div>

//       <div className="p-4 sm:p-8">
//         <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
//           <div className="flex-shrink-0 w-full max-w-[12rem] mx-auto sm:max-w-none">
//             <img
//               src={song.image}
//               alt={song.name}
//               className="w-full h-auto aspect-square rounded-xl object-cover shadow-lg"
//             />
//           </div>

//           <div className="flex-1 min-w-0 text-center md:text-left">
//             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
//             <p className="text-sm md:text-lg text-gray-600 mb-4 truncate">
//               {song.primaryArtists?.map((a) => a.name).join(', ')}
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
//               <div className="flex items-center justify-between mt-6">
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

//                 <div className="flex items-center space-x-2">
//                   <Volume2 className="w-5 h-5 text-gray-600" />
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={volume * 100}
//                     onChange={handleVolumeChange}
//                     className="w-20"
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
// import React, { useEffect, useState } from 'react';
// import { Song } from '@/lib/song';
// import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
// import LastPlayedSong from '@/lib/features/lastPlayed';

// interface NowPlayingProps {
//   song: Song | null;
//   audioRef: React.RefObject<HTMLAudioElement | null>;
//   setSong: (s: Song | null) => void;
//   isDJ: boolean;
//   onSkip: () => void;
//   emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
//   onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
//   offPlaybackUpdate: (callback: (data?: any) => void) => void;
//   emitSkipSong: (data: { song: Song }) => void;
//   onSkipSong: (callback: (data: { song: Song }) => void) => void;
//   offSkipSong: (callback: (data: { song: Song }) => void) => void;
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
//   emitSkipSong,
//   onSkipSong,
//   offSkipSong
// }: NowPlayingProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [isAudioReady, setIsAudioReady] = useState(false);
//   const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
//   const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
//   const [volume, setVolume] = useState(initialVolume);

//   const handleSkipClick = async () => {
//     try {
//       console.log("skipping the song");
//       if (song) await LastPlayedSong(song.id, organizationId);
//       onSkip();
//     } catch (err) {
//       console.error("Failed to save last played song:", err);
//       onSkip();
//     }
//   };

//   useEffect(() => {
//     if (!isDJ) return;
//     const audio = audioRef.current;
//     if (!audio) return;

//     const handleEnded = async () => {
//       console.log("skipping the song");
//       if (song) await LastPlayedSong(song.id, organizationId);
//       onSkip();
//     };

//     audio.addEventListener('ended', handleEnded);
//     return () => audio.removeEventListener('ended', handleEnded);
//   }, [isDJ, song]);

//   useEffect(() => {
//     if (isDJ) return;

//     const handleSkipSong = (data: { song: Song }) => {
//       if (data.song) {
//         setSong(data.song);
//         setCurrentTime(0);
//         setIsPlaying(false);
//       } else {
//         console.warn("Received null or invalid song on skip");
//       }
//     };

//     onSkipSong(handleSkipSong);
//     return () => offSkipSong(handleSkipSong);
//   }, [isDJ, setSong, onSkipSong, offSkipSong]);

//   useEffect(() => {
//     if (!isDJ) return;
//     const audio = audioRef.current;
//     if (!audio || !song) return;

//     const interval = setInterval(() => {
//       emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
//     }, 500);

//     return () => clearInterval(interval);
//   }, [isDJ, song, audioRef, emitPlaybackUpdate]);

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio || !song?.downloadUrl) return;

//     const handleMetadataLoaded = () => {
//       setIsAudioReady(true);
//       setDuration(audio.duration);
//     };
    
//     if (audio.readyState >= 1) { 
//       setIsAudioReady(true);
//       setDuration(audio.duration);
//     } else {
//       setIsAudioReady(false);
//     }

//     if (audio.src !== song.downloadUrl) {
//       audio.src = song.downloadUrl;
//       audio.load();
//       audio.dataset.songId = String(song.id); 
      
//       if (isDJ) {
//         audio.volume = volume;
//         audio.play().catch((err) => console.warn('Autoplay failed:', err));
//       } else {
//         audio.muted = true;
//       }
//     } else {
//       if (isDJ) {
//         audio.volume = volume;
//       } else {
//         audio.muted = true;
//       }
//     }

//     const onTimeUpdate = () => setCurrentTime(audio.currentTime);
//     const onPlay = () => setIsPlaying(true);
//     const onPause = () => setIsPlaying(false);

//     audio.addEventListener('timeupdate', onTimeUpdate);
//     audio.addEventListener('loadedmetadata', handleMetadataLoaded);
//     audio.addEventListener('play', onPlay);
//     audio.addEventListener('pause', onPause);

//     return () => {
//       audio.removeEventListener('timeupdate', onTimeUpdate);
//       audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
//       audio.removeEventListener('play', onPlay);
//       audio.removeEventListener('pause', onPause);
//     };
//   }, [song?.id, song?.downloadUrl, audioRef, volume, isDJ]);

//   useEffect(() => {
//     if (isDJ) return;

//     const handlePlaybackUpdate = ({ time, isPlaying }: { time: number; isPlaying: boolean }) => {
//       const audio = audioRef.current;
//       if (!audio) return;

//       const timeDifference = Math.abs(audio.currentTime - time);
//       if (timeDifference > 0.3) {
//         audio.currentTime = time;
//       }
      
//       setCurrentTime(time);

//       if (isPlaying && audio.paused) {
//         audio.play().catch((err) => {
//           if (!err.message.includes('play() request was interrupted')) {
//             console.error('Autoplay failed:', err);
//           }
//         });
//       } else if (!isPlaying && !audio.paused) {
//         audio.pause();
//       }
//     };

//     onPlaybackUpdate(handlePlaybackUpdate);
//     return () => offPlaybackUpdate(handlePlaybackUpdate);
//   }, [isDJ, audioRef, onPlaybackUpdate, offPlaybackUpdate]);

//   useEffect(() => {
//     if (isDJ && song) {
//       emitSkipSong({ song });
//     }
//   }, [song, isDJ, emitSkipSong]);

//   const togglePlay = () => {
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

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (audio) audio.volume = volume;
//   }, [volume, audioRef]);

//   const formatTime = (sec: number) => {
//     if (isNaN(sec)) return '0:00';
//     const minutes = Math.floor(sec / 60);
//     const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
//     return `${minutes}:${seconds}`;
//   };

//   const progressPercentage = song?.duration && parseInt(song.duration) > 0 ? (currentTime / parseInt(song.duration)) * 100 : 0;

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
//           <div className="flex-shrink-0">
//             <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-200 flex items-center justify-center shadow-lg">
//               <Music className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500" />
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
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
//         <h2 className="text-xl sm:text-2xl font-bold mb-2">Now Playing</h2>
//         <div className="flex items-center text-purple-100">
//           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
//           Live
//         </div>
//       </div>

//       <div className="p-4 sm:p-8">
//         <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
//           <div className="flex-shrink-0">
//             <img
//               src={song.image}
//               alt={song.name}
//               className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover shadow-lg"
//             />
//           </div>

//           <div className="flex-1 min-w-0 text-center md:text-left">
//             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
//             <p className="text-sm md:text-lg text-gray-600 mb-4 truncate">
//               {song.primaryArtists?.map((a) => a.name).join(', ')}
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
//               <div className="flex items-center justify-between mt-6">
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

//                 <div className="flex items-center space-x-2">
//                   <Volume2 className="w-5 h-5 text-gray-600" />
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={volume * 100}
//                     onChange={handleVolumeChange}
//                     className="w-20"
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

// import React, { useEffect, useState } from 'react';
// import { Song } from '@/lib/song';
// import { Play, Pause, SkipForward, Volume2 } from 'lucide-react';
// import LastPlayedSong from '@/lib/features/lastPlayed';

// interface NowPlayingProps {
//   song: Song | null;
//   audioRef: React.RefObject<HTMLAudioElement | null>;
//   setSong: (s: Song | null) => void;
//   isDJ: boolean;
//   onSkip: () => void;
//   emitPlaybackUpdate: (data: { time: number; isPlaying: boolean }) => void;
//   onPlaybackUpdate: (callback: (data: { time: number; isPlaying: boolean }) => void) => void;
//   offPlaybackUpdate: (callback: (data?: any) => void) => void;
//   emitSkipSong: (data: { song: Song }) => void;
//   onSkipSong: (callback: (data: { song: Song }) => void) => void;
//   offSkipSong: (callback: (data: { song: Song }) => void) => void;
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
//   emitSkipSong,
//   onSkipSong,
//   offSkipSong
// }: NowPlayingProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [isAudioReady, setIsAudioReady] = useState(false);
//   const savedVolume = typeof window !== "undefined" ? sessionStorage.getItem("volume") : null;
//   const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
//   const [volume, setVolume] = useState(initialVolume);

//   const handleSkipClick = async () => {
//     try {
//       console.log("skipping the song")
//       alert("Skip clicked");
//       if (song) await LastPlayedSong(song.id, organizationId);
//       onSkip();
//     } catch (err) {
//       console.error("Failed to save last played song:", err);
//       onSkip();
//     }
//   };

//   useEffect(() => {
//     if (!isDJ) return;
//     const audio = audioRef.current;
//     if (!audio) return;

//     const handleEnded = async () => {
//       console.log("skipping the song")
//       if (song) await LastPlayedSong(song.id, organizationId);
//       onSkip();
//     };

//     audio.addEventListener('ended', handleEnded);
//     return () => audio.removeEventListener('ended', handleEnded);
//   }, [isDJ, song]);

//   useEffect(() => {
//     if (isDJ) return;

//     const handleSkipSong = (data: { song: Song }) => {
//       if (data.song) {
//         setSong(data.song);
//         setCurrentTime(0);
//         setIsPlaying(false);
//       } else {
//         console.warn("Received null or invalid song on skip");
//       }
//     };

//     onSkipSong(handleSkipSong);
//     return () => offSkipSong(handleSkipSong);
//   }, [isDJ, setSong, onSkipSong, offSkipSong]);

//   useEffect(() => {
//     if (!isDJ) return;
//     const audio = audioRef.current;
//     if (!audio || !song) return;

//     const interval = setInterval(() => {
//       emitPlaybackUpdate({ time: audio.currentTime, isPlaying: !audio.paused });
//     }, 500);

//     return () => clearInterval(interval);
//   }, [isDJ, song, audioRef, emitPlaybackUpdate]);

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio || !song?.downloadUrl) return;

//     const handleMetadataLoaded = () => {
//       setIsAudioReady(true);
//       setDuration(audio.duration);
//     };
    
//     if (audio.readyState >= 1) { 
//       setIsAudioReady(true);
//       setDuration(audio.duration);
//     } else {
//       setIsAudioReady(false);
//     }

//     if (audio.src !== song.downloadUrl) {
//       audio.src = song.downloadUrl;
//       audio.load();
//       audio.dataset.songId = String(song.id); 
      
//       if (isDJ) {
//         audio.volume = volume;
//         audio.play().catch((err) => console.warn('Autoplay failed:', err));
//       } else {
//         audio.muted = true;
//       }
//     } else {
//       if (isDJ) {
//         audio.volume = volume;
//       } else {
//         audio.muted = true;
//       }
//     }

//     const onTimeUpdate = () => setCurrentTime(audio.currentTime);
//     const onPlay = () => setIsPlaying(true);
//     const onPause = () => setIsPlaying(false);

//     audio.addEventListener('timeupdate', onTimeUpdate);
//     audio.addEventListener('loadedmetadata', handleMetadataLoaded);
//     audio.addEventListener('play', onPlay);
//     audio.addEventListener('pause', onPause);

//     return () => {
//       audio.removeEventListener('timeupdate', onTimeUpdate);
//       audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
//       audio.removeEventListener('play', onPlay);
//       audio.removeEventListener('pause', onPause);
//     };
//   }, [song?.id, song?.downloadUrl, audioRef, volume, isDJ]);

//   useEffect(() => {
//     if (isDJ) return;

//     const handlePlaybackUpdate = ({ time, isPlaying }: { time: number; isPlaying: boolean }) => {
//       const audio = audioRef.current;
//       if (!audio) return;

//       const timeDifference = Math.abs(audio.currentTime - time);
//       if (timeDifference > 0.3) {
//         audio.currentTime = time;
//       }
      
//       setCurrentTime(time);

//       if (isPlaying && audio.paused) {
//         audio.play().catch((err) => {
//           if (!err.message.includes('play() request was interrupted')) {
//             console.error('Autoplay failed:', err);
//           }
//         });
//       } else if (!isPlaying && !audio.paused) {
//         audio.pause();
//       }
//     };

//     onPlaybackUpdate(handlePlaybackUpdate);
//     return () => offPlaybackUpdate(handlePlaybackUpdate);
//   }, [isDJ, audioRef, onPlaybackUpdate, offPlaybackUpdate]);

//   useEffect(() => {
//     if (isDJ && song) {
//       emitSkipSong({ song });
//     }
//   }, [song, isDJ, emitSkipSong]);

//   const togglePlay = () => {
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

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (audio) audio.volume = volume;
//   }, [volume, audioRef]);

//   const formatTime = (sec: number) => {
//     if (isNaN(sec)) return '0:00';
//     const minutes = Math.floor(sec / 60);
//     const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
//     return `${minutes}:${seconds}`;
//   };

//   const progressPercentage = song?.duration && parseInt(song.duration) > 0 ? (currentTime / parseInt(song.duration)) * 100 : 0;

//   if (!song) {
//     return (
//       <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center min-h-[300px]">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to start the music?</h2>
//           <p className="text-lg text-gray-600">Search and add the first song to get the party started!</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
//         <h2 className="text-2xl font-bold mb-2">Now Playing</h2>
//         <div className="flex items-center text-purple-100">
//           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
//           Live
//         </div>
//       </div>

//       <div className="p-8">
//         <div className="flex items-center space-x-6">
//           <div className="flex-shrink-0">
//             <img
//               src={song.image}
//               alt={song.name}
//               className="w-32 h-32 rounded-xl object-cover shadow-lg"
//             />
//           </div>

//           <div className="flex-1 min-w-0">
//             <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate">{song.name}</h3>
//             <p className="text-lg text-gray-600 mb-4 truncate">
//               {song.primaryArtists?.map((a) => a.name).join(', ')}
//             </p>
//             {song.album && (
//               <p className="text-sm text-gray-500 mb-4">Album: {song.album}</p>
//             )}

//             <div className="space-y-2">
//               <div className="flex items-center justify-between text-sm text-gray-500">
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
//               <div className="flex items-center justify-between mt-6">
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

//                 <div className="flex items-center space-x-2">
//                   <Volume2 className="w-5 h-5 text-gray-600" />
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={volume * 100}
//                     onChange={handleVolumeChange}
//                     className="w-20"
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
