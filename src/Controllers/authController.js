import * as z from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '../../lib/prisma';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

//Northwind => DB in w3school
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  res.status(statusCode).json({
    status: 'success',

    token,
    user,
  });
};
const signupSchema = () =>
  z
    .object({
      email: z.string().email(),
      name: z.string().min(3).max(21),
      password: z.string().min(6).max(21),
      passwordConfirm: z.string(),
      role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: 'Password does not match!',
      path: ['passwordConfirm'],
    });

export const signup = catchAsync(async (req, res, next) => {
  const { email, name, password, passwordConfirm, role } = req.body;
  const trimmed = {
    email: email?.trim(),
    name: name?.trim(),
    password: password?.trim(),
    passwordConfirm: passwordConfirm?.trim(),
    role: role?.trim(),
  };

  const result = await signupSchema().safeParseAsync(trimmed);

  if (!result.success) {
    console.log(result.error.issues);
    return next(new AppError(JSON.stringify(result.error.issues), 400));
  }
  //Now data is safe

  const passwordHashed = await bcrypt.hash(trimmed.password, 12);

  //create user
  const user = await prisma.user.create({
    data: {
      email: trimmed.email,
      name: trimmed.name,
      password: passwordHashed,
      role: trimmed.role,
    },
  });

  createAndSendToken(user, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and the password!', 400));
  }
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createAndSendToken(user, 200, res);
});
