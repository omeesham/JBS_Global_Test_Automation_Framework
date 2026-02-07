/**
 * FILE: src/api/models/api-response.ts
 * PURPOSE: TypeScript interfaces for API responses
 * WHY NECESSARY: Type safety for API calls
 * USED BY: API clients, API tests
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  createdAt: string;
}
