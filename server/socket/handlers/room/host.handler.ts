import { roomManager, userManager } from "../../../index.js";
import { AppServer, AppSocket } from "../types.js";
import { RoomService } from "../../../services/room.service.js";

export default function registerRoomHostHandlers(
  io: AppServer,
  socket: AppSocket,
) {
  socket.on("checkRoom", ({ roomCode }, callback) => {
    const userId = socket.data.userId;
    const { success, isHost, room } = RoomService.checkRoom({
      roomCode,
      userId,
    });
    if (!success || !room) {
      callback?.({
        success: false,
        status: "error",
        message: "Room is not found",
      });
      return;
    }
    callback?.({
      success: true,
      status: "success",
      message: "Room found successfully",
      payload: { isHost, room },
    });
  });

  socket.on("createRoom", (callback) => {
    const userId = socket.data.userId;
    const { success: roomSuccess, room } = RoomService.createRoom(userId);

    if (!roomSuccess || !room) {
      callback?.({
        success: false,
        status: "error",
        message: "Failed   to create room",
      });
      return;
    }

    socket.join(room.roomCode);

    callback?.({
      success: true,
      status: "success",
      message: "Room created successfully",
      payload: room,
    });
  });

  socket.on("removeRoom", ({ roomCode }, callback) => {
    const userId = socket.data.userId;
    const user = userManager.getUser(userId);
    if (!user || !roomManager.isRoomHost(userId, roomCode)) {
      callback?.({
        success: false,
        status: "error",
        message: "You are not the host of this room",
      });
      return;
    }

    const room = roomManager.getRoom(roomCode);
    if (!room) {
      callback?.({
        success: false,
        status: "error",
        message: "Room is not found",
      });
      return;
    }
    roomManager.removeRoom(roomCode);
    callback?.({
      success: true,
      status: "success",
      message: "Room removed successfully",
    });
    socket.to(roomCode).emit("room:remove");
  });

  socket.on("clearBuzz", ({ roomCode }) => {
    const userId = socket.data.userId;
    const { success, message, room } = RoomService.clearBuzz({
      roomCode,
      userId,
    });
    if (!success || !room) {
      return;
    }
    io.to(roomCode).emit("room:update", room);
  });

  socket.on("createRoomTeam", ({ roomCode, team }, callback) => {
    const userId = socket.data.userId;
    const { success, message, room } = RoomService.createRoomTeam({
      roomCode,
      userId,
      team,
    });

    if (!success || !room) {
      callback?.({ status: "error", success, message });
      return;
    }

    callback?.({ status: "success", success, message });
    io.to(roomCode).emit("room:update", room);
    io.to(roomCode).emit("room:teamCreate", team);
  });

  socket.on("removeRoomTeam", ({ roomCode, teamName }, callback) => {
    const userId = socket.data.userId;
    const { success, message, room } = RoomService.removeRoomTeam({
      roomCode,
      userId,
      teamName,
    });

    if (!success || !room) {
      callback?.({ status: "error", success, message });
      return;
    }

    callback?.({ status: "success", success, message });
    io.to(roomCode).emit("room:update", room);
    io.to(roomCode).emit("room:teamRemove", teamName);
  });

  socket.on("toggleRoomPlayerLock", ({ roomCode, playerId }) => {
    const userId = socket.data.userId;
    const { success, room } = RoomService.toggleRoomPlayerLock({
      roomCode,
      playerId,
      hostId: userId,
    });

    if (!success || !room) {
      return;
    }

    io.to(roomCode).emit("room:update", room);
  });
}
