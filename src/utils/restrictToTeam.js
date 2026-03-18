import AppError from './appError';
export const restrictToTeam = (roleInTeam, ...roles) => {
  const hasPermision = roles.includes(roleInTeam);
  if (!hasPermision) {
    throw new AppError(
      'You do not have permission to perform this action!',
      403,
    );
  }
};
