// hooks/useSocket.ts
import { Song } from '@/lib/song';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
interface SocketEvents {
  'song-played': { songId: string; userId: string; organizationId: string };
  'song-voted': { songId: string; userId: string; organizationId: string };
  'now-playing-updated': { time: number; isPlaying: boolean };
  'leaderboard-update' : {song: Song; userId: string; organizationId: string }
}
type EventName = keyof SocketEvents;
type EventCallback<E extends EventName> = (payload: SocketEvents[E]) => void;
export const useSocket = (organizationId: string, sessionId: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      path: '/api/socket',
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      //console.log('✅ Connected', socket.id);
      socket.emit('join-organization', { organizationId, sessionId });
    });

    return () => {
      socket.disconnect();
    };
  }, [organizationId,sessionId]);
  const emitWithOrg = (event: string, data: unknown = {}) => {
  const payload = typeof data === 'object' && data !== null
    ? { ...data as Record<string, unknown>, organizationId }
    : { organizationId };

  socketRef.current?.emit(event, payload);
};
  // const emitWithOrg = (event: string, data: any = {}) => {
  //   //console.log(`📤 Emitting "${event}":`, data);
  //   socketRef.current?.emit(event, { ...data, organizationId });
  // };

  return {
    socket: socketRef.current,
    emitSongPlayed: (data: unknown) => emitWithOrg('song-played', data),
    emitSongVoted: (data: unknown) => emitWithOrg('song-voted', data),
    emitSongBoosted: (data: unknown) => emitWithOrg('song-boosted', data),
    emitSpecialRequest: (data: unknown) => emitWithOrg('special-request', data),
    emitLeaderboardUpdated: (data: unknown) => emitWithOrg('leaderboard-updated', data),
    emitNowPlayingUpdated: (data: unknown) => emitWithOrg('now-playing-updated', data),
    emitUpdateSong: (data: unknown) => emitWithOrg('update-song', data),
    emitSkipSong: (data: unknown) => emitWithOrg('skip-song', data),
    onSongPlayed: (cb: EventCallback<'song-played'>) => socketRef.current?.on('song-played', cb),
    offSongPlayed: (cb:  EventCallback<'song-played'>) => socketRef.current?.off('song-played', cb),

    onSongVoted: (cb:  EventCallback<'song-voted'> ) => socketRef.current?.on('song-voted', cb),
    offSongVoted: (cb:  EventCallback<'song-voted'>) => socketRef.current?.off('song-voted', cb),
    onSongBoosted: (cb:  EventCallback<'song-voted'>) => socketRef.current?.on('song-boosted', cb),
    offSongBoosted: (cb:  EventCallback<'song-voted'> ) => socketRef.current?.off('song-boosted', cb),
    // onSpecialRequest: (cb: SocketCallback) => socketRef.current?.on('special-request', cb),
    // offSpecialRequest: (cb: SocketCallback) => socketRef.current?.off('special-request', cb),
    onLeaderboardUpdated: (cb:  EventCallback<'leaderboard-update'>) => socketRef.current?.on('leaderboard-updated', cb),
    offLeaderboardUpdated: (cb:  EventCallback<'leaderboard-update'>) => socketRef.current?.off('leaderboard-updated', cb),
    onNowPlayingUpdated: (cb: EventCallback<'now-playing-updated'>) => socketRef.current?.on('now-playing-updated', cb),
    offNowPlayingUpdated: (cb: EventCallback<'now-playing-updated'>) => socketRef.current?.off('now-playing-updated', cb),
    onUpdateSong: (cb:  EventCallback<'song-played'>) => socketRef.current?.on('update-song', cb),
    offUpdateSong: (cb: EventCallback<'song-played'>) => socketRef.current?.off('update-song', cb),
    onSkipSong: (cb: EventCallback<'song-played'>) => socketRef.current?.on('skip-song', cb),
    offSkipSong: (cb: EventCallback<'song-played'>) => socketRef.current?.off('skip-song', cb),
  };
};

