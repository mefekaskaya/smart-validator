import { currentLocale } from "../localization";
import { ValidationError, ValidationErrors, ValidationRules } from "../types";
import {
  checkExtraFields,
  defaultErrorFormatter,
  findMissingFields,
  isRuleObject,
  processValidationResult,
} from "../utils";
import { validate } from "./validate";
import { validateNestedObjectSync } from "./validateNestedObjectSync";

/**
 * Recursively validates an object.
 *
 * This function expects the rules to be in one of two forms:
 * - For a simple (flat) field, the rule should be an array of ValidationRule functions.
 * - For a nested object, the rule should be an object whose keys mirror the nested structure.
 *
 * The function returns an error object that mirrors the structure of `values`. For each field:
 * - If the rule is an array, it validates the value using `validate()`.
 * - If the rule is an object, it calls itself recursively.
 *
 * It also checks for configuration issues:
 * - If a field exists in rules but not in values, it aggregates these missing fields and throws an error.
 * - It warns about extra fields in `values` that are not defined in `rules`.
 * 
 * {
  user: {
    address: {
      city: "City is required.",
    },
  },
}
✅ Errors are structured exactly like the input form!
 */
export function validateNestedForm<T extends Record<string, any>>(
  values: T,
  rules: ValidationRules<T>,
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
        console.log("Before adding error:", JSON.stringify(errors, null, 2));
        processValidationResult(
          field,
          values[field],
          error,
          formatError,
          errors,
          "validateNestedForm"
        );
      }
    } else if (isRuleObject(fieldRule)) {
      const error = validate(values[field], fieldRule.rules, language);
      if (error) {
        processValidationResult(
          field,
          values[field],
          error,
          formatError,
          errors,
          "validateNestedForm"
        );
      }
    } else if (typeof fieldRule === "object" && fieldRule !== null) {
      // It's a nested object, not a rule config
      validateNestedObjectSync(
        field,
        values[field],
        fieldRule,
        validateNestedForm,
        language,
        formatError,
        errors as Partial<ValidationErrors<T[Extract<keyof T, string>]>>
      );
    }
  }
  console.log("Final nested errors:", JSON.stringify(errors, null, 2));

  checkExtraFields(values, rules);

  return Object.keys(errors).length > 0 ? errors : null;
}
