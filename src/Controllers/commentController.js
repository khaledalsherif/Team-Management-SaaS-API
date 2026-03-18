import catchAsync from '../utils/catchAsync';
import * as z from 'zod';
import { fieldsTrimmed } from '../utils/fieldsTrimmed';
import AppError from '../utils/appError';
import { prisma } from '../../lib/prisma';

const commentSchema = z.object({
  content: z.string().min(3).max(200),
});
const createCommentSchema = commentSchema;
const updateCommentSchema = commentSchema.partial();
export const getAllComments = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;

  const comments = await prisma.comment.findMany({
    where: {
      taskId,
    },
    include: {
      task: true,
      author: {
        select: {
          name: true,
          id: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (!comments || comments.length === 0) {
    return next(new AppError('No Comments exist for this project yet!', 404));
  }

  res.status(200).json({
    status: 'success',
    len: comments.length,
    data: comments,
  });
});
export const createComment = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const { content } = req.body;
  const trimmed = fieldsTrimmed({ content });
  const result = await createCommentSchema.safeParseAsync(trimmed);
  if (!result.success) {
    return next(new AppError(JSON.stringify(result.error.issues), 400));
  }

  const comment = await prisma.comment.create({
    data: {
      content: trimmed.content,
      author: {
        connect: {
          id: req.user.id,
        },
      },
      task: {
        connect: {
          id: taskId,
        },
      },
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      task: true,
    },
  });

  res.status(201).json({
    status: 'success',
    data: comment,
  });
});
export const getComment = catchAsync(async (req, res, next) => {
  const { taskId, commentId } = req.params;
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
      taskId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      task: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: comment,
  });
});
export const updateComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const trimmed = fieldsTrimmed({ content });
  const result = await updateCommentSchema.safeParseAsync(trimmed);
  if (!result.success) {
    return next(new AppError(JSON.stringify(result.error.issues), 400));
  }
  const commentUpdated = await prisma.comment.update({
    where: {
      id: commentId,
      authorId: req.user.id,
    },
    data: {
      content: trimmed.content,
    },
    include: {
      author: true,
      task: true,
    },
  });
  if (!commentUpdated) {
    return next(
      new AppError('Comment not found or you are not authorized', 404),
    );
  }
  res.status(200).json({
    status: 'success',
    data: commentUpdated,
  });
});

export const deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const role = req.roleInTeam;
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }
  const isAuthor = comment.authorId === req.user.id;
  const isOwnerOrManager = role === 'OWNER' || role === 'MANAGER';
  if (!isAuthor && !isOwnerOrManager) {
    return next(
      new AppError('You do not have permission to delete this comment', 403),
    );
  }
  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
