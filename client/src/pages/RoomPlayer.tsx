import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket";
import { useUserContext } from "../contexts/UserContext";
import { Player, Room } from "../../../server/types";
import toast from "react-hot-toast";
import buzzerSound from "../assets/sounds/buzzer-sound.mp3";
import useAudio from "../hooks/useAudio";

export default function RoomPlayer() {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [error, setError] = useState<string | null>(null);
  const { userId } = useUserContext();
  const audio = useAudio(buzzerSound);

  const [roomState, setRoomState] = useState<Room | null>(null);

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

  const hostJoined = ({ reconnected }: { reconnected: boolean }) => {
    if (!reconnected) {
      toast.success("Host joined the room!");
    }
  };

  useEffect(() => {
    if (roomCode) {
      socket.emit("joinRoom", { roomCode }, (response) => {
        if (!response.success) {
          setError(response.message);
        }

        if (response.payload) {
          setRoomState(response.payload);
        }
      });
    }
  }, [roomCode]);

  useEffect(() => {
    socket.on("room:update", updateRoom);
    socket.on("player:join", playerJoined);
    socket.on("host:join", hostJoined);
    socket.on("player:leave", (player) => {
      toast(`${player.name} left the room!`);
    });
    socket.on("room:teamCreate", (team) => {
      toast(`New team "${team.name}" was created`);
    });

    return () => {
      socket.off("room:update", updateRoom);
      socket.off("player:join", playerJoined);
      socket.off("host:join", hostJoined);
      socket.off("player:leave");
      socket.off("room:teamCreate");
    };
  }, []);

  useEffect(() => {
    if (roomState?.buzzed?.player.id === userId) {
      audio.play();
    } else {
      audio.stop();
    }
  }, [roomState, audio, userId]);

  const handleBuzz = () => {
    if (isDisabled) return;
    socket.emit("buzz", { roomCode: roomCode as string });
  };

  const handleRoomLeave = () => {
    socket.emit("leaveRoom", { roomCode: roomCode as string }, (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      navigate("/");
    });
  };

  if (error) {
    return (
      <div
        className="glass-card text-center animate-slide-up"
        style={{ marginTop: "20vh" }}
      >
        <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>Error</h2>
        <p style={{ marginBottom: "1rem" }}>{error}</p>
        <button className="btn-primary" onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  if (!roomState) {
    return (
      <div className="text-center" style={{ marginTop: "40vh" }}>
        <h2>Joining Room...</h2>
      </div>
    );
  }

  const player = roomState.players[userId as string];

  if (!player) {
    navigate("/");
    return;
  }

  const didIBuzz = Boolean(roomState?.buzzed?.player.id === player.id);
  const isDisabled =
    roomState.locked ||
    (roomState.teams[player.team as string] &&
      roomState.teams[player.team as string].locked) ||
    player.locked ||
    Boolean(roomState.buzzed) ||
    didIBuzz;
  const hasBuzzed = false;

  return (
    <div
      className="animate-slide-up"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "2rem 0",
      }}
    >
      {/* Header */}
      <div className="flex-row" style={{ padding: "0 1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.2rem" }}>
            {player.name}
          </h1>
          <div className="badge badge-primary">{player.team || "-"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Room
          </div>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "800",
              letterSpacing: "0.1em",
            }}
          >
            {roomCode}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <div style={{ marginTop: "20px" }}>
          <select
            className="team-select"
            value={team || ""}
            onChange={(e) => setTeam(e.target.value)}
            disabled={isDisabled}
          >
            <option value="">No Team</option>
            {Object.entries(roomState.teams).map(([teamName]) => (
              <option key={teamName} value={teamName}>
                {teamName}
              </option>
            ))}
          </select>
        </div> */}

        <button
          className={`buzzer-btn ${didIBuzz ? "buzzed-pulse winner-buzzer" : "buzzer-btn locked-buzzer"}`}
          onClick={handleBuzz}
          disabled={isDisabled}
        >
          {didIBuzz ? "BUZZED!" : "BUZZ"}
        </button>

        <h2
          className="text-center"
          style={{
            marginTop: "2rem",
            color: didIBuzz
              ? "var(--success)"
              : isDisabled && !hasBuzzed
                ? "var(--danger)"
                : "var(--text-primary)",
            transition: "color 0.3s",
            marginBottom: "2rem",
          }}
        >
          {"statusMessage"}
        </h2>

        <button
          className="btn-outline"
          style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
          onClick={handleRoomLeave}
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
