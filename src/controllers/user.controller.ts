import { Request, Response, NextFunction } from 'express';
import { userService, IUserService } from '../services/user.service';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '../types/user.types';
import { ApiResponse, PaginatedResponse } from '../types/response.types';

export class UserController {
  private userService: IUserService;

  constructor(injectedUserService?: IUserService) {
    this.userService = injectedUserService || userService; // Use injected or default to singleton
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // Cap at 100

      const paginatedUsers = await this.userService.getAllUsers(page, limit);

      const response: ApiResponse<PaginatedResponse<UserResponse>> = {
        success: true,
        data: paginatedUsers,  // Contains items, total, page, limit, etc.
        message: 'Users retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: `User with ID ${id} not found`
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const response: ApiResponse<UserResponse> = {
        success: true,
        data: user,
        message: 'User retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      const newUser = await this.userService.createUser(userData);

      const response: ApiResponse<UserResponse> = {
        success: true,
        data: newUser,
        message: 'User created successfully',
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates: UpdateUserRequest = req.body;
      
      const updatedUser = await this.userService.updateUser(id, updates);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: `User with ID ${id} not found`
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: `User with ID ${id} not found`
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: null,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
