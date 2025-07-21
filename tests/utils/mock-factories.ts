import { jest } from '@jest/globals';

export type MockedFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;

export type MockedClass<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? MockedFunction<T[K]>
    : T[K];
};

export function createMockFunction<T extends (...args: any[]) => any>(): MockedFunction<T> {
  return jest.fn<T>() as unknown as MockedFunction<T>;
}

export function createMockService<T extends Record<string, any>>(
  implementation: Partial<T> = {}
): MockedClass<T> {
  const mock = {} as MockedClass<T>;
  
  // Get all keys from the implementation
  for (const key in implementation) {
    if (implementation.hasOwnProperty(key)) {
      const value = implementation[key];
      
      if (value === undefined) {
        continue; // Skip undefined values
      }
      
      if (typeof value === 'function') {
        (mock as any)[key] = jest.fn().mockImplementation(value as (...args: any[]) => any);
      } else {
        (mock as any)[key] = value;
      }
    }
  }
  
  return mock;
}

export function createTypedMock<T>(): MockedClass<T> {
  const mock = {} as MockedClass<T>;
  
  return new Proxy(mock, {
    get(target, prop) {
      if (!(prop in target)) {
        // Create a jest mock for any accessed property that doesn't exist
        (target as any)[prop] = jest.fn();
      }
      return (target as any)[prop];
    }
  });
}

export function createMockWithMethods<T extends Record<string, any>>(
  methods: (keyof T)[],
  implementation: Partial<T> = {}
): MockedClass<T> {
  const mock = {} as MockedClass<T>;
  
  // Create jest.fn() for each required method
  methods.forEach(methodName => {
    const impl = implementation[methodName];
    if (typeof impl === 'function') {
      (mock as any)[methodName] = jest.fn().mockImplementation(impl as (...args: any[]) => any);
    }
    else {
      (mock as any)[methodName] = jest.fn();
    }
  });
  
  // Add any additional non-function properties
  Object.keys(implementation).forEach(key => {
    if (!methods.includes(key as keyof T)) {
      const value = implementation[key];
      if (typeof value !== 'function') {
        (mock as any)[key] = value;
      }
    }
  });
  
  return mock;
}

export function createMockRequest(overrides: any = {}) {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    ...overrides
  };
}

export function createMockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

export function createMockNextFunction() {
  return jest.fn();
}
