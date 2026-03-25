import { roomManager, userManager } from "../index.js";
import registerRoomHostHandlers from "./handlers/room/host.handler.js";
import registerRoomPlayerHandlers from "./handlers/room/player.handler.js";
import { AppServer } from "./handlers/types.js";
import registerUserHandlers from "./handlers/user/user.handler.js";
import { Player } from "../types/index.js";

export default function registerSocket(io: AppServer) {
  io.on("connection", async (socket) => {
    const socketId = socket.id;
    const deviceId = (socket.handshake.auth.deviceId ||
      socket.handshake.query.deviceId) as string;

    if (!deviceId) {
      console.warn("Connection attempt without deviceId:", socket.id);
      socket.disconnect(true);
      return;
    }

    socket.data.userId = deviceId;

    // Handle user creation
    let user = userManager.getUser(deviceId);
    if (user) {
      if (user.reconnectTimer) {
        clearTimeout(user.reconnectTimer);
        user.reconnectTimer = null;
      }
      userManager.updateUser(deviceId, (user) => {
        user.socketIds.push(socketId);
      });
    } else {
      userManager.createUser(deviceId, socketId);
      user = userManager.getUser(deviceId);
    }

    // Handle room rejoin
    if (user?.roomCode) {
      if (roomManager.isRoomHost(user.id, user.roomCode)) {
        roomManager.updateRoom(user.roomCode, (room) => {
          room.host.connected = true;
        });
        io.to(user.socketIds).emit("room:rejoin", { user, isHost: true });
      } else {
        roomManager.updateRoom(user.roomCode, (room) => {
          room.players[user.id].connected = true;
        });
        io.to(user.socketIds).emit("room:rejoin", {
          user: roomManager.getRoomPlayer(user.roomCode, user.id) as Player,
          isHost: false,
        });
      }
      socket.join(user.roomCode);
    }

    io.to(socketId).emit("session:init", deviceId);

    registerUserHandlers(io, socket);
    registerRoomHostHandlers(io, socket);
    registerRoomPlayerHandlers(io, socket);

    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      const user = userManager.getUser(userId);
      if (!user) return;

      userManager.updateUser(userId, (user) => {
        user.socketIds = user.socketIds.filter((id) => id !== socketId);
      });

      if (user.socketIds.length === 0) {
        if (user.roomCode) {
          const { success, member } = roomManager.getRoomMember({
            userId: user.id,
            roomCode: user.roomCode,
          });

          // Update connection state for host and player
          if (success && member) {
            member.connected = false;
          }

          const room = roomManager.getRoom(user.roomCode);

          if (room) io.to(user.roomCode).emit("room:update", room);
        }

        user.reconnectTimer = setTimeout(() => {
          // Re-fetch user to get latest state
          const currentUser = userManager.getUser(user.id);
          if (!currentUser || currentUser.socketIds.length > 0) return;

          if (currentUser.roomCode) {
            const roomCode = currentUser.roomCode;
            const room = roomManager.getRoom(roomCode);

            if (room) {
              const { success, type, member } = roomManager.getRoomMember({
                userId: currentUser.id,
                roomCode,
              });

              if (success) {
                switch (type) {
                  case "host":
                    roomManager.removeRoom(roomCode);
                    io.to(roomCode).emit("room:remove");
                    break;
                  case "player":
                    delete room.players[currentUser.id];
                    io.to(roomCode).emit("player:leave", member as Player);
                    break;
                }
              }
              io.to(roomCode).emit("room:update", room);
            }
          }
          userManager.deleteUser(currentUser.id);
        }, 5000);
      }
    });
  });
}
