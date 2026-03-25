import { Player } from "../../../server/types";
import { socket } from "../socket";

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
      className="player-card"
      style={{ opacity: player.connected ? 1 : 0.5 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: player.connected
              ? "var(--success)"
              : "var(--text-secondary)",
          }}
          title={player.connected ? "Connected" : "Disconnected"}
        ></span>
        <span style={{ fontWeight: "600", fontSize: "1.1rem" }}>
          {player.name} {player.connected ? "" : "(Offline)"}
        </span>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          className="btn-outline"
          style={{
            padding: "6px 12px",
            fontSize: "0.9rem",
            borderColor: player.locked
              ? "var(--danger)"
              : "var(--glass-border)",
            color: player.locked ? "var(--danger)" : "var(--text-secondary)",
          }}
          onClick={togglePlayerLock}
        >
          {player.locked ? "Locked" : "Lock"}
        </button>
        <button
          className="btn-outline"
          style={{
            padding: "6px 12px",
            fontSize: "0.9rem",
            borderColor: "var(--danger)",
            color: "var(--danger)",
          }}
          onClick={() => {}}
        >
          Kick
        </button>
      </div>
    </div>
  );
}
