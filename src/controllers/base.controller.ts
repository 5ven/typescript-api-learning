import { Request, Response, NextFunction } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/response.types';

// Generic interfaces for our base controller
export interface BaseService<TResponse, TCreateRequest, TUpdateRequest> {
  getById(id: string): Promise<TResponse | null>;
  getAll(page: number, limit: number): Promise<PaginatedResponse<TResponse>>;
  create(data: TCreateRequest): Promise<TResponse>;
  update(id: string, updates: TUpdateRequest): Promise<TResponse | null>;
  delete(id: string): Promise<boolean>;
}

export abstract class BaseController<
  TResponse,
  TCreateRequest,
  TUpdateRequest,
  TService extends BaseService<TResponse, TCreateRequest, TUpdateRequest>
> {
  protected service: TService;

  constructor(service: TService) {
    this.service = service;
  }

  // Abstract methods for entity-specific behavior
  protected abstract getEntityName(): string;
  protected abstract getNotFoundErrorCode(): string;
  protected abstract getCollectionSuccessMessage(): string;
  protected abstract getSingleSuccessMessage(): string;
  protected abstract getCreateSuccessMessage(): string;
  protected abstract getUpdateSuccessMessage(): string;
  protected abstract getDeleteSuccessMessage(): string;

  // Common pagination parsing
  protected parsePaginationParams(req: Request): { page: number; limit: number } {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    return { page, limit };
  }

  // Common error response formatting
  protected sendNotFoundError(res: Response, id: string): void {
    res.status(404).json({
      success: false,
      error: {
        code: this.getNotFoundErrorCode(),
        message: `${this.getEntityName()} with ID ${id} not found`
      },
      timestamp: new Date().toISOString()
    });
  }

  // Common success response formatting
  protected sendSuccessResponse<T>(
    res: Response, 
    data: T, 
    message: string, 
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };

    res.status(statusCode).json(response);
  }

  // CRUD operations
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = this.parsePaginationParams(req);
      const paginatedData = await this.service.getAll(page, limit);
      
      this.sendSuccessResponse(
        res, 
        paginatedData, 
        this.getCollectionSuccessMessage()
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const entity = await this.service.getById(id);

      if (!entity) {
        this.sendNotFoundError(res, id);
        return;
      }

      this.sendSuccessResponse(res, entity, this.getSingleSuccessMessage());
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: TCreateRequest = req.body;
      const newEntity = await this.service.create(data);

      this.sendSuccessResponse(
        res, 
        newEntity, 
        this.getCreateSuccessMessage(), 
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates: TUpdateRequest = req.body;

      const updatedEntity = await this.service.update(id, updates);

      if (!updatedEntity) {
        this.sendNotFoundError(res, id);
        return;
      }

      this.sendSuccessResponse(res, updatedEntity, this.getUpdateSuccessMessage());
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.service.delete(id);

      if (!deleted) {
        this.sendNotFoundError(res, id);
        return;
      }

      this.sendSuccessResponse(res, null, this.getDeleteSuccessMessage());
    } catch (error) {
      next(error);
    }
  }
}
