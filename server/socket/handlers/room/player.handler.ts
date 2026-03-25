import { response } from "express";
import { roomManager, userManager } from "../../../index.js";
import { RoomService } from "../../../services/room.service.js";
import { Room } from "../../../types/index.js";
import { AppServer, AppSocket } from "../types.js";

export default function registerRoomPlayerHandlers(
  io: AppServer,
  socket: AppSocket,
) {
  socket.on("joinRoom", ({ roomCode }, callback) => {
    const userId = socket.data.userId;
    const { success, message, isHost, room, user, reconnected } =
      RoomService.joinRoom({
        roomCode,
        userId,
      });

    if (!success) {
      callback?.({
        status: "error",
        success: false,
        message: message || "Failed to join room",
      });
      return;
    }

    if (user && room) {
      socket.join(roomCode);

      if (isHost) {
        socket.to(roomCode).emit("host:join", { reconnected });
      } else {
        socket.to(roomCode).emit("player:join", {
          player: room.players[userId],
          reconnected,
        });
      }
      io.to(roomCode).emit("room:update", room);

      callback?.({
        success: true,
        status: "success",
        message: "Joined room successfully",
        payload: room,
      });
    }
  });

  socket.on("leaveRoom", ({ roomCode }, callback) => {
    const userId = socket.data.userId;
    const { success, message, room } = RoomService.leaveRoom({
      roomCode,
      userId,
    });

    if (!success || !room) {
      callback?.({
        status: "error",
        success: false,
        message: message || "Failed to leave room",
      });
      return;
    }

    io.to(roomCode).emit("room:update", room);
    io.to(roomCode).emit("player:leave", room.players[userId]);
    socket.leave(roomCode);
    callback?.({
      success: true,
      status: "success",
      message: "Player left successfully",
    });
  });

  socket.on("toggleRoomLock", ({ roomCode }) => {
    const userId = socket.data.userId;
    const { success, room } = RoomService.toggleRoomLock({
      roomCode,
      userId,
    });
    if (!success) return;
    if (room) io.to(room.roomCode).emit("room:update", room);
  });

  socket.on("buzz", ({ roomCode }, callback) => {
    const userId = socket.data.userId;
    const { success, message, room } = RoomService.buzz({ roomCode, userId });

    if (!success) return callback?.({ success, message, status: "error" });

    if (room) io.to(room.roomCode).emit("room:update", room);
  });
}
