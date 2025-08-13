// import { useState, useEffect } from 'react';
// import { Song } from '@/lib/song';

// export default function LyricsDisplay({ song }: { song: Song }) {
//   const [lyrics, setLyrics] = useState<string>('Loading lyrics...');

//   useEffect(() => {
//     const artist = song.primaryArtists?.[0]?.name || 'Unknown Artist';
//     const title = song.name;

//     async function fetchLyrics(artist: string, title: string) {
//       try {
//         const resp = await fetch(
//           `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
//         );
//         if (!resp.ok) {
//           throw new Error(`Lyrics not found (HTTP ${resp.status})`);
//         }
//         const data = await resp.json();
//         return data.lyrics || 'Lyrics not found.';
//       } catch (err) {
//         return 'Lyrics not available.';
//       }
//     }


//     fetchLyrics(artist, title);
//   }, [song.primaryArtists?.[0]?.name, song.name]);

//   return (
//     <div className="whitespace-pre-line">
//       <p>{lyrics}</p>
//     </div>
//   );
// }
