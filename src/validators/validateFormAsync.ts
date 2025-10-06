import { currentLocale } from "../localization";
import { ValidationError, ValidationErrors, ValidationRules } from "../types";
import {
  checkExtraFields,
  defaultErrorFormatter,
  findMissingFields,
  hasRulesField,
  isPromiseLike,
  processValidationResult,
  throwFlatMismatchError,
} from "../utils";

export async function validateFormAsync<T extends Record<string, any>>(
  values: T,
  rules: ValidationRules<T>,
  language?: string,
  formatError?: (message: string) => ValidationError
): Promise<ValidationErrors<T> | null>;

export async function validateFormAsync<T extends Record<string, any>>(
  values: T,
  rules: ValidationRules<T>,
  language: string = currentLocale,
  formatError: (message: string) => ValidationError = defaultErrorFormatter
): Promise<ValidationErrors<T> | null> {
  const errors: Partial<ValidationErrors<T>> = {};
  findMissingFields(values, rules);

  for (const field in rules) {
    const fieldRule = rules[field];

    if (hasRulesField(fieldRule)) {
      const value = values[field];
      for (const rule of fieldRule.rules) {
        const result = rule(value, language, field, values);
        const message = isPromiseLike(result) ? await result : result;

        if (message) {
          processValidationResult(
            field,
            value,
            message,
            formatError,
            errors,
            "validateFormAsync"
          );
          break;
        }
      }
    } else if (typeof fieldRule === "object" && fieldRule !== null) {
      throwFlatMismatchError(field, "validateFormAsync");
    }
  }

  checkExtraFields(values, rules);
  return Object.keys(errors).length > 0 ? errors : null;
}
