import { prisma } from '../../lib/prisma';
import AppError from './appError';

export const getTeam = async (id) => {
  const team = await prisma.team.findUnique({
    where: {
      id,
    },
    include: {
      teamMembers: {
        select: { id: true, role: true, userId: true, user: true },
      },
      projects: true,
    },
  });
  if (!team) {
    throw new AppError('There is no team with that id!', 404);
  }
  return team;
};
