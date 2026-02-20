import { STUN_SERVERS } from "@gameion/shared";
import { getApiUrl } from "./socket";

let cachedServers: RTCIceServer[] | null = null;

export async function fetchIceServers(): Promise<RTCIceServer[]> {
  if (cachedServers) return cachedServers;

  try {
    const res = await fetch(`${getApiUrl()}/ice-servers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cachedServers = data.iceServers;
    return cachedServers!;
  } catch {
    // Fallback to default STUN servers
    return STUN_SERVERS;
  }
}
