import * as z from 'zod';

import { prisma } from '../../lib/prisma';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { fieldsTrimmed } from '../utils/fieldsTrimmed';

const teamSchema = z.object({
  name: z.string().min(3).max(50),
});

export const getAllTeams = catchAsync(async (req, res, next) => {
  const teams = await prisma.team.findMany({
    where: {
      ownerId: req.user.id,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      teamMembers: {
        select: {
          user: {
            select: { id: true, name: true, email: true },
          },
          role: true,
        },
      },
      projects: {
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          tasks: true,
        },
      },
    },
  });

  if (!teams || teams.length === 0) {
    return next(new AppError('You have no teams yet!', 404));
  }

  res.status(200).json({
    status: 'success',
    len: teams.length,
    data: teams,
  });
});

export const createTeam = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const ownerId = req.user.id;
  const trimmed = fieldsTrimmed({ name });

  const result = await teamSchema.safeParseAsync(trimmed);
  if (!result.success) {
    return next(new AppError(JSON.stringify(result.error.issues), 400));
  }

  const team = await prisma.team.create({
    data: {
      name: trimmed.name,
      owner: {
        connect: { id: ownerId },
      },
      teamMembers: {
        create: {
          user: {
            connect: { id: ownerId },
          },
          role: 'OWNER',
        },
      },
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      teamMembers: true,
      projects: true,
    },
  });
  res.status(201).json({
    status: 'success',
    data: team,
  });
});

export const addMember = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;
  const { userId } = req.body;
  const trimmed = fieldsTrimmed({ userId });
  if (
    !(await prisma.user.findUnique({
      where: {
        id: userId,
      },
    }))
  ) {
    return next(new AppError('There is no user with that id!', 404));
  }

  const updateTeam = await prisma.team
    .update({
      where: {
        id: teamId,
      },
      data: {
        teamMembers: {
          create: {
            user: {
              connect: { id: trimmed.userId },
            },
            role: 'MEMBER',
          },
        },
      },
    })
    .catch((err) => {
      const msg =
        err.code === 'P2002' ? 'This user already exists in this team!' : err;
      throw new AppError(msg, 400);
    });

  res.status(200).json({
    status: 'success',
    data: updateTeam,
  });
});
export const changeRoleMember = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;
  const { userId, role } = req.body;
  const trimmed = fieldsTrimmed({ userId, role });
  if (trimmed.userId === req.user.id) {
    return next(
      new AppError(
        'You cannot change your role yourself. You are an Owner!',
        400,
      ),
    );
  }

  const teamMember = await prisma.teamMember
    .update({
      where: {
        userId_teamId: {
          userId: trimmed.userId,
          teamId,
        },
      },

      data: {
        role: trimmed.role,
      },
    })
    .catch((err) => {
      const msg = err.code === 'P2025' ? 'Invalid teamId or ueserId' : err;
      throw new AppError(msg, 400);
    });

  res.status(200).json({
    status: 'success',
    data: teamMember,
  });
});

export const removeMember = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;
  const { userId } = req.body;

  const trimmed = fieldsTrimmed({ userId });
  await prisma.teamMember.delete({
    where: {
      userId_teamId: {
        userId: trimmed.userId,
        teamId,
      },
    },
  });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getMembers = catchAsync(async (req, res, next) => {
  const teamMembers = req.teamMembers;
  res.status(200).json({
    status: 'success',
    len: teamMembers.length,
    data: teamMembers,
  });
});
