import { Song } from '@/lib/song';

/**
 * Fetches song details from the server by organization and song ID.
 *
 * @param {string} orgid The unique ID of the organization.
 * @param {string} songid The unique ID of the song (JioSaavn ID).
 * @returns {Promise<Song>} A promise that resolves with the song data.
 * @throws {Error} Throws an error if the request fails or the song is not found.
 */
export async function fetchSongDetails(orgid: string, songid: string): Promise<Song> {
  // Construct the URL with search parameters
  console.log(songid);
  const url = `/api/song?orgid=${orgid}&songid=${songid}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: Authorization header is not needed for this public GET request
      },
    });

    if (!response.ok) {
      // Parse the error message from the server response
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch song details');
    }

    const songData: Song = await response.json();
    return songData;
  } catch (error) {
    console.error('API call to fetchSongDetails failed:', error);
    throw error;
  }
}