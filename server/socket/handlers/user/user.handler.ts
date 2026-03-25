import { userManager } from "../../../index.js";
import { AppServer, AppSocket } from "../types.js";

export default function registerUserHandlers(io: AppServer, socket: AppSocket) {
  socket.on("updateUser", ({ name }, callback) => {
    const userId = socket.data.userId;
    const user = userManager.getUser(userId);
    if (!user) {
      return callback?.({
        success: false,
        status: "error",
        message: "User not found",
      });
    }
    userManager.updateUser(userId, (user) => {
      user.name = name;
    });
    callback?.({
      success: true,
      status: "success",
      message: "User updated successfully",
    });
  });
}
