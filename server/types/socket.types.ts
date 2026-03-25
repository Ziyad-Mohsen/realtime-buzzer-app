import type { Player, PublicUser, Room, Team, User } from "./index.js";

export interface CallbackResponse<T> {
  success: boolean;
  status: "success" | "info" | "error";
  message: string;
  payload?: T;
}

export interface ClientToServerEvents {
  checkRoom: (
    data: { roomCode: string },
    callback?: (
      response: CallbackResponse<{ isHost: boolean; room: Room }>,
    ) => void,
  ) => void;

  createRoom: (callback?: (response: CallbackResponse<Room>) => void) => void;

  updateUser: (
    data: Pick<User, "name">,
    callback?: (response: CallbackResponse<null>) => void,
  ) => void;

  removeRoom: (
    data: { roomCode: string },
    callback?: (response: CallbackResponse<null>) => void,
  ) => void;

  roomDisconnect: (
    data: { roomCode: string },
    callback?: (response: CallbackResponse<null>) => void,
  ) => void;

  leaveRoom: (
    data: { roomCode: string },
    callback?: (response: CallbackResponse<null>) => void,
  ) => void;

  joinRoom: (
    data: { roomCode: string },
    callback?: (response: CallbackResponse<Room>) => void,
  ) => void;

  toggleRoomLock: (
    data: { roomCode: string },
    callback?: (response: CallbackResponse<null>) => void,
  ) => void;

  buzz: (
    data: { roomCode: string },
    callback?: (response: CallbackResponse<null>) => void,
  ) => void;

  clearBuzz: (data: { roomCode: string }) => void;

  createRoomTeam: (
    data: { roomCode: string; team: Team },
    callback?: (response: CallbackResponse<null>) => void,
  ) => void;

  toggleRoomPlayerLock: (data: { roomCode: string; playerId: string }) => void;
}

export interface ServerToClientEvents {
  "session:init": (sessionId: string) => void;

  "host:join": ({ reconnected }: { reconnected: boolean }) => void;

  "player:join": ({
    player,
    reconnected,
  }: {
    player: Player;
    reconnected: boolean;
  }) => void;
  "player:leave": (player: Player) => void;

  "room:rejoin": ({
    user,
    isHost,
  }: {
    user: Partial<Player | PublicUser>;
    isHost: boolean;
  }) => void;
  "room:remove": () => void;
  "room:update": (room: Room) => void;
  "room:teamCreate": (team: Team) => void;
}

export interface SocketData {
  userId: string;
}
