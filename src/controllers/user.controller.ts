// controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { userService, IUserService } from '../services/user.service';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '../types/user.types';

export class UserController extends BaseController<
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  IUserService
> {
  constructor(injectedUserService?: IUserService) {
    super(injectedUserService || userService);
  }

  // Implement abstract methods
  protected getEntityName(): string {
    return 'User';
  }

  protected getNotFoundErrorCode(): string {
    return 'USER_NOT_FOUND';
  }

  protected getCollectionSuccessMessage(): string {
    return 'Users retrieved successfully';
  }

  protected getSingleSuccessMessage(): string {
    return 'User retrieved successfully';
  }

  protected getCreateSuccessMessage(): string {
    return 'User created successfully';
  }

  protected getUpdateSuccessMessage(): string {
    return 'User updated successfully';
  }

  protected getDeleteSuccessMessage(): string {
    return 'User deleted successfully';
  }

  // Public interface methods (delegate to base)
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.getAll(req, res, next);
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.getById(req, res, next);
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.create(req, res, next);
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.update(req, res, next);
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.delete(req, res, next);
  }
}

export const userController = new UserController();
