/* Accepts key code or key name
   It will check for both event.key and event.code
   Reference: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
*/
export const KEYBOARD_SHORTCUTS = {
  host: {
    clearBuzz: "c",
    toggleRoomLock: "l",
  },
  player: {
    buzz: "Space",
  },
} as const;
