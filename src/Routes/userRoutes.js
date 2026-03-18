import { Router } from 'express';
import * as authController from '../Controllers/authController';
import * as userController from '../Controllers/userController';
import { protect, restrictTo } from '../Middlewares/auth';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.get('/', protect, restrictTo('ADMIN'), userController.getAllUsers);

router
  .route('/:userId')
  .get(protect, restrictTo('ADMIN'), userController.getUser)
  .delete(protect, restrictTo('ADMIN'), userController.deleteUser);

export default router;
