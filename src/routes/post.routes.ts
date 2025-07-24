import { Router } from 'express';
import { postController } from '../controllers/post.controller';
import { validateCreatePost, validateUpdatePost } from '../middleware/validation.middleware';

const router = Router();

router.get('/', postController.getPosts.bind(postController));
router.get('/author/:authorId', postController.getPostsByUser.bind(postController));
router.get('/:id', postController.getPost.bind(postController));
router.post('/', validateCreatePost, postController.createPost.bind(postController));
router.put('/:id', validateUpdatePost, postController.updatePost.bind(postController));
router.delete('/:id', postController.deletePost.bind(postController));

export { router as postRoutes };
