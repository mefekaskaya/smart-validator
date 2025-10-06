import { currentLocale } from "../localization";
import { ValidationRule } from "../types";

export async function validateAsync(
  value: any,
  rules: ValidationRule[],
  language: string = currentLocale
): Promise<string | null> {
  for (const rule of rules) {
    const result = await Promise.resolve(rule(value, language));
    if (result) return result;
  }
  return null;
}
