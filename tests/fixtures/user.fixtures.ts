import { User, CreateUserRequest, UpdateUserRequest, UserResponse } from '../../src/types/user.types';

export class UserFixtures {
  private static getUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private static getUniqueEmail(baseEmail?: string): string {
    const uniqueId = this.getUniqueId();
    if (baseEmail) {
      const [name, domain] = baseEmail.split('@');
      return `${name}-${uniqueId}@${domain}`;
    }
    return `user-${uniqueId}@test.com`; // Use test.com domain to avoid conflicts
  }

  static createUser(overrides: Partial<User> = {}): User {
    const uniqueId = this.getUniqueId();
    return {
      id: overrides.id || uniqueId,
      name: overrides.name || `Test User ${uniqueId}`,
      email: overrides.email || this.getUniqueEmail(),
      age: overrides.age || 30,
      isActive: overrides.isActive ?? true,
      createdAt: overrides.createdAt || new Date('2023-01-01T00:00:00.000Z'),
      updatedAt: overrides.updatedAt || new Date('2023-01-01T00:00:00.000Z')
    };
  }

  static createCreateUserRequest(overrides: Partial<CreateUserRequest> = {}): CreateUserRequest {
    const uniqueId = this.getUniqueId();
    return {
      name: overrides.name || `Test User ${uniqueId}`,
      email: overrides.email || this.getUniqueEmail(),
      age: overrides.age || 25
    };
  }

  static createUpdateUserRequest(overrides: Partial<UpdateUserRequest> = {}): UpdateUserRequest {
    return {
      name: 'Updated Name',
      age: 35,
      ...overrides
    };
  }

  static createUserResponse(overrides: Partial<UserResponse> = {}): UserResponse {
    const uniqueId = this.getUniqueId();
    return {
      id: overrides.id || uniqueId,
      name: overrides.name || `Test User ${uniqueId}`,
      email: overrides.email || this.getUniqueEmail(),
      age: overrides.age || 30,
      isActive: overrides.isActive ?? true
    };
  }

  static createMultipleUsers(count: number = 3): User[] {
    return Array.from({ length: count }, (_, index) => {
      const uniqueId = this.getUniqueId();
      return this.createUser({
        id: uniqueId,
        name: `User ${index + 1} ${uniqueId}`,
        email: this.getUniqueEmail(`user${index + 1}@test.com`),
        age: 20 + index
      });
    });
  }

  // For testing edge cases
  static createInvalidUsers() {
    const uniqueId = this.getUniqueId();
    return {
      noEmail: { name: 'No Email', age: 25 } as CreateUserRequest,
      invalidEmail: { name: 'Bad Email', email: 'not-an-email', age: 25 } as CreateUserRequest,
      negativeAge: { name: 'Negative Age', email: this.getUniqueEmail(), age: -5 } as CreateUserRequest,
      tooOld: { name: 'Too Old', email: this.getUniqueEmail(), age: 200 } as CreateUserRequest
    };
  }
}