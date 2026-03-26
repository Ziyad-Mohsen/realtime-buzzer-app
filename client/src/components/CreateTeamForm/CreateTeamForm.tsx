import { useState } from "react";
import { socket } from "../../lib/socket";
import toast from "react-hot-toast";
import styles from "./CreateTeamForm.module.css";

const TEAMS_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#22C55E", // Green
  "#F59E0B", // Amber
  "#A855F7", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
];

export default function CreateTeamForm({ roomCode }: { roomCode: string }) {
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamColor, setNewTeamColor] = useState(TEAMS_COLORS[0]);

  const addTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;
    socket.emit(
      "createRoomTeam",
      {
        roomCode,
        team: { name: newTeamName, color: newTeamColor, locked: false },
      },
      (response) => {
        if (!response.success) {
          toast.error(response.message);
          return;
        }

        toast.success(response.message);
      },
    );
  };

  return (
    <div
      style={{ "--team-color": newTeamColor } as React.CSSProperties}
      className={`glass-card ${styles.formCard}`}
    >
      <h3 className={styles.title}>Add a team</h3>
      <div className={styles.colorPicker}>
        {TEAMS_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setNewTeamColor(color)}
            style={{ "--btn-bg": color } as React.CSSProperties}
            className={`${styles.colorBtn} ${color === newTeamColor ? styles.colorBtnActive : ""}`}
          />
        ))}
      </div>
      <form onSubmit={addTeam} className={`flex-row ${styles.form}`}>
        <input
          type="text"
          placeholder="New Team Name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
          Add Team
        </button>
      </form>
    </div>
  );
}
