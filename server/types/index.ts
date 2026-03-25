export interface User {
  id: string;
  name: string;
  socketIds: string[];
  roomCode: string | null;
  reconnectTimer: NodeJS.Timeout | null;
}

export type PublicUser = Omit<User, "reconnectTimer">;

export interface Team {
  name: string;
  color: string;
  locked: boolean;
}

export interface Player {
  id: string;
  name: string | null;
  team: string | null;
  locked: boolean;
  // TODO: use status instead of conncected like ["connected", "pending", "disconnected", "banned"]
  connected: boolean;
}

export interface Room {
  roomCode: string;
  host: RoomHost;
  players: Record<string, Player>;
  teams: Record<string, Team>;
  locked: boolean;
  buzzed: {
    player: Player;
    time: Date;
  } | null;
}

export interface RoomHost {
  id: string;
  connected: boolean;
}
