import {
  required,
  minLength,
  maxLength,
  email,
  isNumeric,
  step,
  min,
  max,
  pattern,
  url,
  date,
  time,
  datetime,
  file,
  ValidationRule,
} from "../rules.js";

import { setLocale } from "../localization.js";
import { AsyncValidationRule, combineRules } from "../index.js";

describe("Validation Rules", () => {
  beforeEach(() => {
    setLocale("en"); // Reset to English before each test
  });

  test("should return error for empty values", () => {
    const requiredRule = required();
    expect(requiredRule("")).toBe("This field is required."); // Empty string
    expect(requiredRule(null)).toBe("This field is required."); // Null
    expect(requiredRule(undefined)).toBe("This field is required."); // Undefined
  });

  test("should allow non-empty values", () => {
    const requiredRule = required();
    expect(requiredRule("hello")).toBe(null); // Non-empty string is valid
    expect(requiredRule(0)).toBe(null); // 0 is a valid number
    expect(requiredRule(false)).toBe(null); // Boolean `false` is valid
    expect(requiredRule([])).toBe(null); // Empty array is considered valid
    expect(requiredRule({})).toBe(null); // Empty object is considered valid
  });

  test("minLength rule", () => {
    expect(minLength(5)("abc")).toBe("Must be at least 5 characters.");
    expect(minLength(5)("abcdef")).toBeNull();
  });

  test("should ignore empty values for minLength", () => {
    const minLengthRule = minLength(5);
    expect(minLengthRule("")).toBe(null);
    expect(minLengthRule(null)).toBe(null);
    expect(minLengthRule(undefined)).toBe(null);
  });

  test("should not treat boolean values as empty for minLength", () => {
    const minLengthRule = minLength(5);
    expect(minLengthRule(true)).toBe(null);
    expect(minLengthRule(false)).toBe(null);
  });

  test("maxLength rule", () => {
    expect(maxLength(10)("abcdefghijk")).toBe("Must be at most 10 characters.");
    expect(maxLength(10)("abc")).toBeNull();
  });

  test("should ignore empty values for maxLength", () => {
    const maxLengthRule = maxLength(5);
    expect(maxLengthRule("")).toBe(null);
    expect(maxLengthRule(null)).toBe(null);
    expect(maxLengthRule(undefined)).toBe(null);
  });

  test("should not treat boolean values as empty for maxLength", () => {
    const maxLengthRule = maxLength(5);
    expect(maxLengthRule(true)).toBe(null);
    expect(maxLengthRule(false)).toBe(null);
  });

  test("email rule", () => {
    expect(email()("invalid-email")).toBe("Invalid email format.");
    expect(email()("test@example.com")).toBeNull();
  });

  test("email rule", () => {
    expect(email()("invalid-email")).toBe("Invalid email format.");
    expect(email()("")).toBeNull();
  });

  test("should ignore empty values for email", () => {
    expect(email()("")).toBe(null);
    expect(email()(null)).toBe(null);
    expect(email()(undefined)).toBe(null);
  });

  test("should not treat boolean values as empty for email", () => {
    expect(email()(true)).toBe(null);
    expect(email()(false)).toBe(null);
  });

  test("min rule", () => {
    expect(min(5)("3")).toBe("Must be at least 5.");
    expect(min(5)("5")).toBeNull();
    expect(min(5)("10")).toBeNull();
  });

  test("should ignore empty values for min", () => {
    expect(min(5)("")).toBe(null);
    expect(min(5)(null)).toBe(null);
    expect(min(5)(undefined)).toBe(null);
  });

  test("should not treat boolean values as empty for min", () => {
    expect(min(5)(true)).toBe(null);
    expect(min(5)(false)).toBe(null);
  });

  test("max rule", () => {
    expect(max(10)("15")).toBe("Must be at most 10.");
    expect(max(10)("10")).toBeNull();
    expect(max(10)("5")).toBeNull();
  });

  test("should ignore empty values for max", () => {
    expect(max(5)("")).toBe(null);
    expect(max(5)(null)).toBe(null);
    expect(max(5)(undefined)).toBe(null);
  });

  test("should not treat boolean values as empty for max", () => {
    expect(max(5)(true)).toBe(null);
    expect(max(5)(false)).toBe(null);
  });

  test("isNumeric rule", () => {
    expect(isNumeric()("abc")).toBe("Must be a number.");
    expect(isNumeric()("123")).toBeNull();
    expect(isNumeric()("12.34")).toBeNull();
  });

  test("should ignore empty values for isNumeric", () => {
    expect(isNumeric()("")).toBe(null);
    expect(isNumeric()(null)).toBe(null);
    expect(isNumeric()(undefined)).toBe(null);
  });

  test("should not treat boolean values as empty for isNumeric", () => {
    expect(isNumeric()(true)).toBe("Must be a number.");
    expect(isNumeric()(false)).toBe("Must be a number.");
  });

  test("should not trigger step validation for empty values", () => {
    const stepRule = step(3);
    expect(stepRule("")).toBe(null); // Empty value should be ignored
    expect(stepRule(null)).toBe(null); // Null should be ignored
    expect(stepRule(undefined)).toBe(null); // Undefined should be ignored
  });

  test("should return error for non-numeric input", () => {
    const stepRule = step(3);
    expect(stepRule("abc")).toBe("Must be a number."); // Invalid string
    expect(stepRule("3a")).toBe("Must be a number."); // Mixed invalid characters
    expect(stepRule(" ")).toBe("Must be a number."); // Whitespace should be invalid
  });

  test("should return error for numbers not multiple of step value", () => {
    const stepRule = step(3);
    expect(stepRule("4")).toBe("Must be a multiple of 3."); // 4 is not a multiple of 3
    expect(stepRule("7")).toBe("Must be a multiple of 3."); // 7 is not a multiple of 3
  });

  test("should pass for valid multiples of step value", () => {
    const stepRule = step(3);
    expect(stepRule("3")).toBe(null); // 3 is a multiple of 3
    expect(stepRule("6")).toBe(null); // 6 is a multiple of 3
    expect(stepRule("9")).toBe(null); // 9 is a multiple of 3
  });

  test("should correctly handle negative numbers", () => {
    const stepRule = step(3);
    expect(stepRule("-3")).toBe(null); // -3 is a multiple of 3
    expect(stepRule("-6")).toBe(null); // -6 is a multiple of 3
    expect(stepRule("-4")).toBe("Must be a multiple of 3."); // -4 is not a multiple of 3
  });

  test("should correctly handle decimal numbers", () => {
    const stepRule = step(3);
    expect(stepRule("3.5")).toBe("Must be a multiple of 3."); // 3.5 is not valid
    expect(stepRule("6.0")).toBe(null); // 6.0 should be valid
    expect(stepRule("9.1")).toBe("Must be a multiple of 3."); // 9.1 is not valid
  });

  test("should return error for boolean values", () => {
    const stepRule = step(3);
    expect(stepRule(true)).toBe("Must be a number."); // true is not a number
    expect(stepRule(false)).toBe("Must be a number."); // false is not a number
  });

  test("should return null for matching pattern", () => {
    const regexRule = pattern(/^\d{3}-\d{2}-\d{4}$/); // Example: Social Security Number format
    expect(regexRule("123-45-6789")).toBeNull();
  });

  test("should return error message for non-matching pattern", () => {
    const regexRule = pattern(/^\d{3}-\d{2}-\d{4}$/);
    expect(regexRule("abc-12-3456")).toBe("Invalid format.");
  });

  test("should handle empty string input", () => {
    const regexRule = pattern(/^\d{3}-\d{2}-\d{4}$/);
    expect(regexRule("")).toBeNull();
    expect(regexRule(undefined)).toBeNull();
    expect(regexRule(null)).toBeNull();
  });

  test("should handle non-string input", () => {
    const regexRule = pattern(/^\d{3}-\d{2}-\d{4}$/);
    expect(regexRule(12345)).toBe("Invalid format.");
  });

  test("should return null for valid URLs", () => {
    const urlRule = url();
    expect(urlRule("https://example.com")).toBeNull();
    expect(urlRule("http://example.com")).toBeNull();
    expect(urlRule("http://example.com/path")).toBeNull();
    expect(urlRule("http://example.com/path?query=string")).toBeNull();
  });

  test("should return error for invalid URLs", () => {
    const urlRule = url();
    expect(urlRule("ftp://example.com")).toBe("Invalid URL.");
    expect(urlRule("http://example.com/path#fragment")).toBe("Invalid URL.");
  });

  test("should handle empty string input for URL", () => {
    const urlRule = url();
    expect(urlRule("")).toBeNull();
    expect(urlRule(undefined)).toBeNull();
    expect(urlRule(null)).toBeNull();
  });

  test("should handle non-string input for URL", () => {
    const urlRule = url();
    expect(urlRule(12345)).toBe("Invalid URL.");
  });

  test("should return null for valid dates", () => {
    const dateRule = date();
    expect(dateRule("2021-01-01")).toBeNull();
    expect(dateRule("2021-12-31")).toBeNull();
  });

  test("should return error for invalid dates", () => {
    const dateRule = date();
    expect(dateRule("2021-02-30")).toBe("Invalid date.");
    expect(dateRule("2021-13-01")).toBe("Invalid date.");
    expect(dateRule("2021-12-32")).toBe("Invalid date.");
  });

  test("should handle empty string input for date", () => {
    const dateRule = date();
    expect(dateRule("")).toBeNull();
    expect(dateRule(undefined)).toBeNull();
    expect(dateRule(null)).toBeNull();
  });

  test("should handle non-string input for date", () => {
    const dateRule = date();
    expect(dateRule(12345)).toBe("Invalid date.");
  });

  test("should return null for valid time", () => {
    const timeRule = time();
    expect(timeRule("00:00")).toBeNull();
    expect(timeRule("23:59")).toBeNull();
  });

  test("should return error for invalid time", () => {
    const timeRule = time();
    expect(timeRule("24:00")).toBe("Invalid time.");
    expect(timeRule("12:60")).toBe("Invalid time.");
    expect(timeRule("12:34:56")).toBe("Invalid time.");
  });

  test("should handle empty string input for time", () => {
    const timeRule = time();
    expect(timeRule("")).toBeNull();
    expect(timeRule(undefined)).toBeNull();
    expect(timeRule(null)).toBeNull();
  });

  test("should handle non-string input for time", () => {
    const timeRule = time();
    expect(timeRule(12345)).toBe("Invalid time.");
  });

  test("should return null for valid datetime", () => {
    const datetimeRule = datetime();
    expect(datetimeRule("2021-01-01T00:00")).toBeNull();
    expect(datetimeRule("2021-12-31T23:59")).toBeNull();
  });

  test("should return error for invalid datetime", () => {
    const datetimeRule = datetime();
    expect(datetimeRule("2021-02-30T12:34")).toBe("Invalid date/time.");
    expect(datetimeRule("2021-13-01T12:34")).toBe("Invalid date/time.");
    expect(datetimeRule("2021-12-32T12:34")).toBe("Invalid date/time.");
    expect(datetimeRule("2021-12-31T24:00")).toBe("Invalid date/time.");
    expect(datetimeRule("2021-12-31T12:60")).toBe("Invalid date/time.");
    expect(datetimeRule("2021-12-31T12:34:56")).toBe("Invalid date/time.");
  });

  test("should handle empty string input for datetime", () => {
    const datetimeRule = datetime();
    expect(datetimeRule("")).toBeNull();
    expect(datetimeRule(undefined)).toBeNull();
    expect(datetimeRule(null)).toBeNull();
  });

  test("should handle non-string input for datetime", () => {
    const datetimeRule = datetime();
    expect(datetimeRule(12345)).toBe("Invalid date/time.");
  });

  test("should allow valid file types", () => {
    const fileRule = file(["image/png", "image/jpeg", "application/pdf"]);
    expect(fileRule("image/png")).toBe(null);
    expect(fileRule("image/jpeg")).toBe(null);
    expect(fileRule("application/pdf")).toBe(null);
  });

  test("should return an error for invalid file types", () => {
    const fileRule = file(["image/png", "image/jpeg"]);
    expect(fileRule("application/pdf")).toBe("Invalid file type."); // Not allowed
    expect(fileRule("text/plain")).toBe("Invalid file type."); // Not allowed
  });

  test("should not validate empty values", () => {
    const fileRule = file(["image/png", "image/jpeg"]);
    expect(fileRule("")).toBe(null);
    expect(fileRule(null)).toBe(null);
    expect(fileRule(undefined)).toBe(null);
  });

  test("should not treat boolean values as files", () => {
    const fileRule = file(["image/png", "image/jpeg"]);
    expect(fileRule(true)).toBe("Invalid file type."); // Should be ignored
    expect(fileRule(false)).toBe("Invalid file type."); // Should be ignored
  });

  it("should return null if all sync rules pass", () => {
    const rule1: ValidationRule = (value) => (value ? null : "Required");
    const rule2: ValidationRule = (value) =>
      typeof value === "string" ? null : "Must be a string";

    const combined = combineRules([rule1, rule2]);
    expect(combined("hello")).toBeNull();
  });

  it("should return the first sync validation error", () => {
    const rule1: ValidationRule = (value) => (value ? null : "Required");
    const rule2: ValidationRule = (value) =>
      typeof value === "string" ? null : "Must be a string";

    const combined = combineRules([rule1, rule2]);
    expect(combined("")).toBe("Required");
  });

  it("should return null if all async rules pass", async () => {
    const rule1: AsyncValidationRule = async (value) =>
      value ? null : "Required";
    const rule2: AsyncValidationRule = async (value) =>
      typeof value === "string" ? null : "Must be a string";

    const combined = combineRules([rule1, rule2]);
    await expect(combined("hello")).resolves.toBeNull();
  });

  it("should return the first async validation error", async () => {
    const rule1: AsyncValidationRule = async (value) =>
      value ? null : "Required";
    const rule2: AsyncValidationRule = async (value) =>
      typeof value === "string" ? null : "Must be a string";

    const combined = combineRules([rule1, rule2]);
    await expect(combined("")).resolves.toBe("Required");
  });

  it("should work with mixed sync and async rules", async () => {
    const rule1: ValidationRule = (value) => (value ? null : "Required");
    const rule2: AsyncValidationRule = async (value) =>
      typeof value === "string" ? null : "Must be a string";

    const combined = combineRules([
      async (value) => rule1(value), // Wrap sync rule in async
      rule2,
    ]);
    await expect(combined("hello")).resolves.toBeNull();
    await expect(combined(123)).resolves.toBe("Must be a string");
  });
});
