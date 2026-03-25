import { roomManager, userManager } from "../index.js";
import { Player, RoomHost, User } from "../types/index.js";

export class UserService {
  static updateName({ userId, name }: { userId: string; name: string }) {
    const user = userManager.getUser(userId);
    if (!user) return { success: false, message: "User not found" };

    user.name = name;
    return { success: true, user };
  }
}
