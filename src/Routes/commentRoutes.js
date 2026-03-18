import { Router } from 'express';
import { protect } from '../Middlewares/auth';
import * as commentController from '../Controllers/commentController';
import { authorizeTeam } from '../Middlewares/teamAccess';
const router = Router({ mergeParams: true });
router.use(protect);
router.use(authorizeTeam('OWNER', 'MANAGER', 'MEMBER'));

router
  .route('/')
  .get(commentController.getAllComments)
  .post(commentController.createComment);

router
  .route('/:commentId')
  .get(commentController.getComment)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

export default router;
