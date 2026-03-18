import { Router } from 'express';

import * as projectController from '../Controllers/projectController';
import { protect } from '../Middlewares/auth';
import { authorizeTeam } from '../Middlewares/teamAccess';
import taskRoutes from './taskRoutes';
const router = Router();
router.use(protect);

router
  .route('/:teamId')
  .get(
    authorizeTeam('OWNER', 'MANAGER', 'MEMBER'),
    projectController.getAllProjects,
  )
  .post(authorizeTeam('OWNER', 'MANAGER'), projectController.createProject);

router
  .route('/:teamId/:projectId')
  .get(
    authorizeTeam('OWNER', 'MANAGER', 'MEMBER'),
    projectController.getProject,
  )
  .patch(authorizeTeam('OWNER', 'MANAGER'), projectController.updateProject)
  .delete(authorizeTeam('OWNER', 'MANAGER'), projectController.deleteProject);

router.use('/:teamId/:projectId/tasks', taskRoutes);
export default router;
