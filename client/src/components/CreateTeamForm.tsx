import { useState } from "react";
import { socket } from "../socket";
import toast from "react-hot-toast";

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
      style={{
        minWidth: "100%",
        border: `1px solid ${newTeamColor}`,
        margin: "0",
      }}
      className="glass-card"
    >
      <h3 style={{ marginBottom: "1rem" }}>Add a team</h3>
      <div style={{ display: "flex", gap: "8px", padding: "12px" }}>
        {TEAMS_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setNewTeamColor(color)}
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: color,
              border:
                color === newTeamColor
                  ? "2px solid var(--text-primary)"
                  : "2px solid transparent",
            }}
          />
        ))}
      </div>
      <form
        onSubmit={addTeam}
        className="flex-row"
        style={{ alignItems: "center" }}
      >
        <input
          type="text"
          placeholder="New Team Name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: "12px 24px", whiteSpace: "nowrap" }}
        >
          Add Team
        </button>
      </form>
    </div>
  );
}
