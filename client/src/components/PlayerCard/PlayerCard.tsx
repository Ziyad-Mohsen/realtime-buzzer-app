import { Player, Room } from "../../../../server/types";
import { socket } from "../../lib/socket";
import { isPlayerLocked } from "../../lib/utils";
import styles from "./PlayerCard.module.css";

export default function PlayerCard({
  player,
  roomState,
}: {
  player: Player;
  roomState: Room;
}) {
  const isLocked = isPlayerLocked(roomState, player);
  const playerBuzzed = roomState.buzzed?.player.id === player.id;
  const roomBuzzed = Boolean(roomState.buzzed);

  const state = () => {
    switch (true) {
      case playerBuzzed:
        return styles.buzzed;
      case isLocked:
        return styles.locked;
      case roomBuzzed:
        return styles.steady;
      default:
        return "";
    }
  };

  const togglePlayerLock = () => {
    if (roomState.roomCode && player)
      socket.emit("toggleRoomPlayerLock", {
        roomCode: roomState.roomCode,
        playerId: player.id,
      });
  };

  return (
    <div
      key={player.id}
      className={`${styles.card} ${!player.connected ? styles.offline : ""} ${state()}`}
    >
      <div className={styles.info}>
        <span
          className={`${styles.statusDot} ${player.connected ? styles.statusConnected : styles.statusDisconnected}`}
          title={player.connected ? "Connected" : "Disconnected"}
        ></span>
        <span className={styles.name}>
          {player.name} {player.connected ? "" : "(Offline)"}
        </span>
      </div>
      <div className={styles.actions}>
        <button
          className={`btn ${player.locked ? "btn-danger" : "btn-outline"} ${styles.actionButton}`}
          onClick={togglePlayerLock}
        >
          {player.locked ? "Locked" : "Lock"}
        </button>
        <button
          className={`btn btn-outline ${styles.actionButton}`}
          onClick={() => {}}
          disabled={!player.connected}
        >
          Kick
        </button>
      </div>
    </div>
  );
}
