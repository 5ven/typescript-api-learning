export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// For creating users - no ID or timestamps needed
export interface CreateUserRequest {
  name: string;
  email: string;
  age: number;
}

// For updates - everything optional except ID
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  age?: number;
  isActive?: boolean;
}

// Public response - no sensitive internal fields
export type UserResponse = Omit<User, 'updatedAt' | 'createdAt'>;

// Collection response with metadata
export interface UsersResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
}
