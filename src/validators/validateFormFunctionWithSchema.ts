import Joi from "joi";
import * as yup from "yup";
import * as z from "zod";

import {
  AsyncValidationRules,
  SyncValidationRules,
  ValidationErrors,
} from "../types";
import { validateWithSchema } from "./validateWithSchema";
import { mergeErrors } from "../utils";

export async function validateFormFunctionWithSchema<
  T extends Record<string, any>,
  R extends SyncValidationRules<T> | AsyncValidationRules<T>
>(
  values: T,
  rules: R | undefined,
  schema: z.ZodSchema<T> | yup.Schema<T> | Joi.Schema | undefined,
  validateFormFunction: (
    values: T,
    rules: R
  ) => ValidationErrors<T> | Promise<ValidationErrors<T> | null> | null
): Promise<ValidationErrors<T> | null> {
  const ruleErrors = rules
    ? await Promise.resolve(validateFormFunction(values, rules))
    : null;

  const schemaErrors = schema
    ? await Promise.resolve(validateWithSchema(schema, values))
    : null;

  return mergeErrors(ruleErrors, schemaErrors);
}
