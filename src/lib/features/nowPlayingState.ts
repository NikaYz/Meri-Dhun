import { NowPlayingApiResponse } from "../song";

export async function getNowPlayingState(organizationId: string): Promise<NowPlayingApiResponse> {
    console.log("Calling GET /api/update-now-playing with organizationId:", organizationId);

    try {
        const response = await fetch(`/api/update-now-playing?organizationId=${organizationId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log(response);
        if (!response.ok) {
            console.error("Failed to fetch now playing state:", response.status, response.statusText);
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const data: NowPlayingApiResponse = await response.json();
        return data;

    } catch (error) {
        console.error("Error fetching now playing state:", error);
        throw error;
    }
}


export async function updateNowPlayingState(organizationId: string, newCurrentSongId: string | null) {
    console.log("Calling POST /api/update-now-playing with newCurrentSongId:", newCurrentSongId);

    try {
        const response = await fetch("/api/update-now-playing", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                organizationId,
                newCurrentSongId,
            }),
        });

        if (!response.ok) {
            console.error("Failed to update now playing state:", response.status, response.statusText);
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error updating now playing state:", error);
        throw error;
    }
}
