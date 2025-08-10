import { Song, LeaderboardEntry, SpecialRequest, VenueSettings } from '@/lib/song';

export class LeaderboardService {
  private static getStorageKey(organizationId: string): string {
    return `leaderboard_${organizationId}`;
  }

  private static getPlayedSongsKey(organizationId: string): string {
    return `played_songs_${organizationId}`;
  }

  private static getSpecialRequestsKey(organizationId: string): string {
    return `special_requests_${organizationId}`;
  }

  private static getVenueSettingsKey(organizationId: string): string {
    return `venue_settings_${organizationId}`;
  }

  static getVenueSettings(organizationId: string): VenueSettings {
    try {
      const stored = localStorage.getItem(this.getVenueSettingsKey(organizationId));
      if (!stored) {
        const defaultSettings: VenueSettings = {
          djMode: false,
          autoPlay: true,
          songCooldownMinutes: 20,
          qrValidityHours: 1,
          votingEnabled: true,
          paymentEnabled: true,
          specialRequestsEnabled: true
        };
        this.saveVenueSettings(organizationId, defaultSettings);
        return defaultSettings;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading venue settings:', error);
      return {
        djMode: false,
        autoPlay: true,
        songCooldownMinutes: 20,
        qrValidityHours: 1,
        votingEnabled: true,
        paymentEnabled: true,
        specialRequestsEnabled: true
      };
    }
  }

  static saveVenueSettings(organizationId: string, settings: VenueSettings): void {
    localStorage.setItem(this.getVenueSettingsKey(organizationId), JSON.stringify(settings));
  }

  static async getLeaderboard(organizationId: string, sessionId: string): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`/api/leaderboard?organizationId=${organizationId}&sessionId=${sessionId}`);
    if (!response.ok) {
      console.error('Failed to fetch leaderboard:', response.statusText);
      return [];
    }
    const data: LeaderboardEntry[] = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

  static async addSongPlay(organizationId: string, song: Song, userId: string = 'anonymous'): Promise<void>{
    try {
      const leaderboard = await this.getLeaderboard(organizationId,userId);
      const existingIndex = leaderboard.findIndex(entry => entry.song.id === song.id);
      
      if (existingIndex >= 0) {
        leaderboard[existingIndex].playCount += 1;
        leaderboard[existingIndex].lastPlayed = new Date().toISOString();
      } else {
        leaderboard.push({
          song,
          playCount: 1,
          upvotes: 0,
          downvotes: 0,
          paidBoosts: 0,
          lastPlayed: new Date().toISOString(),
          rank: 0,
          score: 0,
          addedBy: userId,
          timeAdded: new Date().toISOString()
        });
      }
      
      localStorage.setItem(this.getStorageKey(organizationId), JSON.stringify(leaderboard));
      
      // Add to played songs with cooldown
      this.addToPlayedSongs(organizationId, song.id);
    } catch (error) {
      console.error('Error adding song play:', error);
    }
  }

static async voteSong(
  organizationId: string,
  songId: string,
  voteType: 'up' | 'down',
  userId: string
): Promise<'created' | 'updated' | 'removed' | 'error'> {
  try {
    const res = await fetch(`/api/vote?orgid=${organizationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        songId,
        sessionId: userId, 
        voteType: voteType.toUpperCase(),
      }),
    });

    if (!res.ok) {
      console.error('API error:', res.status);
      return 'error';
    }

    const data = await res.json();
    return data.status || 'error';
  } catch (error) {
    console.error('Error voting for song:', error);
    return 'error';
  }
}

  

  static async boostSong(organizationId: string, songId: string, amount: number, sessionId : string): Promise<boolean> {
    try {
      const leaderboard = await this.getLeaderboard(organizationId, sessionId);
      const songIndex = leaderboard.findIndex(entry => entry.song.id === songId);
      
      if (songIndex === -1) return false;
      
      const boostValue = Math.floor(amount / 5); // $5 = 1 boost point
      leaderboard[songIndex].paidBoosts += boostValue;
      
      localStorage.setItem(this.getStorageKey(organizationId), JSON.stringify(leaderboard));
      return true;
    } catch (error) {
      console.error('Error boosting song:', error);
      return false;
    }
  }

  private static getUserVotes(organizationId: string, userId: string): string[] {
    try {
      const stored = localStorage.getItem(`user_votes_${organizationId}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static addUserVote(organizationId: string, userId: string, songId: string): void {
    const votes = this.getUserVotes(organizationId, userId);
    votes.push(songId);
    localStorage.setItem(`user_votes_${organizationId}_${userId}`, JSON.stringify(votes));
  }

  static canPlaySong(organizationId: string, songId: string): boolean {
    const playedSongs = this.getPlayedSongs(organizationId);
    const settings = this.getVenueSettings(organizationId);
    const cooldownMs = settings.songCooldownMinutes * 60 * 1000;
    
    const lastPlayed = playedSongs[songId];
    if (!lastPlayed) return true;
    
    return Date.now() - new Date(lastPlayed).getTime() > cooldownMs;
  }

  private static getPlayedSongs(organizationId: string): Record<string, string> {
    try {
      const stored = localStorage.getItem(this.getPlayedSongsKey(organizationId));
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private static addToPlayedSongs(organizationId: string, songId: string): void {
    const playedSongs = this.getPlayedSongs(organizationId);
    playedSongs[songId] = new Date().toISOString();
    localStorage.setItem(this.getPlayedSongsKey(organizationId), JSON.stringify(playedSongs));
  }
  static async getSpecialRequests(organizationId: string): Promise<SpecialRequest[]> {
    try {
      const res = await fetch(`/api/special-requests?organizationId=${organizationId}`);
      if (!res.ok) throw new Error('Failed to fetch special requests');
      
      return await res.json();
    } catch (err) {
      console.error('Error fetching special requests:', err);
      return [];
    }
  }
  static async addSpecialRequest(
  organizationId: string,
  request: Omit<SpecialRequest, 'id' | 'timestamp' | 'organizationId'>
): Promise<string> {
  try {
    const res = await fetch(`/api/special-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...request,
        organizationId,
        timestamp: new Date().toISOString(),
        visibility: request.visibility || 'private',
        fromRole: request.fromRole || 'USER',
        isFirstFree: request.isFirstFree || false
      }),
    });
    if (!res.ok) throw new Error('Failed to add special request');
    const data = await res.json();
    return data.id;
  } catch (err) {
    console.error('Error adding special request:', err);
    throw err;
  }
}


  static async updateSpecialRequestStatus(
    organizationId: string,
    requestId: string,
    status: SpecialRequest['status']
  ) {
    try {
      const res = await fetch(`/api/special-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update special request status');
      return await res.json();
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    }
  }


  static async clearLeaderboard(organizationId: string): Promise<void> {
  try {
    localStorage.removeItem(this.getStorageKey(organizationId));
    await fetch(`/api/leaderboard?organizationId=${organizationId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('Failed to clear leaderboard:', err);
  }
}

  static async removeSongFromLeaderboard(organizationId: string, songId: string,): Promise<void> {
    try {
    localStorage.removeItem(this.getStorageKey(organizationId));
    await fetch(`/api/leaderboard?organizationId=${organizationId}&songId=${songId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('Failed to delete song from leaderboard:', err);
  }
}
}