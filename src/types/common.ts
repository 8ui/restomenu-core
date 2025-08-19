// Common utility types (unique to shared-core, not from GraphQL)

// Basic scalar types
export type Uuid = string;
export type Phone = string;

export type Optional<T> = T | undefined;
export type Required<T> = T extends Optional<infer U> ? U : T;

// Array utility types
export type NonEmptyArray<T> = [T, ...T[]];
export type ReadonlyArray<T> = readonly T[];

// Object utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// Function utility types
export type AsyncFunction<TArgs extends unknown[], TReturn> = (
  ...args: TArgs
) => Promise<TReturn>;
export type SyncFunction<TArgs extends unknown[], TReturn> = (
  ...args: TArgs
) => TReturn;

// Event utility types
export type EventHandler<TEvent> = (event: TEvent) => void;
export type AsyncEventHandler<TEvent> = (event: TEvent) => Promise<void>;

// API utility types
export type ApiResponse<T> =
  | {
      data: T;
      success: true;
    }
  | {
      error: string;
      success: false;
    };

export type PaginationParams = {
  page?: number;
  limit?: number;
  offset?: number;
};

export type PaginationResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// Form utility types
export type FormField<T> = {
  value: T;
  error?: string;
  touched: boolean;
  valid: boolean;
};

export type FormState<T> = {
  [K in keyof T]: FormField<T[K]>;
} & {
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
};
