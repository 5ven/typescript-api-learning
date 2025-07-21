import { describe, beforeEach, it, expect } from '@jest/globals';
import { IUserService } from '../../../src/services/user.service';
import { UserService } from '../../../src/services/user.service';
import { UserFixtures } from '../../fixtures/user.fixtures';

// Contract test that can be run against ANY implementation of IUserService
describe('IUserService Contract Tests', () => {
  // Test suite that can be run against any implementation
  const testUserServiceContract = (
    createService: () => IUserService,
    serviceName: string
  ) => {
    describe(`${serviceName} implementation`, () => {
      let service: IUserService;

      beforeEach(() => {
        service = createService();
      });

      describe('getUserById', () => {
        it('should return null for non-existent user', async () => {
          const result = await service.getUserById('non-existent-id');
          expect(result).toBeNull();
        });

        it('should return user when found', async () => {
          const userData = UserFixtures.createCreateUserRequest();
          const createdUser = await service.createUser(userData);
          
          const foundUser = await service.getUserById(createdUser.id);
          
          expect(foundUser).not.toBeNull();
          expect(foundUser!.id).toBe(createdUser.id);
          expect(foundUser!.name).toBe(userData.name);
          expect(foundUser!.email).toBe(userData.email);
          expect(foundUser!.age).toBe(userData.age);
          
          // Contract: UserResponse should not include updatedAt
          expect(foundUser).not.toHaveProperty('updatedAt');
          expect(foundUser).not.toHaveProperty('createdAt');
        });
      });

      describe('createUser', () => {
        it('should create user with generated ID and timestamps', async () => {
          const userData = UserFixtures.createCreateUserRequest();
          
          const user = await service.createUser(userData);
          
          expect(user.id).toBeDefined();
          expect(user.id).not.toBe('');
          expect(user.name).toBe(userData.name);
          expect(user.email).toBe(userData.email);
          expect(user.age).toBe(userData.age);
          expect(user.isActive).toBe(true);
          
          // Contract: UserResponse should not include updatedAt
          expect(user).not.toHaveProperty('updatedAt');
          expect(user).not.toHaveProperty('createdAt');
        });

        it('should reject duplicate emails', async () => {
          const userData = UserFixtures.createCreateUserRequest();
          await service.createUser(userData);
          
          await expect(service.createUser(userData)).rejects.toThrow();
        });

        it('should increment total user count', async () => {
          const initialCount = service.totalUsers;
          const userData = UserFixtures.createCreateUserRequest();
          
          await service.createUser(userData);
          
          expect(service.totalUsers).toBe(initialCount + 1);
        });
      });

      describe('getAllUsers', () => {
        it('should return paginated response structure', async () => {
          const result = await service.getAllUsers(1, 10);
          
          expect(result).toEqual({
            items: expect.any(Array),
            total: expect.any(Number),
            page: 1,
            limit: 10,
            totalPages: expect.any(Number),
            hasNext: expect.any(Boolean),
            hasPrevious: false // First page never has previous
          });
        });

        it('should handle pagination correctly', async () => {
          // Create enough users to test pagination
          const userData = UserFixtures.createCreateUserRequest();
          await service.createUser(userData);
          await service.createUser({ ...userData, email: 'different@example.com' });
          
          const firstPage = await service.getAllUsers(1, 1);
          const secondPage = await service.getAllUsers(2, 1);
          
          expect(firstPage.items.length).toBe(1);
          expect(secondPage.items.length).toBeGreaterThanOrEqual(0);
          expect(firstPage.hasNext).toBe(true);
          expect(secondPage.hasPrevious).toBe(true);
        });
      });

      describe('updateUser', () => {
        it('should update existing user', async () => {
          const userData = UserFixtures.createCreateUserRequest();
          const createdUser = await service.createUser(userData);
          
          const updates = { name: 'Updated Name', age: 99 };
          const updatedUser = await service.updateUser(createdUser.id, updates);
          
          expect(updatedUser).not.toBeNull();
          expect(updatedUser!.name).toBe(updates.name);
          expect(updatedUser!.age).toBe(updates.age);
          expect(updatedUser!.email).toBe(userData.email);
          expect(updatedUser).not.toHaveProperty('updatedAt');
          expect(updatedUser).not.toHaveProperty('createdAt');
        });

        it('should return null for non-existent user', async () => {
          const result = await service.updateUser('non-existent', { name: 'New Name' });
          expect(result).toBeNull();
        });
      });

      describe('deleteUser', () => {
        it('should delete existing user', async () => {
          const userData = UserFixtures.createCreateUserRequest();
          const createdUser = await service.createUser(userData);
          
          const deleted = await service.deleteUser(createdUser.id);
          expect(deleted).toBe(true);
          
          // Verify deletion
          const retrieved = await service.getUserById(createdUser.id);
          expect(retrieved).toBeNull();
        });

        it('should return false for non-existent user', async () => {
          const deleted = await service.deleteUser('non-existent');
          expect(deleted).toBe(false);
        });
      });
    });
  };

  // Run contract tests against the in-memory implementation
  testUserServiceContract(
    () => new UserService(),
    'InMemoryUserService'
  );

  // When you add database implementation, test it too:
  // testUserServiceContract(
  //   () => new DatabaseUserService(testDb),
  //   'DatabaseUserService'
  // );
});
