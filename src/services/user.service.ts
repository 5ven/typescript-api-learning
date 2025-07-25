import { BaseService } from './base.service';
import { User, CreateUserRequest, UpdateUserRequest, UserResponse } from '../types/user.types';
import { PaginatedResponse } from '../types/response.types';

export interface IUserService {
  // BaseController methods
  getById(id: string): Promise<UserResponse | null>;
  getAll(page: number, limit: number): Promise<PaginatedResponse<UserResponse>>;
  create(data: CreateUserRequest): Promise<UserResponse>;
  update(id: string, updates: UpdateUserRequest): Promise<UserResponse | null>;
  delete(id: string): Promise<boolean>;
  // User-specific methods
  getAllUsers(page: number, limit: number): Promise<PaginatedResponse<UserResponse>>;
  getUserById(id: string): Promise<UserResponse | null>;
  createUser(userData: CreateUserRequest): Promise<UserResponse>;
  updateUser(id: string, updates: UpdateUserRequest): Promise<UserResponse | null>;
  deleteUser(id: string): Promise<boolean>;
  readonly totalUsers: number;
}

export class UserService 
  extends BaseService<User, UserResponse, CreateUserRequest, UpdateUserRequest> 
  implements IUserService {

  // Implement abstract methods
  protected seedData(): void {
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
      this.storage.set(user.id, user);
      this.nextId = Math.max(this.nextId, parseInt(user.id) + 1);
    });
  }

  protected toResponse(user: User): UserResponse {
    const { updatedAt, createdAt, ...userResponse } = user;
    return userResponse;
  }

  protected async validateUniqueness(data: CreateUserRequest): Promise<void> {
    const existingUser = Array.from(this.storage.values())
      .find(user => user.email === data.email);

    if (existingUser) {
      throw new Error('User with this email already exists');
    }
  }

  protected async validateUpdateUniqueness(id: string, updates: UpdateUserRequest): Promise<void> {
    if (updates.email) {
      const existingUser = this.storage.get(id);
      if (existingUser && updates.email !== existingUser.email) {
        const emailExists = Array.from(this.storage.values())
          .some(user => user.id !== id && user.email === updates.email);

        if (emailExists) {
          throw new Error('Email already in use by another user');
        }
      }
    }
  }

  protected createEntityFromRequest(data: CreateUserRequest): User {
    const now = new Date();
    return {
      id: this.generateId(),
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
  }

  // Interface implementation (delegates to base class)
  async getAllUsers(page: number, limit: number): Promise<PaginatedResponse<UserResponse>> {
    return this.getAll(page, limit);
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    return this.getById(id);
  }

  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    return this.create(userData);
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<UserResponse | null> {
    return this.update(id, updates);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.delete(id);
  }

  get totalUsers(): number {
    return this.totalCount;
  }
}

export const userService = new UserService();
