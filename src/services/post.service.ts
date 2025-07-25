import { BaseService } from './base.service';
import { Post, CreatePostRequest, UpdatePostRequest, PostResponse } from '../types/post.types';
import { PaginationUtils } from '../utils/pagination.util';
import { PaginatedResponse } from '../types/response.types';

export interface IPostService {
    // BaseService methods
    getById(id: string): Promise<PostResponse | null>;
    getAll(page: number, limit: number): Promise<PaginatedResponse<PostResponse>>;
    create(data: CreatePostRequest): Promise<PostResponse>;
    update(id: string, updates: UpdatePostRequest): Promise<PostResponse | null>;
    delete(id: string): Promise<boolean>;
    // Post-specific methods
    getAllPosts(page: number, limit: number): Promise<PaginatedResponse<PostResponse>>;
    getAllPostsByUser(page: number, limit: number, authorId: string): Promise<PaginatedResponse<PostResponse>>;
    getPostById(id: string): Promise<PostResponse | null>;
    createPost(postData: CreatePostRequest): Promise<PostResponse>;
    updatePost(id: string, updates: UpdatePostRequest): Promise<PostResponse | null>;
    deletePost(id: string): Promise<boolean>;
    readonly totalPosts: number;
}

export class PostService
    extends BaseService<Post, PostResponse, CreatePostRequest, UpdatePostRequest>
    implements IPostService {

    protected seedData(): void {
        const samplePosts: Post[] = [
            {
                id: '1',
                title: 'Red Arrows Fly over Isle of Man',
                content: 'The Red Arrows performed a stunning display over the Isle of Man, showcasing their incredible flying skills and precision.',
                authorId: '1',
                isVisible: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '2',
                title: 'Local Food Festival is Back',
                content: 'The annual local food festival returns this weekend, featuring a variety of local vendors and delicious food options.',
                isVisible: true,
                authorId: '2',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        samplePosts.forEach(post => {
            this.storage.set(post.id, post);
            this.nextId = Math.max(this.nextId, parseInt(post.id) + 1);
        });
    }

    protected toResponse(post: Post): PostResponse {
        const { updatedAt, ...postResponse } = post;
        return postResponse;
    }

    protected async validateUniqueness(data: CreatePostRequest): Promise<void> {
        const existingPost = Array.from(this.storage.values())
            .find(post => post.title === data.title);

        if (existingPost) {
            throw new Error('Post with this title already exists');
        }
    }

    protected async validateUpdateUniqueness(id: string, updates: UpdatePostRequest): Promise<void> {
        if (updates.title) {
            const existingPost = this.storage.get(id);
            if (existingPost && updates.title !== existingPost.title) {
                const titleExists = Array.from(this.storage.values())
                    .some(post => post.id !== id && post.title === updates.title);

                if (titleExists) {
                    throw new Error('Title already in use by another post');
                }
            }
        }
    }

    protected createEntityFromRequest(data: CreatePostRequest): Post {
        const now = new Date();
        return {
            id: this.generateId(),
            ...data,
            isVisible: data.isVisible !== undefined ? data.isVisible : true,
            createdAt: now,
            updatedAt: now
        };
    }

    // Interface implementations
    async getAllPosts(page: number, limit: number): Promise<PaginatedResponse<PostResponse>> {
        return this.getAll(page, limit);
    }

    async getAllPostsByUser(page: number, limit: number, authorId: string): Promise<PaginatedResponse<PostResponse>> {
        const params = PaginationUtils.validateParams({ page, limit });
        const userPosts = Array.from(this.storage.values())
            .filter(post => post.authorId === authorId);
        const responses = userPosts.map(post => this.toResponse(post));

        return PaginationUtils.paginate(responses, params.page, params.limit);
    }

    // Delegate the rest to base class
    async getPostById(id: string): Promise<PostResponse | null> {
        return this.getById(id);
    }

    async createPost(postData: CreatePostRequest): Promise<PostResponse> {
        return this.create(postData);
    }

    async updatePost(id: string, updates: UpdatePostRequest): Promise<PostResponse | null> {
        return this.update(id, updates);
    }

    async deletePost(id: string): Promise<boolean> {
        return this.delete(id);
    }

    get totalPosts(): number {
        return this.totalCount;
    }
}

export const postService = new PostService();
