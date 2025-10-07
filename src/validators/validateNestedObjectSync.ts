import {
  ErrorType,
  ValidationError,
  ValidationErrors,
  ValidationRules,
} from "../types";

export function validateNestedObjectSync<T extends Record<string, any>>(
  field: keyof T,
  value: any,
  rules: ValidationRules<T>,
  validateFunction: (
    values: any,
    rules: any,
    language: string,
    formatError: any
  ) => any,
  language: string,
  formatError: (message: string) => ValidationError,
  errors: Partial<ValidationErrors<T>>
) {
  if (typeof value === "object" && value !== null) {
    const nestedErrors = validateFunction(value, rules, language, formatError);
    if (typeof nestedErrors === "string") {
      throw new Error(
        `Mismatch: Field "${String(
          field
        )}" should return nested validation errors but returned a string.`
      );
    }
    console.log("Assigning nested error for", field, nestedErrors);
    if (nestedErrors && Object.keys(nestedErrors).length > 0) {
      errors[field] = nestedErrors as ErrorType<T[keyof T]>;
    }
  } else {
    throw new Error(
      `Mismatch: Field "${String(
        field
      )}" should be an object, but a flat value was provided.`
    );
  }
}
