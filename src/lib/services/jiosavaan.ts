import {Song} from "../song"
const JIOSAAVN_BASE_URL = 'https://saavn.dev/api';

export class JioSaavnService {
  static async searchSongs(query: string, limit: number = 20): Promise<Song[]> {
    try {
      const response = await fetch(
        `${JIOSAAVN_BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search songs');
      }
      
      const data = await response.json();
      
      return data.data.results.map((song: any) => ({
        id: song.id,
        name: song.name,
        primaryArtists: song.artists.primary,
        image: song.image[2]?.url || song.image[1]?.url || song.image[0]?.url,
        duration: song.duration,
        album: song.album?.name || '',
        year: song.year || '',
        downloadUrl : song.downloadUrl[4]?.url || song.downloadUrl[3]?.url || song.downloadUrl[2]?.url || song.downloadUrl[1]?.url || song.downloadUrl[0]?.url,
      }));
    } catch (error) {
      console.error('Error searching songs:', error);
      return [];
    }
  }

  static async getSongDetails(songId: string): Promise<Song | null> {
    try {
      const response = await fetch(`${JIOSAAVN_BASE_URL}/songs/${songId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get song details');
      }
      
      const data = await response.json();
      const song = data.data[0];
      
      return {
        id: song.id,
        name: song.name,
        primaryArtists: song.primaryArtists,
        image: song.image[2]?.url || song.image[1]?.url || song.image[0]?.url,
        duration: song.duration,
        album: song.album?.name || '',
        year: song.year || '',
        downloadUrl : song.downloadUrl[4]?.url || song.downloadUrl[3]?.url || song.downloadUrl[2]?.url || song.downloadUrl[1]?.url || song.downloadUrl[0]?.url,
      };
    } catch (error) {
      console.error('Error getting song details:', error);
      return null;
    }
  }
}