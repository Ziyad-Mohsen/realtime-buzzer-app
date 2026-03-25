import { roomManager, userManager } from "../index.js";
import { Room, Team } from "../types/index.js";

export class RoomService {
  static checkRoom({ roomCode, userId }: { roomCode: string; userId: string }) {
    const room = roomManager.getRoom(roomCode.toUpperCase());
    if (!room)
      return {
        success: false,
        message: "Room not found",
        isHost: false,
      };
    return {
      success: true,
      message: "Room found successfully",
      isHost: room.host.id === userId,
      room,
    };
  }

  // Player services
  static joinRoom({ roomCode, userId }: { roomCode: string; userId: string }) {
    const user = userManager.getUser(userId);
    const room = roomManager.getRoom(roomCode);

    if (!user) return { success: false, message: "User not found" };
    if (!room) return { success: false, message: "Room not found" };

    user.roomCode = roomCode;
    // Host check
    if (roomManager.isRoomHost(userId, roomCode)) {
      roomManager.updateRoom(roomCode, (room) => (room.host.connected = true));
      return { success: true, isHost: true, room, user, reconnected: true };
    }

    // Existing player
    const player = roomManager.getRoomPlayer(roomCode, userId);
    if (player) {
      if (!player.connected) {
        roomManager.updateRoom(roomCode, (room) => {
          room.players[userId].name = user.name;
          room.players[userId].connected = true;
        });
      }
      return {
        success: true,
        isHost: false,
        room,
        user: player,
        reconnected: true,
      };
    }

    // New player
    roomManager.updateRoom(roomCode, (room) => {
      room.players[userId] = {
        id: userId,
        name: user.name,
        team: null,
        connected: true,
        locked: false,
      };
    });
    return {
      success: true,
      isHost: false,
      room,
      user: room.players[userId],
      reconnected: false,
    };
  }

  static leaveRoom({ roomCode, userId }: { roomCode: string; userId: string }) {
    const user = userManager.getUser(userId);
    const room = roomManager.getRoom(roomCode);

    if (!user) return { success: false, message: "User not found" };
    if (!room) return { success: false, message: "Room not found" };

    // Existing player
    const player = roomManager.getRoomPlayer(roomCode, userId);
    if (!player) {
      return { success: false, message: "You are not a player of this room" };
    }

    roomManager.updateRoom(roomCode, (room) => {
      delete room.players[userId];
    });
    return { success: true, room };
  }

  static buzz({ roomCode, userId }: { roomCode: string; userId: string }) {
    const player = roomManager.getRoomPlayer(roomCode, userId);

    if (!player)
      return { success: false, message: "You are not a player of this room" };

    const updatedRoom = roomManager.updateRoom(roomCode, (room) => {
      room.buzzed = { player, time: new Date() };
    });

    return {
      success: true,
      message: "Room buzzed successfully",
      room: updatedRoom,
    };
  }

  // Host services
  static createRoom(userId: string): { success: boolean; room?: Room } {
    const room = roomManager.createRoom(userId);

    if (!room) {
      return { success: false };
    }

    userManager.updateUser(userId, (user) => {
      user.roomCode = room.roomCode;
    });

    return { success: true, room };
  }

  static removeRoom({
    roomCode,
    userId,
  }: {
    roomCode: string;
    userId: string;
  }) {
    const user = userManager.getUser(userId);
    const room = roomManager.getRoom(roomCode);

    if (!user) return { success: false, message: "User not found" };
    if (!room) return { success: false, message: "Room not found" };

    if (!roomManager.isRoomHost(userId, roomCode)) {
      return { success: false, message: "You are not the host of this room" };
    }

    roomManager.removeRoom(roomCode);
    return { success: true, room };
  }

  static toggleRoomLock({
    roomCode,
    userId,
  }: {
    roomCode: string;
    userId: string;
  }) {
    const room = roomManager.getRoom(roomCode);
    if (!room) return { success: false, message: "Room not found" };

    if (!roomManager.isRoomHost(userId, roomCode)) {
      return { success: false, message: "You are not the host of this room" };
    }

    roomManager.updateRoom(roomCode, (room) => {
      room.locked = !room.locked;
    });
    return { success: true, room };
  }

  static clearBuzz({ roomCode, userId }: { roomCode: string; userId: string }) {
    const room = roomManager.getRoom(roomCode);
    if (!room) return { success: false, message: "Room not found" };

    if (!roomManager.isRoomHost(userId, roomCode)) {
      return { success: false, message: "You are not the host of this room" };
    }

    roomManager.updateRoom(roomCode, (room) => {
      room.buzzed = null;
    });
    return { success: true, room };
  }

  static createRoomTeam({
    roomCode,
    userId,
    team,
  }: {
    roomCode: string;
    userId: string;
    team: Team;
  }) {
    const room = roomManager.getRoom(roomCode);
    if (!room) return { success: false, message: "Room not found" };

    if (!roomManager.isRoomHost(userId, roomCode)) {
      return { success: false, message: "You are not the host of this room" };
    }

    if (!team) return { success: false, message: "You must provide team" };

    const existingTeam = room.teams[team.name];
    if (existingTeam)
      return { success: false, message: "This team is already existed" };

    roomManager.updateRoom(roomCode, (room) => {
      room.teams[team.name] = team;
    });

    return { success: true, message: "Team created successfully", room };
  }

  static removeRoomTeam({
    roomCode,
    userId,
    teamName,
  }: {
    roomCode: string;
    userId: string;
    teamName: string;
  }) {
    const room = roomManager.getRoom(roomCode);
    if (!room) return { success: false, message: "Room not found" };

    if (!roomManager.isRoomHost(userId, roomCode)) {
      return { success: false, message: "You are not the host of this room" };
    }

    const existingTeam = room.teams[teamName];
    if (!existingTeam)
      return { success: false, message: "This team is not existed" };

    Object.values(room.players).forEach((player) => {
      if (player.team === teamName) {
        player.team = null;
      }
    });

    roomManager.updateRoom(roomCode, (room) => {
      delete room.teams[teamName];
    });

    return { success: true, message: "Team removed successfully", room };
  }

  static toggleRoomPlayerLock({
    roomCode,
    playerId,
    hostId,
  }: {
    roomCode: string;
    playerId: string;
    hostId: string;
  }) {
    const room = roomManager.getRoom(roomCode);
    const player = roomManager.getRoomPlayer(roomCode, playerId);

    if (!room || !player || !roomManager.isRoomHost(hostId, roomCode)) {
      return { success: false };
    }

    roomManager.updateRoom(roomCode, (room) => {
      const player = room.players[playerId];
      player.locked = !player.locked;
    });

    return { success: true, room };
  }
}
