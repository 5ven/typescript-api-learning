import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validateCreateUser, validateUpdateUser } from '../middleware/validation.middleware';

const router = Router();

router.get('/', userController.getUsers.bind(userController));
router.get('/:id', userController.getUser.bind(userController));
router.post('/', validateCreateUser, userController.createUser.bind(userController));
router.put('/:id', validateUpdateUser, userController.updateUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));

export { router as userRoutes };
