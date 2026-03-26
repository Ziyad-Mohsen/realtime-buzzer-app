import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../lib/socket";
import toast from "react-hot-toast";
import { useUserContext } from "../../contexts/UserContext";
import styles from "./Home.module.css";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const { name, setName } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    // handle room rejoin
  }, [navigate]);

  const createRoom = () => {
    socket.emit("createRoom", (response) => {
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return;
      }

      if (response.payload) {
        const roomCode = response.payload.roomCode;

        navigate(`/host/${roomCode}`);
      }
    });
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode) return;

    socket.emit("checkRoom", { roomCode }, (response) => {
      if (!response.success || !response.payload) {
        console.error(response.message);
        toast.error(response.message);
        return;
      }

      if (response.payload?.isHost) {
        navigate(`/host/${roomCode}`);
      } else {
        navigate(`/play/${roomCode}`);
      }
    });
  };

  return (
    <div className={`glass-card animate-slide-up ${styles.homeCard}`}>
      <h1 className={`text-center ${styles.title}`}>
        Buzzer<span className={styles.titleAccent}>App</span>
      </h1>
      <p className={`text-center ${styles.subtitle}`}>
        Experience the fastest multi-player buzzer.
      </p>

      <div className="flex-col">
        <button
          className={`btn btn-primary ${styles.hostButton}`}
          onClick={createRoom}
        >
          Host a New Room
        </button>

        <div className={`text-center ${styles.divider}`}>
          — OR JOIN EXISTING —
        </div>

        <form onSubmit={joinRoom} className="flex-col">
          <input
            type="text"
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            required
            maxLength={6}
            className={styles.roomInput}
          />
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {/* <input 
            type="text" 
            placeholder="Team Name (Optional)" 
            value={team} 
            onChange={(e) => setTeam(e.target.value)}
          /> */}
          <button
            type="submit"
            className={`btn btn-outline ${styles.joinButton}`}
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}
