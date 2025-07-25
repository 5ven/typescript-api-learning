// controllers/post.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { postService, IPostService } from '../services/post.service';
import { CreatePostRequest, UpdatePostRequest, PostResponse } from '../types/post.types';

export class PostController extends BaseController<
  PostResponse,
  CreatePostRequest,
  UpdatePostRequest,
  IPostService
> {
  constructor(injectedPostService?: IPostService) {
    super(injectedPostService || postService);
  }

  // Implement abstract methods
  protected getEntityName(): string {
    return 'Post';
  }

  protected getNotFoundErrorCode(): string {
    return 'POST_NOT_FOUND';
  }

  protected getCollectionSuccessMessage(): string {
    return 'Posts retrieved successfully';
  }

  protected getSingleSuccessMessage(): string {
    return 'Post retrieved successfully';
  }

  protected getCreateSuccessMessage(): string {
    return 'Post created successfully';
  }

  protected getUpdateSuccessMessage(): string {
    return 'Post updated successfully';
  }

  protected getDeleteSuccessMessage(): string {
    return 'Post deleted successfully';
  }

  // Public interface methods (delegate to base)
  async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.getAll(req, res, next);
  }

  async getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.getById(req, res, next);
  }

  async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.create(req, res, next);
  }

  async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.update(req, res, next);
  }

  async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.delete(req, res, next);
  }

  // Post-specific method (not in base class)
  async getPostsByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = this.parsePaginationParams(req);
      const authorId = req.params.authorId;

      const paginatedPosts = await this.service.getAllPostsByUser(page, limit, authorId);

      this.sendSuccessResponse(
        res, 
        paginatedPosts, 
        'User posts retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
// Exporting the controller instance allows it to be used in routes    