import { Player, Room, Team } from "../../../server/types";

export function getTeams(roomState: Room) {
  const players = roomState.players;
  const teams: Record<string, Team & { players: Player[] }> = {};

  for (const [teamName, team] of Object.entries(roomState.teams)) {
    teams[teamName] = { ...team, players: [] };
  }

  for (const player of Object.values(players)) {
    if (!player.team) continue;
    const team = teams[player.team];
    if (team) {
      team.players.push(player);
    }
  }

  return teams;
}

export function isPlayerLocked(roomState: Room, player: Player) {
  return (
    roomState.locked ||
    (roomState.teams[player.team as string] &&
      roomState.teams[player.team as string].locked) ||
    player.locked
  );
}
