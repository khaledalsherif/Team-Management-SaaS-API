export const getRoleInTeam = (team, id) =>
  team.teamMembers.find((m) => m.userId === id).role;
