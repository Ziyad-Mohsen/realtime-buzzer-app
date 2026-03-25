import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import RoomManager from "./managers/RoomManager.js";
import UserManager from "./managers/UserManager.js";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types/socket.types.js";
import registerSocket from "./socket/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, SocketData>(
  server,
  {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  },
);

export const roomManager = new RoomManager();
export const userManager = new UserManager();

registerSocket(io);

app.get("/api/rooms", (_req, res) => {
  res.json({ rooms: roomManager.getRooms() });
});

app.get("/api/users", (_req, res) => {
  res.json({ users: userManager.getUsers() });
});

const frontendDistPath = path.join(__dirname, "../client/dist");

app.use(express.static(frontendDistPath));

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

const getLocalIpAddress = () => {
  const networkInterfaces = os.networkInterfaces();

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces || []) {
      if (
        iface.family === "IPv4" &&
        !iface.internal &&
        iface.address.startsWith("192.168")
      ) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1 (Local IP not found)";
};

const myIp = getLocalIpAddress();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on:`);
  console.log(`Local: http://localhost:${port}`);
  console.log(`Network: http://${myIp}:${port}`);
});
