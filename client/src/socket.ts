import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../server/types/socket.types";

const createNewId = () => {
  const existingId = localStorage.getItem("my_device_id");
  if (existingId) return existingId;

  const deviceId =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  localStorage.setItem("my_device_id", deviceId);
  return deviceId;
};

export const deviceId = createNewId();

const env = import.meta.env.VITE_ENV;
const URL =
  env === "production"
    ? "/"
    : import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  URL,
  {
    autoConnect: false,
  },
);

socket.auth = {
  deviceId,
};
