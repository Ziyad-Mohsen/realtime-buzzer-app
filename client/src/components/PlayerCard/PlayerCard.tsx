import { Player } from "../../../../server/types";
import { socket } from "../../lib/socket";
import styles from "./PlayerCard.module.css";

export default function PlayerCard({
  player,
  roomCode,
}: {
  player: Player;
  roomCode: string | undefined;
}) {
  const togglePlayerLock = () => {
    if (roomCode && player)
      socket.emit("toggleRoomPlayerLock", { roomCode, playerId: player.id });
  };

  return (
    <div
      key={player.id}
      className={`${styles.card} ${!player.connected ? styles.offline : ""}`}
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
          className={`btn ${player.locked ? "btn-danger" : "btn-danger-outline"} ${styles.actionButton}`}
          onClick={togglePlayerLock}
          disabled={!player.connected}
        >
          {player.locked ? "Locked" : "Lock"}
        </button>
        <button
          className={`btn btn-danger-outline ${styles.actionButton}`}
          onClick={() => {}}
          disabled={!player.connected}
        >
          Kick
        </button>
      </div>
    </div>
  );
}
