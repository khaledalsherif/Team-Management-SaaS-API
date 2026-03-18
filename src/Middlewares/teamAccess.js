import catchAsync from '../utils/catchAsync';
import { getRoleInTeam } from '../utils/getRoleInTeam';
import { getTeam } from '../utils/getTeam';
import { restrictToTeam } from '../utils/restrictToTeam';

export const authorizeTeam = (...allowedRoles) =>
  catchAsync(async (req, res, next) => {
    const { teamId } = req.params;
    const team = await getTeam(teamId);
    const roleInTeam = getRoleInTeam(team, req.user.id);
    restrictToTeam(roleInTeam, ...allowedRoles);
    req.team = team;
    req.teamMembers = team.teamMembers;
    req.roleInTeam = roleInTeam;
    next();
  });
