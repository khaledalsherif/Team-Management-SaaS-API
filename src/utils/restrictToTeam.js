import AppError from './appError';
export const restrictToTeam = (roleInTeam, ...roles) => {
  // const managerPermision = roles.includes('MANAGER');
  // const isOwner = team.ownerId === id;
  // const isManager = managerPermision
  //   ? team.teamMembers.some((member) => {
  //       return member.userId === id && member.role === 'MANAGER';
  //     })
  //   : false;
  const hasPermision = roles.includes(roleInTeam);
  if (!hasPermision) {
    throw new AppError(
      'You do not have permission to perform this action!',
      403,
    );
  }
};
