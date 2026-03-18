import express from 'express';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

import userRouter from './src/Routes/userRoutes';
import teamRouter from './src/Routes/teamRoutes';
import projectRouter from './src/Routes/projectRoutes';

import globalErrorHandler from './src/Middlewares/globalErrorHandler';

const app = express();
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour',
});
app.use('/api', limiter);
app.use(express.json());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/teams', teamRouter);
app.use('/api/v1/projects', projectRouter);

app.use(globalErrorHandler);
export default app;
