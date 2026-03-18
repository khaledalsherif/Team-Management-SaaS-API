import { Router } from 'express';
import * as teamController from '../Controllers/teamController';
import { protect } from '../Middlewares/auth';
import { authorizeTeam } from '../Middlewares/teamAccess';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(teamController.getAllTeams)
  .post(teamController.createTeam);

router.patch(
  '/:teamId/changeRole',
  authorizeTeam('OWNER'),
  teamController.changeRoleMember,
);

router
  .route('/:teamId')
  .get(authorizeTeam('OWNER', 'MANAGER'), teamController.getMembers)
  .patch(authorizeTeam('OWNER', 'MANAGER'), teamController.addMember)
  .delete(authorizeTeam('OWNER', 'MANAGER'), teamController.removeMember);

export default router;
