import { currentLocale } from "../localization";
import { ValidationError, ValidationErrors, ValidationRules } from "../types";
import {
  checkExtraFields,
  defaultErrorFormatter,
  findMissingFields,
  isRuleObject,
  processValidationResult,
} from "../utils";
import { validateAsync } from "./validateAsync";
import { validateNestedObject } from "./validateNestedObject";

export async function validateNestedFormAsync<T extends Record<string, any>>(
  values: T,
  rules: ValidationRules<T>,
  language: string = currentLocale,
  formatError: (message: string) => ValidationError = defaultErrorFormatter
): Promise<ValidationErrors<T> | null> {
  const errors: Partial<ValidationErrors<T>> = {};
  findMissingFields(values, rules);

  for (const field in rules) {
    const fieldRule = rules[field];

    if (Array.isArray(fieldRule)) {
      const error = await validateAsync(values[field], fieldRule, language);
      if (error) {
        processValidationResult(
          field,
          values[field],
          error,
          formatError,
          errors,
          "validateNestedFormAsync"
        );
      }
    } else if (isRuleObject(fieldRule)) {
      const error = await validateAsync(
        values[field],
        fieldRule.rules,
        language
      );
      if (error) {
        processValidationResult(
          field,
          values[field],
          error,
          formatError,
          errors,
          "validateNestedFormAsync"
        );
      }
    } else if (typeof fieldRule === "object" && fieldRule !== null) {
      await validateNestedObject(
        field,
        values[field],
        fieldRule,
        validateNestedFormAsync,
        language,
        formatError,
        errors as Partial<ValidationErrors<T[Extract<keyof T, string>]>>
      );
    }
  }
  checkExtraFields(values, rules);
  return Object.keys(errors).length > 0 ? errors : null;
}
