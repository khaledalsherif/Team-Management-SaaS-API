import { Router } from 'express';
import * as taskController from '../Controllers/taskController';
import { protect } from '../Middlewares/auth';
import { authorizeTeam } from '../Middlewares/teamAccess';
import commentRoutes from './commentRoutes';
const router = Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(authorizeTeam('OWNER', 'MANAGER', 'MEMBER'), taskController.getTasks)
  .post(authorizeTeam('OWNER', 'MANAGER'), taskController.createTask);

router
  .route('/:taskId')
  .get(authorizeTeam('OWNER', 'MANAGER', 'MEMBER'), taskController.getTask)
  .patch(authorizeTeam('OWNER', 'MANAGER', 'MEMBER'), taskController.updateTask)
  .delete(authorizeTeam('OWNER', 'MANAGER'), taskController.deleteTask);

router.use('/:taskId/comments', commentRoutes);
export default router;
