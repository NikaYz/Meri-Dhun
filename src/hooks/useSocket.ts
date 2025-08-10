// hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (organizationId: string, sessionId: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      path: '/api/socket',
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected', socket.id);
      socket.emit('join-organization', { organizationId, sessionId });
    });

    return () => {
      socket.disconnect();
    };
  }, [organizationId]);

  const emitWithOrg = (event: string, data: any = {}) => {
    //console.log(`📤 Emitting "${event}":`, data);
    socketRef.current?.emit(event, { ...data, organizationId });
  };

  return {
    socket: socketRef.current,
    emitSongPlayed: (data: any) => emitWithOrg('song-played', data),
    emitSongVoted: (data: any) => emitWithOrg('song-voted', data),
    emitSongBoosted: (data: any) => emitWithOrg('song-boosted', data),
    emitSpecialRequest: (data: any) => emitWithOrg('special-request', data),
    emitLeaderboardUpdated: (data: any) => emitWithOrg('leaderboard-updated', data),
    emitNowPlayingUpdated: (data: any) => emitWithOrg('now-playing-updated', data),
    emitSkipSong: (data: any) => emitWithOrg('skip-song', data),
    onSongPlayed: (cb: any) => socketRef.current?.on('song-played', cb),
    offSongPlayed: (cb: any) => socketRef.current?.off('song-played', cb),

    onSongVoted: (cb: any) => socketRef.current?.on('song-voted', cb),
    offSongVoted: (cb: any) => socketRef.current?.off('song-voted', cb),
    onSongBoosted: (cb: any) => socketRef.current?.on('song-boosted', cb),
    offSongBoosted: (cb: any) => socketRef.current?.off('song-boosted', cb),
    onSpecialRequest: (cb: any) => socketRef.current?.on('special-request', cb),
    offSpecialRequest: (cb: any) => socketRef.current?.off('special-request', cb),
    onLeaderboardUpdated: (cb: any) => socketRef.current?.on('leaderboard-updated', cb),
    offLeaderboardUpdated: (cb: any) => socketRef.current?.off('leaderboard-updated', cb),
    onNowPlayingUpdated: (cb: any) => socketRef.current?.on('now-playing-updated', cb),
    offNowPlayingUpdated: (cb: any) => socketRef.current?.off('now-playing-updated', cb),
    onSkipSong: (cb: any) => socketRef.current?.on('skip-song', cb),
    offSkipSong: (cb: any) => socketRef.current?.off('skip-song', cb),
  };
};

