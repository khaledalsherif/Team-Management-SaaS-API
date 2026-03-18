import * as z from 'zod';
import catchAsync from '../utils/catchAsync';
import { fieldsTrimmed } from '../utils/fieldsTrimmed';
import AppError from '../utils/appError';
import { prisma } from '../../lib/prisma';

const taskSchema = z.object({
  title: z.string().min(3).max(50),
  description: z.string().min(3).max(300).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});
const createTaskSchema = taskSchema;
const updateTaskSchema = taskSchema.partial();

export const createTask = catchAsync(async (req, res, next) => {
  const {
    title, //Mandatory
    description,
    status,
    priority,
    assignedToId, //Mandatory
  } = req.body;
  const { projectId, teamId } = req.params;
  const trimmed = fieldsTrimmed({
    title,
    description,
    status,
    priority,
  });

  const result = await createTaskSchema.safeParseAsync(trimmed);
  if (!result.success) {
    return next(new AppError(JSON.stringify(result.error.issues), 400));
  }
  const createTask = await prisma.task.create({
    data: {
      ...result.data,
      createdBy: {
        connect: {
          id: req.user.id,
        },
      },
      project: {
        connect: {
          id_teamId: {
            id: projectId,
            teamId,
          },
        },
      },
      assignedTo: assignedToId
        ? {
            connect: {
              id: assignedToId,
            },
          }
        : undefined,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      comments: true,
    },
  });

  res.status(201).json({
    status: 'success',
    data: createTask,
  });
});
export const getTasks = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const role = req.roleInTeam;

  const filter =
    role === 'MEMBER'
      ? { projectId: projectId, assignedToId: req.user.id }
      : { projectId: projectId };

  const tasks = await prisma.task.findMany({
    where: { ...filter },
    include: {
      project: true,
      comments: true,
    },
  });
  if (!tasks || tasks.length === 0) {
    return next(new AppError('These are not tasks yet!', 404));
  }
  res.status(200).json({
    status: 'success',
    len: tasks.length,
    data: tasks,
  });
});
export const getTask = catchAsync(async (req, res, next) => {
  const { taskId, projectId } = req.params;

  const task = await prisma.task.findUnique({
    where: {
      id_projectId: {
        id: taskId,
        projectId,
      },
    },
    include: { assignedTo: true, createdBy: true },
  });

  if (!task) return next(new AppError('Task not found!', 404));

  res.status(200).json({
    status: 'success',
    data: task,
  });
});

export const updateTask = catchAsync(async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { title, description, status, priority } = req.body;

  const role = req.roleInTeam;

  const trimmed =
    role === 'MEMBER'
      ? fieldsTrimmed({ status })
      : fieldsTrimmed({ title, description, status, priority });
  const result = await updateTaskSchema.safeParseAsync(trimmed);
  if (!result.success) {
    return next(new AppError(JSON.stringify(result.error.issues), 400));
  }

  const task = await prisma.task.update({
    where: {
      id_projectId: {
        id: taskId,
        projectId,
      },
    },
    data: {
      ...result.data,
    },
    include: {
      project: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});
export const deleteTask = catchAsync(async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const role = req.roleInTeam;
  if (role === 'MEMBER') {
    return next(
      new AppError('You have no permision to perform this action!', 403),
    );
  }

  await prisma.task.delete({
    where: {
      id_projectId: {
        id: taskId,
        projectId,
      },
    },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
