import { currentLocale } from "../localization";
import {
  SyncValidationRules,
  ValidationError,
  ValidationErrors,
} from "../types";
import {
  checkExtraFields,
  defaultErrorFormatter,
  findMissingFields,
  processValidationResult,
  throwFlatMismatchError,
} from "../utils";
import { validate } from "./validate";

export function validateForm<T extends Record<string, any>>(
  values: T,
  rules: SyncValidationRules<T>,
  language: string = currentLocale,
  formatError: (message: string) => ValidationError = defaultErrorFormatter
): ValidationErrors<T> | null {
  const errors: Partial<ValidationErrors<T>> = {};
  findMissingFields(values, rules);

  for (const field in rules) {
    const fieldRule = rules[field];

    if (Array.isArray(fieldRule)) {
      const error = validate(values[field], fieldRule, language);
      if (error) {
        processValidationResult(
          field,
          values[field],
          error,
          formatError,
          errors,
          "validateForm"
        );
      }
    } else if (
      typeof fieldRule === "object" &&
      fieldRule !== null &&
      "rules" in fieldRule &&
      Array.isArray(fieldRule.rules)
    ) {
      const error = validate(values[field], fieldRule.rules, language);
      if (error) {
        processValidationResult(
          field,
          values[field],
          error,
          formatError,
          errors,
          "validateForm"
        );
      }
    } else if (typeof fieldRule === "object" && fieldRule !== null) {
      throwFlatMismatchError(field, "validateNestedForm");
    }
  }

  checkExtraFields(values, rules);

  return Object.keys(errors).length > 0 ? errors : null;
}
