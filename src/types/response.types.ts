// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}

// Error response with details
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Success response wrapper
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];           // Generic items array
  total: number;        // Total count of all items
  page: number;         // Current page number
  limit: number;        // Items per page
  totalPages: number;   // Calculated total pages
  hasNext: boolean;     // Whether there's a next page
  hasPrevious: boolean; // Whether there's a previous page
}

// Union type for all possible responses
export type APIResponseType<T> = SuccessResponse<T> | ErrorResponse;
