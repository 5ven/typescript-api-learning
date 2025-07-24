import { Request, Response, NextFunction } from 'express';
import { postService, IPostService } from '../services/post.service';
import { CreatePostRequest, UpdatePostRequest, PostResponse, PostsResponse } from '../types/post.types';
import { ApiResponse, PaginatedResponse } from '../types/response.types';

export class UserController {
    private postService: IPostService;

    constructor(injectedUserService?: IPostService) {
        this.postService = injectedUserService || postService;
    }

    async getPosts(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

            const paginatedPosts = await this.postService.getAllPosts(page, limit);

            const response: ApiResponse<PaginatedResponse<PostResponse>> = {
                success: true,
                data: paginatedPosts,
                message: 'Posts retrieved successfully',
                timestamp: new Date().toISOString()
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const post = await this.postService.getPostById(id);

            if (!post) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'POST_NOT_FOUND',
                        message: `Post with ID ${id} not found`
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }

            const response: ApiResponse<PostResponse> = {
                success: true,
                data: post,
                message: 'Post retrieved successfully',
                timestamp: new Date().toISOString()
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userData: CreatePostRequest = req.body;
            const newPost = await this.postService.createPost(userData);

            const response: ApiResponse<PostResponse> = {
                success: true,
                data: newPost,
                message: 'Post created successfully',
                timestamp: new Date().toISOString()
            };

            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updates: UpdatePostRequest = req.body;

            const updatedPost = await this.postService.updatePost(id, updates);

            if (!updatedPost) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'POST_NOT_FOUND',
                        message: `Post with ID ${id} not found`
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }

            const response: ApiResponse<PostResponse> = {
                success: true,
                data: updatedPost,
                message: 'Post updated successfully',
                timestamp: new Date().toISOString()
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await this.postService.deletePost(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'POST_NOT_FOUND',
                        message: `Post with ID ${id} not found`
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }

            const response: ApiResponse<null> = {
                success: true,
                data: null,
                message: 'Post deleted successfully',
                timestamp: new Date().toISOString()
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async getPostsByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
            const authorId = req.params.authorId;

            const paginatedPosts = await this.postService.getAllPostsByUser(page, limit, authorId);

            const response: ApiResponse<PaginatedResponse<PostResponse>> = {
                success: true,
                data: paginatedPosts,
                message: 'User posts retrieved successfully',
                timestamp: new Date().toISOString()
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }
}

export const postController = new UserController();