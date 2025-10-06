import { currentLocale } from "../localization";
import {
  ValidationError,
  ValidationErrors,
  ValidationRules,
  ValidationRule,
} from "../types";
import {
  checkExtraFields,
  defaultErrorFormatter,
  findMissingFields,
  processValidationResult,
  throwFlatMismatchError,
} from "../utils";
import { validateAsync } from "./validateAsync";

export async function validateFormAsyncBatch<T extends Record<string, any>>(
  values: T,
  rules: ValidationRules<T>,
  language: string = currentLocale,
  formatError: (message: string) => ValidationError = defaultErrorFormatter
): Promise<ValidationErrors<T> | null> {
  findMissingFields(values, rules);
  const errors: Partial<ValidationErrors<T>> = {};

  const validationPromises = Object.keys(rules).map(async (field) => {
    const fieldRule = rules[field];
    const value = values[field];

    if (typeof fieldRule === "object" && "rules" in fieldRule) {
      try {
        const error = await validateAsync(
          value,
          fieldRule.rules as ValidationRule[],
          language
        );
        return { field, error };
      } catch (err) {
        return {
          field,
          error: err instanceof Error ? err.message : "Validation error",
        };
      }
    } else if (typeof fieldRule === "object" && fieldRule !== null) {
      throwFlatMismatchError(field, "validateNestedFormBatchAsync");
    }
    return { field, error: null };
  });

  const settled = await Promise.allSettled(validationPromises);

  for (const result of settled) {
    if (result.status === "fulfilled" && result.value) {
      const { field, error } = result.value;
      if (error) {
        processValidationResult(
          field as keyof T,
          values[field],
          error,
          formatError,
          errors,
          "validateFormAsyncBatch"
        );
      }
    } else if (result.status === "rejected") {
      console.error("A validation promise rejected:", result.reason);
    }
  }

  checkExtraFields(values, rules);

  return Object.keys(errors).length > 0 ? errors : null;
}
