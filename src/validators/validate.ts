import { currentLocale } from "../localization";
import { ValidationRule } from "../types";
import { isPromiseLike } from "../utils";

export function validate(
  value: any,
  rules: ValidationRule[],
  language: string = currentLocale
): string | null {
  for (const rule of rules) {
    const result = rule(value, language);
    if (isPromiseLike(result)) {
      console.warn(
        "Async rule detected in `validate()`. Consider using `validateAsync()` instead."
      );
      continue;
    }

    if (result) return result;
  }
  return null;
}
