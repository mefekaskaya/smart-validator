import { currentLocale } from "./localization";
import {
  AsyncValidationRule,
  ErrorType,
  ValidationError,
  ValidationErrors,
  ValidationRule,
  ValidationRules,
} from "./types";
import { validateAsync } from "./validators/validateAsync";

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isValidationError(value: unknown): value is ValidationError {
  return isObject(value) && typeof value.message === "string";
}

/**
 * Retrieves a nested validation error using dot-notation paths.
 * @example
 *   const error = getNestedError(errors, 'user.email');
 */
export function getNestedError<T>(
  errors: ValidationErrors<T>,
  path: string
): ValidationError | null {
  const keys = path.split(".");
  let current: unknown = errors;

  for (const key of keys) {
    if (!isObject(current)) return null;
    current = current[key];
  }

  return isValidationError(current) ? current : null;
}

export function mergeErrors<T>(
  a: ValidationErrors<T> | null,
  b: ValidationErrors<T> | null
): ValidationErrors<T> | null {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;

  const merged: ValidationErrors<T> = { ...a };

  for (const key in b) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) continue;

    if (merged[key]) {
      if (
        b[key] &&
        typeof b[key] === "object" &&
        "message" in (b[key] as any) &&
        (b[key] as any).message !== (merged[key] as any).message
      ) {
        merged[key] = b[key];
      }
    } else {
      merged[key] = b[key];
    }
  }

  return merged;
}

export function cleanErrors(
  errors?: Record<string, string | null | Record<string, any>> | null
): Record<string, string | Record<string, any>> | undefined {
  if (!errors) return undefined;

  const cleaned: Record<string, string | Record<string, any>> = {};
  for (const key in errors) {
    const value = errors[key];
    if (typeof value === "string" || (value && typeof value === "object")) {
      cleaned[key] = value;
    }
  }

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export function cleanErrorsDeep(
  errors?: Record<string, string | null | Record<string, any>> | null
): Record<string, string | Record<string, any>> | undefined {
  if (!errors) return undefined;

  const result: Record<string, string | Record<string, any>> = {};

  for (const key in errors) {
    const value = errors[key];
    if (typeof value === "string") {
      result[key] = value;
    } else if (value && typeof value === "object") {
      const cleaned = cleanErrorsDeep(value);
      if (cleaned && Object.keys(cleaned).length > 0) {
        result[key] = cleaned;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export function toFieldErrors<T extends string>(
  field: T,
  error: string | Record<string, unknown> | null | undefined
): Record<T, string | Record<string, unknown>> | undefined {
  if (!error) return undefined;

  return { [field]: error } as Record<T, string | Record<string, unknown>>;
}

export function isRuleObject(obj: any): obj is { rules: any[] } {
  return typeof obj === "object" && obj !== null && Array.isArray(obj.rules);
}

export function isAsyncRule(rule: Function, value: any): boolean {
  try {
    const result = rule(value);
    return result instanceof Promise;
  } catch {
    return false;
  }
}

export function hasRulesField(
  obj: any
): obj is { rules: ValidationRule[]; validateOn?: string } {
  return typeof obj === "object" && obj !== null && Array.isArray(obj.rules);
}

export function isPromiseLike<T = any>(obj: unknown): obj is PromiseLike<T> {
  return (
    obj !== null &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof (obj as any).then === "function"
  );
}

export function debounceImmediate<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): T {
  let timer: NodeJS.Timeout;
  let firstCall = true;

  return ((...args: any[]) => {
    if (firstCall) {
      firstCall = false;
      return fn(...args);
    }

    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(fn(...args)), delay);
    });
  }) as T;
}

export function debouncedValidateAsync(
  value: any,
  rules: AsyncValidationRule[],
  language: string = currentLocale,
  delay: number = 500
): Promise<string | null> {
  return debounceImmediate(validateAsync, delay)(value, rules, language);
}

export function defaultErrorFormatter(message: string): ValidationError {
  return { message };
}

export function processValidationResult<T>(
  field: keyof T,
  value: any,
  error: any,
  formatError: (message: string) => ValidationError,
  errors: Partial<ValidationErrors<T>>,
  functionSuggestion: string
) {
  if (typeof value === "object" && value !== null) {
    if (typeof error === "string") {
      throw new Error(
        `Mismatch: Field "${String(
          field
        )}" is an object, but validation returned a string. 
         This suggests a flat validation rule was applied incorrectly. 
         Try using '${functionSuggestion}' instead.`
      );
    }
    errors[field] = error as ErrorType<T[keyof T]>;
  } else {
    if (typeof error !== "string") {
      throw new Error(
        `Mismatch: Field "${String(
          field
        )}" is expected to be a flat value, but validation returned an object. 
         This suggests a nested validation rule was applied incorrectly. 
         Try using '${functionSuggestion}' instead.`
      );
    }
    console.log("Error before formatting:", error);

    errors[field] = formatError(error) as ErrorType<T[keyof T]>;
  }
}

export function findMissingFields<T extends Record<string, any>>(
  values: T,
  rules: ValidationRules<T>
): void {
  const missingFields = Object.keys(rules).filter(
    (field) => !(field in values)
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Validation Error: The following fields are defined in rules but missing in form values: ${missingFields.join(
        ", "
      )}.`
    );
  }
}

export function checkExtraFields<T extends Record<string, any>>(
  values: T,
  rules: ValidationRules<T>,
  path: string[] = []
): void {
  for (const key in values) {
    if (!(key in rules)) {
      console.warn(
        `Warning: Field "${[...path, key].join(".")}" has no validation rules.`
      );
    } else if (
      typeof values[key] === "object" &&
      typeof rules[key] === "object"
    ) {
      checkExtraFields(
        values[key] as Record<string, any>,
        rules[key] as ValidationRules<any>,
        [...path, key]
      );
    }
  }
}

export function throwFlatMismatchError(
  field: string,
  functionName: string
): never {
  throw new Error(
    `Mismatch: Field "${field}" should be validated using ${functionName} instead.`
  );
}
