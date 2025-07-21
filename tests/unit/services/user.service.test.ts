import { describe, beforeEach, it, expect } from '@jest/globals';
import { UserService } from '../../../src/services/user.service';
import { UserFixtures } from '../../fixtures/user.fixtures';
import { CreateUserRequest, UpdateUserRequest } from '../../../src/types/user.types';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('getAllUsers', () => {
    it('should return paginated users with correct structure', async () => {
      const page = 1;
      const limit = 10;

      const result = await userService.getAllUsers(page, limit);

      expect(result).toEqual({
        items: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        limit: 10,
        totalPages: expect.any(Number),
        hasNext: expect.any(Boolean),
        hasPrevious: false
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach(user => {
        expect(user).toEqual({
          id: expect.any(String),
          name: expect.any(String),
          email: expect.any(String),
          age: expect.any(Number),
          isActive: expect.any(Boolean)
        });
        expect(user).not.toHaveProperty('updatedAt');
      });
    });

    it('should handle pagination correctly', async () => {
      const users = UserFixtures.createMultipleUsers(15);
      for (const userData of users) {
        await userService.createUser({
          name: userData.name,
          email: userData.email,
          age: userData.age
        });
      }

      const result = await userService.getAllUsers(2, 5);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.items.length).toBeLessThanOrEqual(5);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(true);
      expect(result.totalPages).toBeGreaterThan(1);
    });

    it('should handle empty results gracefully', async () => {
      const emptyService = new (UserService as any)();
      emptyService.users = new Map();

      const result = await emptyService.getAllUsers();

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      });
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const createRequest = UserFixtures.createCreateUserRequest();
      const createdUser = await userService.createUser(createRequest);

      const foundUser = await userService.getUserById(createdUser.id);

      expect(foundUser).not.toBeNull();
      expect(foundUser!.id).toBe(createdUser.id);
      expect(foundUser!.name).toBe(createdUser.name);
      expect(foundUser!.email).toBe(createdUser.email);
      expect(foundUser!.age).toBe(createdUser.age);
      expect(foundUser).not.toHaveProperty('updatedAt');
    });

    it('should return null when user not found', async () => {
      const result = await userService.getUserById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user with correct properties', async () => {
      const createRequest = UserFixtures.createCreateUserRequest({
        name: 'Test User',
        age: 25
      });

      const createdUser = await userService.createUser(createRequest);

      expect(createdUser).toEqual({
        id: expect.any(String),
        name: 'Test User',
        email: createRequest.email,
        age: 25,
        isActive: true
      });
      expect(createdUser).not.toHaveProperty('updatedAt');

      const retrieved = await userService.getUserById(createdUser.id);
      expect(retrieved).toEqual(createdUser);
    });

    it('should reject duplicate emails', async () => {
      const createRequest = UserFixtures.createCreateUserRequest();
      await userService.createUser(createRequest);

      // Use the same request object for true duplicate test
      await expect(userService.createUser(createRequest))
        .rejects
        .toThrow('User with this email already exists');
    });

    it('should increment user count', async () => {
      const initialCount = userService.totalUsers;
      const createRequest = UserFixtures.createCreateUserRequest();

      await userService.createUser(createRequest);

      expect(userService.totalUsers).toBe(initialCount + 1);
    });
  });

  describe('updateUser', () => {
    it('should update existing user successfully', async () => {
      const createRequest = UserFixtures.createCreateUserRequest();
      const createdUser = await userService.createUser(createRequest);
      
      const updateRequest: UpdateUserRequest = {
        name: 'Updated Name',
        age: 30
      };

      const updatedUser = await userService.updateUser(createdUser.id, updateRequest);

      expect(updatedUser).not.toBeNull();
      expect(updatedUser!.name).toBe('Updated Name');
      expect(updatedUser!.age).toBe(30);
      expect(updatedUser!.email).toBe(createdUser.email);
      expect(updatedUser!.id).toBe(createdUser.id);
      expect(updatedUser).not.toHaveProperty('updatedAt');
    });

    it('should return null for non-existent user', async () => {
      const result = await userService.updateUser('non-existent', { name: 'New Name' });
      expect(result).toBeNull();
    });

    it('should reject duplicate email updates', async () => {
      // Create two users with guaranteed unique emails
      const user1 = await userService.createUser(UserFixtures.createCreateUserRequest({
        name: 'User 1'
      }));
      
      const user2 = await userService.createUser(UserFixtures.createCreateUserRequest({
        name: 'User 2'
      }));

      // Try to update user2 with user1's email
      await expect(userService.updateUser(user2.id, { email: user1.email }))
        .rejects
        .toThrow('Email already in use by another user');
    });

    it('should allow user to keep their own email', async () => {
      const createRequest = UserFixtures.createCreateUserRequest({
        name: 'Test User'
      });
      const user = await userService.createUser(createRequest);

      // Update with same email (should not throw)
      const result = await userService.updateUser(user.id, { 
        email: user.email,
        name: 'Updated Name' 
      });

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Updated Name');
      expect(result!.email).toBe(user.email);
    });
  });

  describe('deleteUser', () => {
    it('should delete existing user', async () => {
      // Use fixtures for unique user
      const user = await userService.createUser(UserFixtures.createCreateUserRequest());
      const initialCount = userService.totalUsers;

      const deleted = await userService.deleteUser(user.id);

      expect(deleted).toBe(true);
      expect(userService.totalUsers).toBe(initialCount - 1);

      const retrieved = await userService.getUserById(user.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent user', async () => {
      const result = await userService.deleteUser('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('totalUsers getter', () => {
    it('should return correct count initially', () => {
      // Service starts with 2 seeded users
      expect(userService.totalUsers).toBe(2);
    });

    it('should increment when user is created', async () => {
      const initialCount = userService.totalUsers;
      
      await userService.createUser(UserFixtures.createCreateUserRequest());

      expect(userService.totalUsers).toBe(initialCount + 1);
    });

    it('should handle multiple operations correctly', async () => {
      const initialCount = userService.totalUsers;
      
      const user1 = await userService.createUser(UserFixtures.createCreateUserRequest());
      const user2 = await userService.createUser(UserFixtures.createCreateUserRequest());
      
      expect(userService.totalUsers).toBe(initialCount + 2);
      
      // Delete one user
      await userService.deleteUser(user1.id);
      expect(userService.totalUsers).toBe(initialCount + 1);
    });
  });
});
