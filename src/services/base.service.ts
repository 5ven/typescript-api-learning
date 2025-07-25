import { PaginatedResponse } from '../types/response.types';
import { PaginationUtils } from '../utils/pagination.util';

// Generic types for our base service
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRequest {
  [key: string]: any;
}

export interface UpdateRequest {
  [key: string]: any;
}

export abstract class BaseService<
  TEntity extends BaseEntity,
  TResponse,
  TCreateRequest extends CreateRequest,
  TUpdateRequest extends UpdateRequest
> {
  protected storage: Map<string, TEntity> = new Map();
  protected nextId = 1;

  constructor() {
    this.seedData();
  }

  // Abstract methods - each service implements these
  protected abstract seedData(): void;
  protected abstract toResponse(entity: TEntity): TResponse;
  protected abstract validateUniqueness(data: TCreateRequest): Promise<void>;
  protected abstract validateUpdateUniqueness(id: string, updates: TUpdateRequest): Promise<void>;
  protected abstract createEntityFromRequest(data: TCreateRequest): TEntity;

  // Common CRUD operations
  async getById(id: string): Promise<TResponse | null> {
    const entity = this.storage.get(id);
    return entity ? this.toResponse(entity) : null;
  }

  async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<TResponse>> {
    const params = PaginationUtils.validateParams({ page, limit });
    
    const allEntities = Array.from(this.storage.values());
    const responses = allEntities.map(entity => this.toResponse(entity));
    
    return PaginationUtils.paginate(responses, params.page, params.limit);
  }

  async create(data: TCreateRequest): Promise<TResponse> {
    // Validate uniqueness
    await this.validateUniqueness(data);

    // Create the entity
    const newEntity = this.createEntityFromRequest(data);
    
    // Store it
    this.storage.set(newEntity.id, newEntity);
    this.nextId++;

    return this.toResponse(newEntity);
  }

  async update(id: string, updates: TUpdateRequest): Promise<TResponse | null> {
    const existingEntity = this.storage.get(id);
    
    if (!existingEntity) {
      return null;
    }

    // Validate uniqueness for updates
    await this.validateUpdateUniqueness(id, updates);

    // Update the entity
    const updatedEntity: TEntity = {
      ...existingEntity,
      ...updates,
      updatedAt: new Date()
    } as TEntity;

    this.storage.set(id, updatedEntity);
    return this.toResponse(updatedEntity);
  }

  async delete(id: string): Promise<boolean> {
    return this.storage.delete(id);
  }

  get totalCount(): number {
    return this.storage.size;
  }

  // Helper method for generating IDs
  protected generateId(): string {
    return this.nextId.toString();
  }
}
