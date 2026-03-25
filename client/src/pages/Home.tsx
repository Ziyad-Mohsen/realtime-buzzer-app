import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import toast from "react-hot-toast";
import { useUserContext } from "../contexts/UserContext";

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
    <div className="glass-card animate-slide-up" style={{ marginTop: "10vh" }}>
      <h1
        className="text-center"
        style={{ fontSize: "3rem", marginBottom: "0.5rem" }}
      >
        Buzzer<span style={{ color: "var(--primary)" }}>App</span>
      </h1>
      <p
        className="text-center"
        style={{ marginBottom: "2.5rem", fontSize: "1.1rem" }}
      >
        Experience the fastest multi-player buzzer.
      </p>

      <div className="flex-col">
        <button
          className="btn-primary"
          onClick={createRoom}
          style={{ padding: "18px" }}
        >
          Host a New Room
        </button>

        <div
          style={{
            textAlign: "center",
            margin: "1.5rem 0",
            color: "var(--text-secondary)",
            fontWeight: "600",
            letterSpacing: "0.1em",
          }}
        >
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
            style={{
              textTransform: "uppercase",
              textAlign: "center",
              letterSpacing: "0.3em",
              fontWeight: "800",
              fontSize: "1.25rem",
            }}
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
            className="btn-outline"
            style={{ padding: "16px" }}
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}
