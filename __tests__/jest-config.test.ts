import { testConfig } from "./setup";

describe("Jest Configuration", () => {
  it("should have proper test environment setup", () => {
    expect(global.performance).toBeDefined();
    expect(global.performance.now).toBeInstanceOf(Function);
  });

  it("should have test configuration available", () => {
    expect(testConfig).toBeDefined();
    expect(typeof testConfig.enableMockConsole).toBe("boolean");
    expect(typeof testConfig.enablePerformanceTracking).toBe("boolean");
    expect(typeof testConfig.slowTestThreshold).toBe("number");
  });

  it("should have custom Jest matchers available", () => {
    const mockGraphQLQuery = {
      kind: "Document",
      definitions: [
        {
          kind: "OperationDefinition",
          operation: "query",
        },
      ],
    };

    expect(mockGraphQLQuery).toBeGraphQLQuery();
  });

  it("should have mocked browser APIs", () => {
    expect(global.localStorage).toBeDefined();
    expect(global.sessionStorage).toBeDefined();
    expect(global.IntersectionObserver).toBeDefined();
    expect(global.ResizeObserver).toBeDefined();
  });

  it("should handle fetch mocking", () => {
    expect(global.fetch).toBeDefined();
    expect(typeof global.fetch).toBe("function");
  });
});
