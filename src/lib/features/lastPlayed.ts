export default async function LastPlayedSong(songId: string, organizationId: string) {
   console.log("Calling LastPlayedSong with", songId, organizationId);
  return fetch("/api/last-played", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orgId: organizationId,
      songId: songId,
    }),
  });
}