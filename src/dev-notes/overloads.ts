import { z } from "zod";
import * as yup from "yup";
import {
  AsyncValidationRules,
  SyncValidationRules,
  ValidationErrors,
} from "../types";
import Joi from "joi";
import { validateWithSchema } from "../validators/validateWithSchema";
import { validateFormAsync } from "../validators/validateFormAsync";
import { validateForm } from "../validators/validateForm";

// ✅ Overload for Schema-Only Validation
export function validateFormWithSchema<T extends Record<string, any>>(
  values: T,
  rules: undefined,
  schema: z.ZodSchema<T> | yup.Schema<T> | Joi.Schema
): ValidationErrors<T> | null;

// ✅ Overload for Async Validation
export function validateFormWithSchema<T extends Record<string, any>>(
  values: T,
  rules: AsyncValidationRules<T>,
  schema?: z.ZodSchema<T> | yup.Schema<T> | Joi.Schema,
  validator?: (
    values: T,
    rules: AsyncValidationRules<T>
  ) => Promise<ValidationErrors<T> | null>
): Promise<ValidationErrors<T> | null>;

// ✅ Overload for Sync Validation
export function validateFormWithSchema<T extends Record<string, any>>(
  values: T,
  rules: SyncValidationRules<T>,
  schema?: z.ZodSchema<T> | yup.Schema<T> | Joi.Schema,
  validator?: (
    values: T,
    rules: SyncValidationRules<T>
  ) => ValidationErrors<T> | null
): ValidationErrors<T> | null;

export function validateFormWithSchema<
  T extends Record<string, any>,
  R extends SyncValidationRules<T> | AsyncValidationRules<T> | undefined
>(
  values: T,
  rules?: R,
  schema?: z.ZodSchema<T> | yup.Schema<T> | Joi.Schema,
  validator?: R extends AsyncValidationRules<T>
    ? (
        values: T,
        rules: AsyncValidationRules<T>
      ) => Promise<ValidationErrors<T> | null>
    : R extends SyncValidationRules<T>
    ? (values: T, rules: SyncValidationRules<T>) => ValidationErrors<T> | null
    : never
): R extends AsyncValidationRules<T>
  ? Promise<ValidationErrors<T> | null>
  : ValidationErrors<T> | null {
  // ✅ If a schema is provided, use it first
  if (schema) {
    return validateWithSchema(
      schema,
      values
    ) as R extends AsyncValidationRules<T>
      ? Promise<ValidationErrors<T> | null>
      : ValidationErrors<T> | null;
  }

  // ✅ Ensure rules exist
  if (!rules) {
    throw new Error("Either validation rules or a schema must be provided.");
  }

  // ✅ Use provided validator if available
  if (validator) {
    return validator(
      values,
      rules as NonNullable<R>
    ) as R extends AsyncValidationRules<T>
      ? Promise<ValidationErrors<T> | null>
      : ValidationErrors<T> | null;
  }

  // ✅ Automatically detect if validation is async
  const isAsync = Object.values(rules).some((rule) =>
    Array.isArray(rule)
      ? rule.some((r) => r.constructor.name === "AsyncFunction")
      : false
  );

  if (isAsync) {
    return validateFormAsync(
      values,
      rules as AsyncValidationRules<T>
    ) as R extends AsyncValidationRules<T>
      ? Promise<ValidationErrors<T> | null>
      : ValidationErrors<T> | null;
  } else {
    return validateForm(
      values,
      rules as SyncValidationRules<T>
    ) as R extends AsyncValidationRules<T>
      ? Promise<ValidationErrors<T> | null>
      : ValidationErrors<T> | null;
  }
}
