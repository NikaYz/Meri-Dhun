// // This interface now represents the combined data for a song that the front-end will display.
// // It merges the static song metadata with the organization-specific metrics.
// export interface Song {
//   // Fields from SongMetadata
//   id: string;
//   name: string;
//   primaryArtists: { id: string; name: string; [key: string]: any }[];
//   image: string;
//   duration: string;
//   album: string;
//   year: string;
//   downloadUrl?: string;

//   // Fields from OrgSong
//   orgSongId: string; // The unique ID for this song within the organization
//   playCount?: number;
//   lastPlayed?: string;
//   upvotes?: number;
//   downvotes?: number;
//   paidBoosts?: number;
// }

// export interface SearchResult {
//   results: Song[];
//   total: number;
// }

// // NOTE: LastPlayedSong interface has been removed as the data is now part of the OrgSong model.

// // This interface now correctly maps to the data returned from the new leaderboard API route.
// export interface LeaderboardEntry {
//   song: Song; // Now uses the updated Song interface
//   rank: number;
//   score: number;
//   userVote?: 'UP' | 'DOWN' | null;
// }

// export interface SpecialRequest {
//   id: string;
//   type: 'birthday' | 'anniversary' | 'dedication' | 'custom';
//   message: string;
//   requestedBy: string;
//   timestamp: string;
//   paid: boolean;
//   amount?: number;
//   status: 'pending' | 'approved' | 'completed';
//   fromRole?: 'USER' | 'DJ';
//   visibility: 'public' | 'private';
//   isFirstFree: boolean;
// }


// export interface VenueSettings {
//   djMode: boolean;
//   autoPlay: boolean;
//   songCooldownMinutes: number;
//   qrValidityHours: number;
//   votingEnabled: boolean;
//   paymentEnabled: boolean;
//   specialRequestsEnabled: boolean;
// }

// // NOTE: The hasVoted field has been removed as this is now handled by the separate Vote table.
// export interface UserSession {
//   id: string;
//   organizationId: string;
//   role: 'USER' | 'ADMIN';
//   validUntil: string;
//   hasPaid: boolean;
// }

export interface Song {
  id: string;
  name: string;
  primaryArtists: { id: string; name: string; [key: string]: unknown}[];
  image: string;
  duration: string;
  album: string;
  year: string;
  playCount?: number;
  lastPlayed?: string;
  downloadUrl?: string;
  upvotes?: number;
  downvotes?: number;
}

export interface SearchResult {
  results: Song[];
  total: number;
}
export interface LastPlayedSong {
  id: string;
  orgId: string;
  songId: string;
  playedAt: string;
}
export interface LeaderboardEntry {
  song: Song;
  playCount: number;
  upvotes: number;
  downvotes: number;
  paidBoosts: number;
  lastPlayed: string;
  rank: number;
  score: number;
  addedBy: string;
  timeAdded: string;
  userVote?: 'up' | 'down' | null;
}

export interface SpecialRequest {
  id: string;
  type: 'birthday' | 'anniversary' | 'dedication' | 'custom';
  message: string;
  requestedBy: string;
  timestamp: string;
  paid: boolean;
  amount?: number;
  status: 'pending' | 'approved' | 'completed';
  fromRole?: 'USER' | 'DJ'; 
  visibility: 'public' | 'private'; 
  isFirstFree: boolean;
}


export interface VenueSettings {
  djMode: boolean;
  autoPlay: boolean;
  songCooldownMinutes: number;
  qrValidityHours: number;
  votingEnabled: boolean;
  paymentEnabled: boolean;
  specialRequestsEnabled: boolean;
}

export interface UserSession {
  id: string;
  organizationId: string;
  role: 'USER' | 'ADMIN';
  validUntil: string;
  hasVoted: string[];
  hasPaid: boolean;
}
export interface NowPlayingState {
  organizationId: string;
  currentSong: Song | null;
  previousSong: Song | null;
  updatedAt: string;
}
export interface NowPlayingApiResponse {
  nowPlayingState: NowPlayingState | null;
}