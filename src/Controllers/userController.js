import { prisma } from '../../lib/prisma';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { fieldsTrimmed } from '../utils/fieldsTrimmed';

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await prisma.user.findMany({
    include: {
      ownedTeams: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (!users) {
    return next(new AppError('There are no users exist yet!', 404));
  }

  res.status(200).json({
    status: 'success',
    len: users.length,
    data: users,
  });
});
export const getUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const trimmed = fieldsTrimmed({ userId });

  const user = await prisma.user.findUnique({
    where: {
      id: trimmed.userId,
    },
    include: {
      ownedTeams: true,
    },
  });

  if (!user) {
    return next(new AppError('This is no user exist with this id!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});
export const deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const trimmed = fieldsTrimmed({ userId });
  const user = await prisma.user.findUnique({
    where: {
      id: trimmed.userId,
    },
  });

  if (!user) {
    return next(new AppError('This is no user exist with this id!', 404));
  }
  await prisma.user.delete({
    where: {
      id: trimmed.userId,
    },
  });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
