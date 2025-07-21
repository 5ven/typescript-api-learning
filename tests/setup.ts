import { jest, beforeAll, afterAll, expect } from '@jest/globals';

// Mock console methods in tests (optional)
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console.error in tests unless explicitly testing error logging
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test timeout
jest.setTimeout(10000);

// Add custom matchers if needed
expect.extend({
  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    return {
      message: () => `expected ${received} to be a valid Date`,
      pass,
    };
  },
});

// Declare the custom matcher for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
    }
  }
}
