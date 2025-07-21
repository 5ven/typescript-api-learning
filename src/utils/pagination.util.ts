import { PaginatedResponse } from '../types/response.types';

export interface PaginationParams {
  page: number;
  limit: number;
  maxLimit?: number;
}

export class PaginationUtils {
  /**
   * Validates and normalizes pagination parameters
   */
  static validateParams({ page, limit, maxLimit = 100 }: PaginationParams): PaginationParams {
    return {
      page: Math.max(1, page), // Minimum page 1
      limit: Math.min(Math.max(1, limit), maxLimit), // Between 1 and maxLimit
      maxLimit
    };
  }

  /**
   * Creates a paginated response from an array of items
   */
  static paginate<T>(
    allItems: T[],
    page: number,
    limit: number
  ): PaginatedResponse<T> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = allItems.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allItems.length / limit);

    return {
      items,
      total: allItems.length,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };
  }

  /**
   * Creates pagination metadata without slicing data (for database queries)
   */
  static createMetadata(
    total: number,
    page: number,
    limit: number
  ): Omit<PaginatedResponse<any>, 'items'> {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };
  }
}
