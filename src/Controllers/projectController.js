import * as z from 'zod';

import { prisma } from '../../lib/prisma';
import catchAsync from '../utils/catchAsync';
import { fieldsTrimmed } from '../utils/fieldsTrimmed';
import AppError from '../utils/appError';

const projectSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(3).max(50).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});
const createProjectSchema = projectSchema;
const updateProjectSchema = projectSchema.partial();

export const getAllProjects = catchAsync(async (req, res, next) => {
  const projects = await prisma.project.findMany({
    where: {
      teamId: req.team.id,
    },
    include: {
      team: true,
      tasks: true,
    },
  });

  if (projects.length === 0 || !projects) {
    return next(new AppError('No projects found for this team!', 404));
  }

  res.status(200).json({
    status: 'success',
    len: projects.length,
    data: projects,
  });
});

export const getProject = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({
    where: {
      id_teamId: {
        id: projectId,
        teamId: req.team.id,
      },
    },
    include: {
      team: true,
      tasks: true,
    },
  });
  if (!project) {
    return next(
      new AppError('There is no project with that id(projectId)!', 404),
    );
  }

  res.status(200).json({
    status: 'success',
    data: project,
  });
});
export const createProject = catchAsync(async (req, res, next) => {
  const { name, description, status } = req.body;
  const trimmed = fieldsTrimmed({ name, description, status });
  const result = await createProjectSchema.safeParseAsync(trimmed);
  if (!result.success) {
    return next(new AppError(JSON.stringify(result.error.issues), 400));
  }

  const newProject = await prisma.project.create({
    data: {
      ...result.data,
      team: {
        connect: {
          id: req.team.id,
        },
      },
    },
    include: {
      team: true,
      tasks: true,
    },
  });

  res.status(201).json({
    status: 'success',
    data: newProject,
  });
});
export const updateProject = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { name, description, status } = req.body;

  const trimmed = fieldsTrimmed({ name, description, status });
  const result = await updateProjectSchema.safeParseAsync(trimmed);
  if (!result.success) {
    return next(new AppError(JSON.stringify(result.error.issues), 400));
  }

  const updateProjectTable = await prisma.project.update({
    where: {
      id_teamId: {
        id: projectId,
        teamId: req.team.id,
      },
    },
    data: { ...result.data },
    include: {
      team: true,
      tasks: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      updateProjectTable,
    },
  });
});
export const deleteProject = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  await prisma.project.delete({
    where: {
      id_teamId: {
        id: projectId,
        teamId: req.team.id,
      },
    },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
