import { PublicUser, User } from "../types/index.js";

class UserManager {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  getUsers(): PublicUser[] {
    const publicUsers = [...this.users.values()].map(
      ({ reconnectTimer, ...user }) => user,
    );
    return publicUsers;
  }

  getUser(deviceId: string): User | undefined {
    return this.users.get(deviceId);
  }

  createUser(deviceId: string, socketId: string): void {
    this.users.set(deviceId, {
      id: deviceId,
      name: "anonymous",
      roomCode: null,
      socketIds: [socketId],
      reconnectTimer: null,
    });
  }

  deleteUser(deviceId: string): void {
    this.users.delete(deviceId);
  }

  updateUser(deviceId: string, callback: (user: User) => void): void {
    let user = this.getUser(deviceId);
    if (!user) return;
    callback(user);
  }
}

export default UserManager;
