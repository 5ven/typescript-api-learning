import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { UserController } from '../../../src/controllers/user.controller';
import { 
  createMockRequest, 
  createMockResponse, 
  createMockNextFunction
} from '../../utils/mock-factories';
import { UserFixtures } from '../../fixtures/user.fixtures';
import { TestHelpers } from '../../utils/test-helpers';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: any;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    // Create clean mocks
    mockUserService = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      totalUsers: 0
    };
    
    // Inject the mock service
    controller = new UserController(mockUserService);
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNextFunction();
  });

  describe('getUsers', () => {
    it('should return paginated users successfully', async () => {
      // Arrange
      req.query = { page: '1', limit: '10' };
      const mockUsers = [UserFixtures.createUserResponse()];
      const paginatedResponse = TestHelpers.createPaginatedResponse(mockUsers, 1, 10, 1);
      
      mockUserService.getAllUsers.mockResolvedValue(paginatedResponse);

      // Act
      await controller.getUsers(req, res, next);

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalledWith(1, 10);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: paginatedResponse,
        message: 'Users retrieved successfully',
        timestamp: expect.any(String)
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle default pagination parameters', async () => {
      // Arrange - no query parameters
      const paginatedResponse = TestHelpers.createPaginatedResponse([], 1, 10);
      mockUserService.getAllUsers.mockResolvedValue(paginatedResponse);

      // Act
      await controller.getUsers(req, res, next);

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalledWith(1, 10);
    });

    it('should handle invalid pagination parameters gracefully', async () => {
      // Arrange
      req.query = { page: 'invalid', limit: 'also-invalid' };
      const paginatedResponse = TestHelpers.createPaginatedResponse([]);
      mockUserService.getAllUsers.mockResolvedValue(paginatedResponse);

      // Act
      await controller.getUsers(req, res, next);

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalledWith(1, 10); // Defaults
    });

    it('should call next with error when service fails', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      mockUserService.getAllUsers.mockRejectedValue(serviceError);

      // Act
      await controller.getUsers(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(serviceError);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      // Arrange
      req.params = { id: '123' };
      const mockUser = UserFixtures.createUserResponse({ id: '123' });
      mockUserService.getUserById.mockResolvedValue(mockUser);

      // Act
      await controller.getUser(req, res, next);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'User retrieved successfully',
        timestamp: expect.any(String)
      });
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      req.params = { id: '999' };
      mockUserService.getUserById.mockResolvedValue(null);

      // Act
      await controller.getUser(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User with ID 999 not found'
        },
        timestamp: expect.any(String)
      });
    });

    it('should handle service errors', async () => {
      // Arrange
      req.params = { id: '123' };
      const serviceError = new Error('Service error');
      mockUserService.getUserById.mockRejectedValue(serviceError);

      // Act
      await controller.getUser(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const createRequest = UserFixtures.createCreateUserRequest();
      const createdUser = UserFixtures.createUserResponse();
      req.body = createRequest;
      
      mockUserService.createUser.mockResolvedValue(createdUser);

      // Act
      await controller.createUser(req, res, next);

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(createRequest);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdUser,
        message: 'User created successfully',
        timestamp: expect.any(String)
      });
    });

    it('should handle creation errors', async () => {
      // Arrange
      req.body = UserFixtures.createCreateUserRequest();
      const serviceError = new Error('Email already exists');
      mockUserService.createUser.mockRejectedValue(serviceError);

      // Act
      await controller.createUser(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      req.params = { id: '123' };
      req.body = { name: 'Updated Name' };
      const updatedUser = UserFixtures.createUserResponse({ id: '123', name: 'Updated Name' });
      
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      // Act
      await controller.updateUser(req, res, next);

      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith('123', { name: 'Updated Name' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
        timestamp: expect.any(String)
      });
    });

    it('should return 404 when updating non-existent user', async () => {
      // Arrange
      req.params = { id: '999' };
      req.body = { name: 'Updated Name' };
      mockUserService.updateUser.mockResolvedValue(null);

      // Act
      await controller.updateUser(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User with ID 999 not found'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      req.params = { id: '123' };
      mockUserService.deleteUser.mockResolvedValue(true);

      // Act
      await controller.deleteUser(req, res, next);

      // Assert
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'User deleted successfully',
        timestamp: expect.any(String)
      });
    });

    it('should return 404 when deleting non-existent user', async () => {
      // Arrange
      req.params = { id: '999' };
      mockUserService.deleteUser.mockResolvedValue(false);

      // Act
      await controller.deleteUser(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User with ID 999 not found'
        },
        timestamp: expect.any(String)
      });
    });
  });
});
