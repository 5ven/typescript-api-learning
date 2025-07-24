import { PaginatedResponse } from '../types/response.types';
import { Post, CreatePostRequest, UpdatePostRequest, PostResponse, PostsResponse } from '../types/post.types';
import { PaginationUtils } from '../utils/pagination.util';

export interface IPostService {
  getAllPosts(page: number, limit: number): Promise<PaginatedResponse<PostResponse>>;
  getAllPostsByUser(page: number, limit: number, userId: string): Promise<PaginatedResponse<PostResponse>>;
  getPostById(id: string): Promise<PostResponse | null>;
  createPost(userData: CreatePostRequest): Promise<PostResponse>;
  updatePost(id: string, updates: UpdatePostRequest): Promise<PostResponse | null>;
  deletePost(id: string): Promise<boolean>;
  readonly totalUsers: number;
}

// In-memory storage (in real life, this would be a database)
export class PostService implements IPostService {
    private posts: Map<string, Post> = new Map();
    private nextId = 1;

    constructor() {
        // Seed some data for testing
        this.seedData();
    }

    get totalUsers(): number {
        return this.posts.size;
    }

    private seedData(): void {
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
            this.posts.set(post.id, post);
            this.nextId = Math.max(this.nextId, parseInt(post.id) + 1);
        });
    }

    async getAllPosts(page: number = 1, limit: number = 10): Promise<PaginatedResponse<PostResponse>> {
        // Validate parameters
        const params = PaginationUtils.validateParams({ page, limit });

        // Get all users and convert to responses
        const allVisiblePosts = Array.from(this.posts.values()).filter(post => post.isVisible === true);

        const postResponses = allVisiblePosts.map(this.toPostResponse);

        // Use utility for pagination
        return PaginationUtils.paginate(postResponses, params.page, params.limit);
    }

    async getPostById(id: string): Promise<PostResponse | null> {
        const user = this.posts.get(id);
        return user ? this.toPostResponse(user) : null;
    }

    async getAllPostsByUser(page: number, limit: number, authorId: string): Promise<PaginatedResponse<PostResponse>> {
        // Validate parameters
        const params = PaginationUtils.validateParams({ page, limit });

        // Get all posts and convert to responses
        const allPosts = Array.from(this.posts.values()).filter(post => post.authorId === authorId && post.isVisible === true);

        const postResponses = allPosts.map(this.toPostResponse);

        // Use utility for pagination
        return PaginationUtils.paginate(postResponses, params.page, params.limit);
    }

    async createPost(postData: CreatePostRequest): Promise<PostResponse> {
        // Check if email already exists
        const existingPost = Array.from(this.posts.values())
            .find(post => post.title === postData.title);

        if (existingPost) {
            throw new Error('Post with this title already exists');
        }

        const now = new Date();
        const newPost: Post = {
            id: this.nextId.toString(),
            ...postData,
            isVisible: postData.isVisible !== undefined ? postData.isVisible : true,
            createdAt: now,
            updatedAt: now
        };

        this.posts.set(newPost.id, newPost);
        this.nextId++;

        return this.toPostResponse(newPost);
    }

    async updatePost(id: string, updates: UpdatePostRequest): Promise<PostResponse | null> {
        const existingPost = this.posts.get(id);

        if (!existingPost) {
            return null;
        }

        // Check title uniqueness if title is being updated
        if (updates.title && updates.title !== existingPost.title) {
            const titleExists = Array.from(this.posts.values())
                .some(post => post.id !== id && post.title === updates.title);

            if (titleExists) {
                throw new Error('Title already in use by another post');
            }
        }

        const updatedPost: Post = {
            ...existingPost,
            ...updates,
            updatedAt: new Date()
        };

        this.posts.set(id, updatedPost);
        return this.toPostResponse(updatedPost);
    }

    async deletePost(id: string): Promise<boolean> {
        return this.posts.delete(id);
    }

    // Convert internal User to public UserResponse
    private toPostResponse(post: Post): PostResponse {
        const { updatedAt, ...postResponse } = post;
        return postResponse;
    }
}

export const postService = new PostService();
