import { create } from 'zustand';
import { Song } from '@/lib/song';
import React from 'react';

interface NowPlayingStore {
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
  previousSong: Song | null;
  setPreviousSong: (song: Song | null) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export const useNowPlayingStore = create<NowPlayingStore>((set) => ({
  currentSong: null,
  setCurrentSong: (song) => set({ currentSong: song }),
  previousSong: null,
  setPreviousSong: (song) => set({ previousSong: song }),
  audioRef: React.createRef<HTMLAudioElement>(),
}));
// import { create } from 'zustand';
// import { Song } from '@/lib/song';
// import React from 'react';

// interface NowPlayingStore {
//   currentSong: Song | null;
//   setCurrentSong: (song: Song | null) => void;
//   audioRef: React.RefObject<HTMLAudioElement | null>; // ✅ Allow null
// }

// export const useNowPlayingStore = create<NowPlayingStore>((set) => ({
//   currentSong: null,
//   setCurrentSong: (song) => set({ currentSong: song }),
//   audioRef: React.createRef<HTMLAudioElement>(), // ✅ This returns RefObject<HTMLAudioElement | null>
// }));