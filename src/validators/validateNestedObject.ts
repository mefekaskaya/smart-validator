import {
  ErrorType,
  ValidationError,
  ValidationErrors,
  ValidationRules,
} from "../types";

export async function validateNestedObject<T extends Record<string, any>>(
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
    const nestedErrors = await Promise.resolve(
      validateFunction(value, rules, language, formatError)
    );
    if (typeof nestedErrors === "string") {
      throw new Error(
        `Mismatch: Field "${String(
          field
        )}" should return nested validation errors but returned a string.`
      );
    }
    console.log("Assigning nested error for", field, nestedErrors);
    if (nestedErrors && Object.keys(nestedErrors).length > 0) {
      errors[field] = {
        ...(errors[field] as Record<string, any>),
        ...nestedErrors,
      } as ErrorType<T[keyof T]>;
    } else {
      // Always preserve shape for downstream nesting
      errors[field] = (errors[field] || {}) as ErrorType<T[keyof T]>;
    }
    console.log("Assigning nested error for", field, nestedErrors);
  } else {
    throw new Error(
      `Mismatch: Field "${String(
        field
      )}" should be an object, but a flat value was provided.`
    );
  }
}
