// ====================================================================
// JEST SETUP - Test environment configuration
// ====================================================================

import "@testing-library/jest-dom";

// Enhanced console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress Apollo Client warnings in tests
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Apollo Client") ||
        args[0].includes("Warning:") ||
        args[0].includes("act()") ||
        args[0].includes("React Router") ||
        args[0].includes("validateDOMNesting"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    // Suppress React warnings in tests
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning:") ||
        args[0].includes("React") ||
        args[0].includes("act()") ||
        args[0].includes("componentWillMount") ||
        args[0].includes("componentWillReceiveProps"))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  // Optionally suppress console.log in tests for cleaner output
  if (process.env.SUPPRESS_CONSOLE_LOG === "true") {
    console.log = () => {};
  }
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  console.log = originalLog;
});

// Enhanced environment setup
beforeEach(() => {
  // Clear all timers before each test
  jest.clearAllTimers();

  // Reset any module mocks
  jest.clearAllMocks();

  // Clear local storage
  if (global.localStorage) {
    global.localStorage.clear();
  }

  // Clear session storage
  if (global.sessionStorage) {
    global.sessionStorage.clear();
  }
});

// Mock performance API for Node environment
if (typeof performance === "undefined") {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    getEntriesByType: () => [],
    clearMarks: () => {},
    clearMeasures: () => {},
  } as any;
}

// Mock requestAnimationFrame
if (typeof requestAnimationFrame === "undefined") {
  global.requestAnimationFrame = (cb: FrameRequestCallback) => {
    return setTimeout(cb, 16);
  };
}

if (typeof cancelAnimationFrame === "undefined") {
  global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock fetch for tests that might need it
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Setup default test timeout with environment variable override
const defaultTimeout = process.env.JEST_TIMEOUT
  ? parseInt(process.env.JEST_TIMEOUT)
  : 10000;
jest.setTimeout(defaultTimeout);

// Global test configuration
const testConfig = {
  enableMockConsole: process.env.MOCK_CONSOLE !== "false",
  enablePerformanceTracking: process.env.TRACK_PERFORMANCE === "true",
  slowTestThreshold: parseInt(process.env.SLOW_TEST_THRESHOLD || "1000"),
};

// Performance tracking for slow tests
if (testConfig.enablePerformanceTracking) {
  let testStartTime: number;

  beforeEach(() => {
    testStartTime = performance.now();
  });

  afterEach(() => {
    const testDuration = performance.now() - testStartTime;
    if (testDuration > testConfig.slowTestThreshold) {
      console.warn(
        `⚠️  Slow test detected: ${expect.getState().currentTestName} took ${testDuration.toFixed(2)}ms`
      );
    }
  });
}

// Custom matchers for Apollo Client testing
expect.extend({
  toBeGraphQLQuery(received: any) {
    const pass =
      received &&
      received.kind === "Document" &&
      received.definitions &&
      received.definitions[0] &&
      received.definitions[0].operation === "query";

    if (pass) {
      return {
        message: () => `Expected ${received} not to be a GraphQL query`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a GraphQL query`,
        pass: false,
      };
    }
  },

  toBeGraphQLMutation(received: any) {
    const pass =
      received &&
      received.kind === "Document" &&
      received.definitions &&
      received.definitions[0] &&
      received.definitions[0].operation === "mutation";

    if (pass) {
      return {
        message: () => `Expected ${received} not to be a GraphQL mutation`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a GraphQL mutation`,
        pass: false,
      };
    }
  },

  toBeGraphQLFragment(received: any) {
    const pass =
      received &&
      received.kind === "Document" &&
      received.definitions &&
      received.definitions[0] &&
      received.definitions[0].kind === "FragmentDefinition";

    if (pass) {
      return {
        message: () => `Expected ${received} not to be a GraphQL fragment`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a GraphQL fragment`,
        pass: false,
      };
    }
  },

  toBeValidPrice(received: any) {
    const price =
      typeof received === "string" ? parseFloat(received) : received;
    const pass = typeof price === "number" && !isNaN(price) && price >= 0;

    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid price`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected ${received} to be a valid price (non-negative number)`,
        pass: false,
      };
    }
  },

  toHaveGraphQLError(received: any, expectedMessage?: string) {
    const hasError = received?.error || received?.errors?.length > 0;

    if (!hasError) {
      return {
        message: () => `Expected response to have GraphQL error`,
        pass: false,
      };
    }

    if (expectedMessage) {
      const errorMessage =
        received.error?.message || received.errors?.[0]?.message;
      const messageMatches = errorMessage?.includes(expectedMessage);

      if (!messageMatches) {
        return {
          message: () =>
            `Expected error message to contain "${expectedMessage}", but got "${errorMessage}"`,
          pass: false,
        };
      }
    }

    return {
      message: () => `Expected response not to have GraphQL error`,
      pass: true,
    };
  },

  toBeValidUuid(received: any) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = typeof received === "string" && uuidRegex.test(received);

    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
});

// Extend Jest matchers type definitions
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeGraphQLQuery(): R;
      toBeGraphQLMutation(): R;
      toBeGraphQLFragment(): R;
      toBeValidPrice(): R;
      toHaveGraphQLError(expectedMessage?: string): R;
      toBeValidUuid(): R;
    }
  }
}

// Export test configuration for other test files
export { testConfig };
