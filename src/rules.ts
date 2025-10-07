import { parse, isValid } from "date-fns";
import { isAsyncFunction } from "./helpers.js";
import { getMessage } from "./localization.js";
import {
  ValidationRule,
  AsyncValidationRule,
  SyncValidationRule,
} from "./types.js";

export function required(): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "") {
      return getMessage("required", {}, language); // Handles null, undefined, or empty string values as "missing"
    }
    return null;
  };
}

export function requiredIf<T>(
  condition: (values: T) => boolean,
  message?: string
): SyncValidationRule;

export function requiredIf<T>(
  condition: (values: T) => Promise<boolean>,
  message?: string
): AsyncValidationRule;

export function requiredIf<T>(
  condition: ((values: T) => boolean) | ((values: T) => Promise<boolean>),
  message?: string
): ValidationRule {
  const rule: ValidationRule = ((
    value: any,
    language?: string,
    field?: string,
    values?: T
  ) => {
    const result = condition(values as T);

    if (result instanceof Promise) {
      return result.then((shouldRequire) =>
        shouldRequire && !value ? message || "This field is required" : null
      );
    }

    const shouldRequire = result as boolean;
    return shouldRequire && !value ? message || "This field is required" : null;
  }) as ValidationRule;

  return rule;
}

export function minLength(length: number): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "" || typeof value === "boolean")
      return null;
    return typeof value === "string" && value.length >= length
      ? null
      : getMessage("minLength", { min: length }, language);
  };
}

export function maxLength(length: number): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "" || typeof value === "boolean")
      return null; // Ignore empty values
    return typeof value === "string" && value.length <= length
      ? null
      : getMessage("maxLength", { max: length }, language);
  };
}

export function email(): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "" || typeof value === "boolean")
      return null; // Ignore empty values
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
      ? null
      : getMessage("email", {}, language);
  };
}

export function isNumeric(): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "") return null; // Ignore empty values
    if (typeof value === "boolean") {
      return getMessage("isNumeric", {}, language);
    }
    return !isNaN(Number(value)) ? null : getMessage("isNumeric", {}, language);
  };
}

export function min(minValue: number): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "" || typeof value === "boolean")
      return null; // Ignore empty values
    return Number(value) >= minValue
      ? null
      : getMessage("min", { min: minValue }, language);
  };
}

export function max(maxValue: number): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "" || typeof value === "boolean")
      return null; // Ignore empty values
    return Number(value) <= maxValue
      ? null
      : getMessage("max", { max: maxValue }, language);
  };
}

export function step(stepValue: number): SyncValidationRule {
  return function (value: number | string, language?: string): string | null {
    // First check if the value is required
    if (value === null || value === undefined || value === "") {
      return null; // Don't enforce required inside step
    }

    // Reject whitespace-only strings
    if (typeof value === "string" && value.trim() === "") {
      return getMessage("isNumeric", {}, language); // Treat whitespace as invalid
    }

    // Now check if the value is numeric and divisible by the step value
    const numValue = Number(value);
    if (isNaN(numValue) || typeof value === "boolean") {
      return getMessage("isNumeric", {}, language); // Handle non-numeric values
    }

    // Check if the value is a valid multiple of stepValue
    return numValue % stepValue === 0
      ? null
      : getMessage("step", { step: stepValue }, language); // Handle non-multiples of stepValue
  };
}

export function pattern(regex: RegExp): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "") return null; // Ignore empty values
    return regex.test(value) ? null : getMessage("pattern", {}, language);
  };
}

export function url(requireHttps: boolean = false): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "") return null;
    if (typeof value !== "string") return getMessage("url", {}, language);

    const regex = requireHttps
      ? /^https:\/\/([\w-]+(\.[\w-]+)+)(\/[\w-.]*)*(\?.*)?$/
      : /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-.]*)*(\?.*)?$/;

    return regex.test(value) ? null : getMessage("url", {}, language);
  };
}

export function date(format: string = "yyyy-MM-dd"): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "") return null; // Ignore empty values
    if (typeof value !== "string") return getMessage("date", {}, language);

    const parsedDate = parse(value, format, new Date());
    if (!isValid(parsedDate)) return getMessage("date", {}, language);

    return null; // ✅ Valid date
  };
}

export function time(): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "") return null; // Ignore empty values
    if (typeof value !== "string") {
      return getMessage("time", {}, language);
    }

    // Regex for valid time format HH:mm
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;

    // Check if the value matches the time format
    if (!timeRegex.test(value)) {
      return getMessage("time", {}, language);
    }

    // Check if the time is within valid bounds
    const [hours, minutes] = value.split(":").map(Number);

    // Ensure the hour is between 00 and 23 and minute is between 00 and 59
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return getMessage("time", {}, language);
    }

    return null; // ✅ Valid time
  };
}

export function datetime(
  format: string = "yyyy-MM-dd'T'HH:mm"
): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "") return null;
    if (typeof value !== "string") return getMessage("datetime", {}, language);

    const parsedDate = parse(value, format, new Date());
    if (!isValid(parsedDate)) return getMessage("datetime", {}, language);

    return null;
  };
}

export function file(allowedTypes: string[]): SyncValidationRule {
  return function (value: any, language?: string): string | null {
    if (value == null || value === "") return null; // Ignore empty values
    if (typeof value !== "string") return getMessage("file", {}, language); // Ignore non-string values
    return allowedTypes.includes(value)
      ? null
      : getMessage("file", {}, language);
  };
}

export function combineRules<T>(
  rules: SyncValidationRule<T>[]
): SyncValidationRule<T>;
export function combineRules<T>(
  rules: AsyncValidationRule<T>[]
): AsyncValidationRule<T>;

export function combineRules(
  rules: (SyncValidationRule | AsyncValidationRule)[]
): SyncValidationRule | AsyncValidationRule {
  const hasAsyncRule = rules.some((rule) => isAsyncFunction(rule));

  if (hasAsyncRule) {
    return async (value: any, language?: string) => {
      for (const rule of rules) {
        const error = await rule(value, language);
        if (error) return error;
      }
      return null;
    };
  }

  return (value: any, language?: string): string | null => {
    for (const rule of rules) {
      const error = (rule as SyncValidationRule)(value, language);
      if (error) return error;
    }
    return null;
  };
}

export * from "./types.js";
