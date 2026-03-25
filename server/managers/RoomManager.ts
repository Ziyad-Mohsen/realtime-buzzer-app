import { Player, Room, RoomHost } from "../types/index.js";

class RoomManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  private generateRoomCode(): string {
    let code: string;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.rooms.has(code));
    return code;
  }

  isRoomHost(userId: string, roomCode: string): boolean {
    const room = this.getRoom(roomCode);
    return room?.host.id === userId;
  }

  getRoomMember({ userId, roomCode }: { userId: string; roomCode: string }): {
    success: boolean;
    message: string;
    type?: "host" | "player";
    member?: RoomHost | Player;
  } {
    const room = this.getRoom(roomCode);
    if (!room) return { success: false, message: "Room was not found" };

    if (this.isRoomHost(userId, roomCode)) {
      return {
        success: true,
        message: "User is a room host",
        type: "host",
        member: room.host,
      };
    } else {
      return {
        success: true,
        message: "User is a room player",
        type: "player",
        member: room.players[userId],
      };
    }
  }

  getRoomPlayer(roomCode: string, userId: string): Player | undefined {
    const room = this.getRoom(roomCode);
    return room?.players[userId];
  }

  getRooms(): Room[] {
    return [...this.rooms.values()];
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }

  updateRoom(roomCode: string, callback: (room: Room) => void) {
    let room = this.getRoom(roomCode);
    if (!room) return;
    callback(room);
    return room;
  }

  createRoom(userId: string): Room | undefined {
    const roomCode = this.generateRoomCode();
    const newRoom: Room = {
      roomCode,
      host: {
        id: userId,
        connected: false,
      },
      players: {},
      teams: {},
      locked: false,
      buzzed: null,
    };

    this.rooms.set(roomCode, newRoom);
    return this.rooms.get(roomCode);
  }

  removeRoom(roomCode: string): Room | undefined {
    const room = this.getRoom(roomCode);
    if (room) {
      this.rooms.delete(roomCode);
      return room;
    }
  }
}

export default RoomManager;
