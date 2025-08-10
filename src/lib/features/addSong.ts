type AddSongParams = {
  organizationId: string;
  token: string;
  song: {
    id: string;
    name: string;
     primaryArtists: { id: string; name: string }[];
    image: string;
    duration: number;
    album: string;
    year: string;
    downloadUrl: string;
  };
};

export async function addSongToOrg({ organizationId, token, song }: AddSongParams) {
  try {
    const songPayload = {
      organizationId,
      ...song,
      primaryArtists: song.primaryArtists.map(artist => artist.name).join(', '),
      duration: String(song.duration),
    };

    const res = await fetch(`/api/song?orgid=${organizationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ song: songPayload }),
    });

    const data = await res.json();

    if (!res.ok) {
     
      return { success: false, message: data.message || 'Failed to add song' };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Network error while adding song:', err);
    return { success: false, message: 'Network error. Please try again.' };
  }
}
