export interface Post {
    id: string;
    title: string;
    content: string;
    authorId: string;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type PostResponse = Omit<Post, 'updatedAt'>;

// Collection response with metadata
export interface PostsResponse {
    posts: PostResponse[];
    total: number;
    page: number;
    limit: number;
}

export interface CreatePostRequest {
    authorId: string;
    title: string;
    content: string;
    isVisible?: boolean;
}

export interface UpdatePostRequest {
    id: string;
    title?: string;
    content?: string;
    isVisible?: boolean;
}
