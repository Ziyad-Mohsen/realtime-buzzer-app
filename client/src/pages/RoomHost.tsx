import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket";
import CreateTeamForm from "../components/CreateTeamForm";
import { Player, Room } from "../../../server/types";
import toast from "react-hot-toast";
import PlayerCard from "../components/PlayerCard";
import { getTeams } from "../utils";
import { useKeysControls } from "../hooks/useKeyPress";

export default function RoomHost() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [roomState, setRoomState] = useState<Room | null>(null);

  const [error, setError] = useState<string | null>(null);

  useKeysControls([
    {
      key: "c",
      callback: () => {
        clearBuzz();
      },
    },
    {
      key: "l",
      callback: () => {
        toggleRoomLock();
      },
    },
  ]);

  const updateRoomState = (state: Room) => {
    setRoomState({ ...state });
  };

  const updateRoom = (state: Room) => {
    setRoomState({ ...state });
  };

  const playerJoined = ({
    player,
    reconnected,
  }: {
    player: Player;
    reconnected: boolean;
  }) => {
    if (!reconnected) {
      toast.success(`${player.name} joined the room!`);
    }
  };

  useEffect(() => {
    socket.connect();

    socket.on("room:update", updateRoomState);

    if (roomCode) {
      socket.emit("joinRoom", { roomCode: roomCode as string }, (response) => {
        if (!response.success) {
          console.error(response.message);
          setError(response.message);
        }

        if (response.payload) {
          setRoomState(response.payload);
        }
      });
    }

    return () => {
      socket.off("room:update", updateRoomState);
    };
  }, [roomCode, navigate]);

  useEffect(() => {
    socket.on("room:update", updateRoom);
    socket.on("player:join", playerJoined);
    socket.on("player:leave", (player) => {
      toast(`${player.name} left the room!`);
    });

    return () => {
      socket.off("room:update", updateRoom);
      socket.off("player:join", playerJoined);
      socket.off("player:leave");
    };
  }, []);

  const clearBuzz = () => {
    socket.emit("clearBuzz", { roomCode: roomCode as string });
  };

  const toggleRoomLock = () => {
    socket.emit("toggleRoomLock", { roomCode: roomCode as string });
  };

  if (error) {
    return (
      <div
        className="glass-card text-center animate-slide-up"
        style={{ marginTop: "20vh" }}
      >
        <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>
          Host Access Denied
        </h2>
        <p>{error}</p>
        <button
          className="btn-primary"
          onClick={() => navigate("/")}
          style={{ marginTop: "1.5rem" }}
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!roomState) {
    return <div>Loading...</div>;
  }

  const players = Object.values(roomState.players);
  const teams = getTeams(roomState);

  return (
    <div className="animate-slide-up">
      <div className="flex-row" style={{ marginTop: "2rem" }}>
        <div>
          <h2
            style={{
              color: "var(--text-secondary)",
              marginBottom: "0.2rem",
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Room Code (Host)
          </h2>
          <h1
            style={{
              fontSize: "3.5rem",
              letterSpacing: "0.2em",
              color: "var(--primary)",
            }}
          >
            {roomCode}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            className={roomState.locked ? "btn-danger" : "btn-primary"}
            onClick={toggleRoomLock}
          >
            {roomState.locked ? "Unlock All Buzzers" : "Lock All Buzzers"}
          </button>
          <button className="btn-danger">End Room</button>
        </div>
      </div>

      {roomState.buzzed && (
        <div className="winner-banner">
          <div
            style={{
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.5rem",
            }}
          >
            First to Buzz
          </div>
          <div className="winner-name">{roomState.buzzed.player.name}</div>
          {roomState.buzzed.player.team && (
            <div className="winner-team">
              Team: {roomState.buzzed.player.team}
            </div>
          )}
          <button
            className="btn-primary"
            onClick={clearBuzz}
            style={{
              marginTop: "1.5rem",
              background: "#78350f",
              color: "#fef3c7",
              boxShadow: "none",
            }}
          >
            Clear & Reset
          </button>
        </div>
      )}

      {!roomState.buzzed && (
        <div
          className="glass-card text-center"
          style={{ maxWidth: "100%", margin: "2rem 0", padding: "3rem" }}
        >
          <h2 style={{ color: "var(--text-secondary)", fontWeight: "400" }}>
            Waiting for a buzz...
          </h2>
        </div>
      )}

      <CreateTeamForm roomCode={roomCode as string} />

      <div style={{ marginTop: "3rem" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>Players & Teams</h2>

        <div>
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} roomCode={roomCode} />
          ))}
        </div>

        {/* {Object.entries(usersByTeam).map(([teamName, users]) => {
          const teamObj = roomState.teams && roomState.teams[teamName];
          const isTeamLocked = teamObj ? teamObj.locked : false;
          const teamColor = teamObj ? teamObj.color : "transparent";

          return (
            <div
              key={teamName}
              className="team-card"
              style={{
                borderLeft: `6px solid ${teamColor === "transparent" ? "var(--glass-border)" : teamColor}`,
              }}
            >
              <div
                className="flex-row"
                style={{
                  marginBottom: "1rem",
                  borderBottom: "1px solid var(--glass-border)",
                  paddingBottom: "1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {teamName}
                  {teamObj && (
                    <span
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: teamColor,
                        display: "inline-block",
                      }}
                    ></span>
                  )}
                </h3>
                {teamName !== "No Team" && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      className={isTeamLocked ? "btn-outline" : "btn-outline"}
                      style={{
                        borderColor: isTeamLocked
                          ? "var(--danger)"
                          : "var(--text-secondary)",
                        color: isTeamLocked
                          ? "var(--danger)"
                          : "var(--text-primary)",
                      }}
                      onClick={() => {}}
                    >
                      {isTeamLocked ? "Unlock Team" : "Lock Team"}
                    </button>
                    <button
                      className="btn-outline"
                      style={{
                        borderColor: "var(--danger)",
                        color: "var(--danger)",
                      }}
                      onClick={() => {}}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="player-list">
                {users.length === 0 && (
                  <span style={{ color: "var(--text-secondary)" }}>
                    No players
                  </span>
                )}
                {users.map((user) => (
                  <div
                    key={user.deviceId}
                    className="player-card"
                    style={{ opacity: user.connected ? 1 : 0.5 }}
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
                          background: user.connected
                            ? "var(--success)"
                            : "var(--text-secondary)",
                        }}
                        title={user.connected ? "Connected" : "Disconnected"}
                      ></span>
                      <span style={{ fontWeight: "600", fontSize: "1.1rem" }}>
                        {user.name} {user.connected ? "" : "(Offline)"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn-outline"
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.9rem",
                          borderColor: user.locked
                            ? "var(--danger)"
                            : "var(--glass-border)",
                          color: user.locked
                            ? "var(--danger)"
                            : "var(--text-secondary)",
                        }}
                        onClick={() =>
                          toggleUserLock(user.deviceId, user.locked)
                        }
                      >
                        {user.locked ? "Locked" : "Lock"}
                      </button>
                      <button
                        className="btn-outline"
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.9rem",
                          borderColor: "var(--danger)",
                          color: "var(--danger)",
                        }}
                        onClick={() => kickUser(user.deviceId)}
                      >
                        Kick
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })} */}
      </div>
    </div>
  );
}
