/** Shared TypeScript interfaces for API responses (response formats) */

/**
 * Generic API response wrapper
 * Most APIs return this structure for consistency
 * 
 * @template T - The data type being returned
 * 
 * @example Success response
 * const response: ApiResponse<User> = {
 *   success: true,
 *   data: { id: '123', username: 'john' },
 *   message: 'User retrieved successfully'
 * };
 * 
 * @example Error response
 * const response: ApiResponse = {
 *   success: false,
 *   error: { code: 'AUTH_FAILED', message: 'Invalid credentials' }
 * };
 */
export interface ApiResponse<T = any> {
  /** Request succeeded (true) or failed (false) */
  success: boolean;
  
  /** Response data (only present on success) */
  data?: T;
  
  /** Error details (only present on failure) */
  error?: ApiError;
  
  /** Human-readable message from server */
  message?: string;
  
  /** Server timestamp (ISO 8601 format: 2026-02-08T14:30:00Z) */
  timestamp?: string;
}

/**
 * Error details interface
 * Standard format for API errors
 * 
 * @example Validation error
 * const error: ApiError = {
 *   code: 'VALIDATION_ERROR',
 *   message: 'Invalid email format',
 *   details: { field: 'email', value: 'not-an-email' }
 * };
 */
export interface ApiError {
  /** Error code (e.g., 'AUTH_FAILED', 'VALIDATION_ERROR', 'NOT_FOUND') */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Additional error details (varies by error type) */
  details?: Record<string, any>;
}

/**
 * Paginated response interface
 * Used when API returns list of items with pagination
 * 
 * @template T - The item type in the list
 * 
 * @example Contact list response
 * const response: PaginatedResponse<Contact> = {
 *   items: [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }],
 *   total: 156,
 *   page: 1,
 *   pageSize: 20,
 *   hasMore: true
 * };
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  items: T[];
  
  /** Total count across all pages */
  total: number;
  
  /** Current page number (1-based) */
  page: number;
  
  /** Number of items per page */
  pageSize: number;
  
  /** True if more pages available, false if this is the last page */
  hasMore: boolean;
}

/**
 * User interface
 * Standard user object returned by authentication and user endpoints
 * 
 * @example User from login response
 * const user: User = {
 *   id: 'usr_123456',
 *   username: 'john_doe',
 *   email: 'john@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   roles: ['user', 'admin'],
 *   createdAt: '2025-01-15T10:30:00Z'
 * };
 */
export interface User {
  /** Unique user ID (database primary key) */
  id: string;
  
  /** Username (unique, used for login) */
  username: string;
  
  /** Email address (unique) */
  email: string;
  
  /** First name (optional) */
  firstName?: string;
  
  /** Last name (optional) */
  lastName?: string;
  
  /** User roles (e.g., ['user', 'admin', 'manager']) */
  roles: string[];
  
  /** Account creation timestamp (ISO 8601) */
  createdAt: string;
}
