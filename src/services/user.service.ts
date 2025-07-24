import { PaginatedResponse } from '../types/response.types';
import { User, CreateUserRequest, UpdateUserRequest, UserResponse } from '../types/user.types';
import { PaginationUtils } from '../utils/pagination.util';

// For integration tests, you might want to use a mock
export interface IUserService {
  getAllUsers(page: number, limit: number): Promise<PaginatedResponse<UserResponse>>;
  getUserById(id: string): Promise<UserResponse | null>;
  createUser(userData: CreateUserRequest): Promise<UserResponse>;
  updateUser(id: string, updates: UpdateUserRequest): Promise<UserResponse | null>;
  deleteUser(id: string): Promise<boolean>;
  readonly totalUsers: number;
}

// In-memory storage (in real life, this would be a database)
export class UserService implements IUserService {
    private users: Map<string, User> = new Map();
    private nextId = 1;

    constructor() {
        // Seed some data for testing
        this.seedData();
    }

    get totalUsers(): number {
        return this.users.size;
    }

    private seedData(): void {
        const sampleUsers: User[] = [
            {
                id: '1',
                name: 'John Doe',
                email: 'john@seed-data.com',
                age: 30,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '2',
                name: 'Jane Smith',
                email: 'jane@seed-data.com',
                age: 25,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        sampleUsers.forEach(user => {
            this.users.set(user.id, user);
            this.nextId = Math.max(this.nextId, parseInt(user.id) + 1);
        });
    }

    async getAllUsers(page: number = 1, limit: number = 10): Promise<PaginatedResponse<UserResponse>> {
        // Validate parameters
        const params = PaginationUtils.validateParams({ page, limit });

        // Get all users and convert to responses
        const allUsers = Array.from(this.users.values());
        const userResponses = allUsers.map(this.toUserResponse);

        // Use utility for pagination
        return PaginationUtils.paginate(userResponses, params.page, params.limit);
    }

    async getUserById(id: string): Promise<UserResponse | null> {
        const user = this.users.get(id);
        return user ? this.toUserResponse(user) : null;
    }

    async createUser(userData: CreateUserRequest): Promise<UserResponse> {
        // Check if email already exists
        const existingUser = Array.from(this.users.values())
            .find(user => user.email === userData.email);

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const now = new Date();
        const newUser: User = {
            id: this.nextId.toString(),
            ...userData,
            isActive: true,
            createdAt: now,
            updatedAt: now
        };

        this.users.set(newUser.id, newUser);
        this.nextId++;

        return this.toUserResponse(newUser);
    }

    async updateUser(id: string, updates: UpdateUserRequest): Promise<UserResponse | null> {
        const existingUser = this.users.get(id);

        if (!existingUser) {
            return null;
        }

        // Check email uniqueness if email is being updated
        if (updates.email && updates.email !== existingUser.email) {
            const emailExists = Array.from(this.users.values())
                .some(user => user.id !== id && user.email === updates.email);

            if (emailExists) {
                throw new Error('Email already in use by another user');
            }
        }

        const updatedUser: User = {
            ...existingUser,
            ...updates,
            updatedAt: new Date()
        };

        this.users.set(id, updatedUser);
        return this.toUserResponse(updatedUser);
    }

    async deleteUser(id: string): Promise<boolean> {
        return this.users.delete(id);
    }

    // Convert internal User to public UserResponse
    private toUserResponse(user: User): UserResponse {
        const { updatedAt, createdAt, ...userResponse } = user;
        return userResponse;
    }
}

export const userService = new UserService();
