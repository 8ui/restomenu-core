import { ENUMS, CONFIG_CONSTANTS } from "../../src/constants";

describe("Constants", () => {
  describe("ENUMS", () => {
    it("should be defined", () => {
      expect(ENUMS).toBeDefined();
      expect(typeof ENUMS).toBe("object");
    });
  });

  describe("CONFIG_CONSTANTS", () => {
    it("should be defined", () => {
      expect(CONFIG_CONSTANTS).toBeDefined();
      expect(typeof CONFIG_CONSTANTS).toBe("object");
    });
  });

  describe("constant immutability", () => {
    it("should not allow modification of constants", () => {
      expect(() => {
        (ENUMS as any).newProperty = "test";
      }).toThrow();

      expect(() => {
        (CONFIG_CONSTANTS as any).newProperty = "test";
      }).toThrow();
    });
  });
});
