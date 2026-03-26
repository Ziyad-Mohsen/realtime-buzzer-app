import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import CreateTeamForm from "../../components/CreateTeamForm/CreateTeamForm";
import { Player, Room } from "../../../../server/types";
import toast from "react-hot-toast";
import PlayerCard from "../../components/PlayerCard/PlayerCard";
import { getTeams } from "../../utils";
import { useKeysControls } from "../../hooks/useKeyPress";
import styles from "./RoomHost.module.css";

export default function RoomHost() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [roomState, setRoomState] = useState<Room | null>(null);

  const [error, setError] = useState<string | null>(null);

  // TODO: Add keyboard shortcuts for all actions
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

  const removeRoomTeam = ({ teamName }: { teamName: string }) => {
    socket.emit(
      "removeRoomTeam",
      { roomCode: roomCode as string, teamName },
      (response) => {
        if (!response.success) {
          toast.error(response.message);
          return;
        }

        toast(`Team "${teamName}" was removed from the room!`);
      },
    );
  };

  if (error) {
    return (
      <div
        className={`glass-card text-center animate-slide-up ${styles.errorCard}`}
      >
        <h2 className={styles.errorTitle}>Host Access Denied</h2>
        <p>{error}</p>
        <button
          className={`btn btn-primary ${styles.homeButton}`}
          onClick={() => navigate("/")}
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

  console.log(teams);

  return (
    <div className={`animate-slide-up ${styles.hostWrapper}`}>
      <div className={`flex-row ${styles.headerRow}`}>
        <div>
          <h2 className={styles.roomCodeLabel}>Room Code (Host)</h2>
          <h1 className={styles.roomCodeValue}>{roomCode}</h1>
        </div>
        <div className={styles.actionButtons}>
          <button
            className={`kbd-container btn ${roomState.locked ? "btn-danger" : "btn-primary"}`}
            onClick={toggleRoomLock}
          >
            {roomState.locked ? "Unlock All Buzzers" : "Lock All Buzzers"}
          </button>
          <button className="btn btn-danger">End Room</button>
        </div>
      </div>

      {roomState.buzzed && (
        <div className={styles.winnerBanner}>
          <div className={styles.winnerLabel}>First to Buzz</div>
          <div className={styles.winnerName}>
            {roomState.buzzed.player.name}
          </div>
          {roomState.buzzed.player.team && (
            <div className={styles.winnerTeam}>
              Team: {roomState.buzzed.player.team}
            </div>
          )}
          <button
            className={`btn btn-primary ${styles.resetButton}`}
            onClick={clearBuzz}
          >
            Clear & Reset
          </button>
        </div>
      )}

      {!roomState.buzzed && (
        <div className={`glass-card text-center ${styles.waitingCard}`}>
          <h2 className={styles.waitingTitle}>Waiting for a buzz...</h2>
        </div>
      )}

      <CreateTeamForm roomCode={roomCode as string} />

      <div className={styles.sectionsWrapper}>
        <h2 className={styles.sectionTitle}>Players & Teams</h2>

        <div>
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} roomCode={roomCode} />
          ))}
        </div>
      </div>
    </div>
  );
}
