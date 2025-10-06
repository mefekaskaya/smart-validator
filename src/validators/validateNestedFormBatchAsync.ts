import { currentLocale } from "../localization";
import {
  SyncValidationRules,
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
} from "../utils";
import { validateAsync } from "./validateAsync";

export async function validateNestedFormBatchAsync<
  T extends Record<string, any>
>(
  values: T,
  rules: ValidationRules<T>,
  language: string = currentLocale,
  formatError: (message: string) => ValidationError = defaultErrorFormatter
): Promise<ValidationErrors<T> | null> {
  const errors: Partial<ValidationErrors<T>> = {};
  findMissingFields(values, rules);

  const validationPromises = Object.keys(rules).map(async (field) => {
    const fieldRule = rules[field];
    const value = values[field];

    if (typeof fieldRule === "object" && "rules" in fieldRule) {
      try {
        // Explicit cast for strict TS check
        const error = await validateAsync(
          value,
          fieldRule.rules as ValidationRule[],
          language
        );
        return { field, error };
      } catch (e) {
        return {
          field,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    } else if (
      typeof fieldRule === "object" &&
      fieldRule !== null &&
      !("rules" in fieldRule)
    ) {
      if (typeof value === "object" && value !== null) {
        const nestedErrors = await validateNestedFormBatchAsync(
          value,
          fieldRule as ValidationRules<T[Extract<keyof T, string>]>,
          language,
          formatError
        );
        return { field, error: nestedErrors };
      } else {
        return {
          field,
          error: formatError(
            `Mismatch: Field "${field}" should be an object, but a flat value was provided.`
          ),
        };
      }
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
          "validateNestedFormBatchAsync"
        );
      }
    } else if (result.status === "rejected") {
      console.error("A nested validation promise rejected:", result.reason);
    }
  }

  checkExtraFields(values, rules);

  return Object.keys(errors).length > 0
    ? (errors as ValidationErrors<T>)
    : null;
}
