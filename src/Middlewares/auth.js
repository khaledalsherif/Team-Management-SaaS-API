import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { prisma } from '../../lib/prisma';

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You have no permission to perform this action!', 403),
      );
    }
    next();
  };

const changePasswordAfter = (user, JWTTimestamp) => {
  const { updatedAt } = user;
  const changedTimestamp = parseInt(updatedAt / 1000, 10); // should greater than iat

  return JWTTimestamp < changedTimestamp;
};

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in and try again!', 401),
    );
  }

  //Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does not no longer exist',
        401,
      ),
    );
  }
  //If change password
  if (changePasswordAfter(currentUser, decoded.iat)) {
    return next(
      new AppError('User recently changed password! please log in again', 401),
    );
  }
  req.user = currentUser;
  next();
});
