import { AppServer } from "./socket/handlers/types.js";

export async function listUsersInRoom(
  io: AppServer,
  { roomCode }: { roomCode: string },
) {
  const sockets = await io.in(roomCode).fetchSockets();

  const users = sockets.map((clientSocket) => {
    return {
      scoketId: clientSocket.id,
      userId: clientSocket.data.userId,
    };
  });

  return users;
}
