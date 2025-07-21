import { expect } from '@jest/globals';
import { PaginatedResponse } from '../../src/types/response.types';

export class TestHelpers {
  /**
   * Create a mock paginated response
   */
  static createPaginatedResponse<T>(
    items: T[],
    page: number = 1,
    limit: number = 10,
    total?: number
  ): PaginatedResponse<T> {
    const actualTotal = total ?? items.length;
    const totalPages = Math.ceil(actualTotal / limit);
    
    return {
      items,
      total: actualTotal,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };
  }

  /**
   * Create a promise that resolves after a delay (for async testing)
   */
  static delay(ms: number = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Assert that an object matches a partial shape
   */
  static expectPartialMatch<T>(actual: T, expected: Partial<T>): void {
    Object.keys(expected).forEach(key => {
      expect(actual[key as keyof T]).toEqual(expected[key as keyof T]);
    });
  }

  /**
   * Create a matcher for error testing
   */
  static expectErrorWithMessage(error: Error, expectedMessage: string): void {
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(expectedMessage);
  }
}
