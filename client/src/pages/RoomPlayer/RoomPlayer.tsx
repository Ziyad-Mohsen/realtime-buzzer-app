import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../../socket";
import { useUserContext } from "../../contexts/UserContext";
import { Player, Room } from "../../../../server/types";
import toast from "react-hot-toast";
import buzzerSound from "../../assets/sounds/buzzer-sound.mp3";
import useAudio from "../../hooks/useAudio";
import styles from "./RoomPlayer.module.css";

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
        className={`glass-card text-center animate-slide-up ${styles.errorCard}`}
      >
        <h2 className={styles.errorTitle}>Error</h2>
        <p className={styles.errorText}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
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
    <div className={`animate-slide-up ${styles.playerWrapper}`}>
      {/* Header */}
      <div className={`flex-row ${styles.headerRow}`}>
        <div>
          <h1 className={styles.playerName}>{player.name}</h1>
          <div className="badge badge-primary">{player.team || "-"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className={styles.roomCodeLabel}>Room</div>
          <div className={styles.roomCodeValue}>{roomCode}</div>
        </div>
      </div>

      <div className={styles.buzzerSection}>
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
          className={`${styles.buzzerBtn} ${didIBuzz ? `buzzed-pulse ${styles.winnerBuzzer}` : styles.lockedBuzzer}`}
          onClick={handleBuzz}
          disabled={isDisabled}
        >
          {didIBuzz ? "BUZZED!" : "BUZZ"}
        </button>

        <h2
          className={`text-center ${styles.statusMessage} ${didIBuzz ? styles.statusSuccess : isDisabled && !hasBuzzed ? styles.statusDanger : styles.statusDefault}`}
        >
          {"statusMessage"}
        </h2>

        <button
          className={`btn btn-outline ${styles.leaveBtn}`}
          onClick={handleRoomLeave}
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
