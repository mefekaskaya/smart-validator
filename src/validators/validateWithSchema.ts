import { z } from "zod";
import * as yup from "yup";
import { ValidationErrors } from "../types";
import Joi from "joi";
import { isPromiseLike } from "../utils";
// Generic validation function that detects the schema type and applies validation
export async function validateWithSchema<T>(
  schema: z.ZodSchema<T> | yup.Schema<T> | Joi.Schema,
  values: T
): Promise<ValidationErrors<T> | null> {
  // Zod
  if ("safeParse" in schema && typeof schema.safeParse === "function") {
    const result = schema.safeParse(values);
    if (result.success) return null;

    const formattedErrors: ValidationErrors<T> = {};
    const formatted = result.error.format();
    Object.keys(formatted).forEach((key) => {
      const errorEntry = formatted[key as keyof typeof formatted] as {
        _errors?: string[];
      };
      (formattedErrors as Record<string, any>)[key] = {
        message: errorEntry?._errors?.join(", ") || "Invalid value",
      };
    });

    return formattedErrors;
  }

  // Yup
  if ("validateSync" in schema && typeof schema.validateSync === "function") {
    try {
      schema.validateSync(values, { abortEarly: false });
      return null;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formattedErrors: ValidationErrors<T> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            (formattedErrors as Record<string, any>)[error.path] = {
              message: error.message,
            };
          }
        });
        return formattedErrors;
      }
    }
  }

  //  Joi (async)
  if ("validateAsync" in schema && typeof schema.validateAsync === "function") {
    try {
      await schema.validateAsync(values, { abortEarly: false });
      return null;
    } catch (err) {
      if (err && typeof err === "object" && "details" in err) {
        const formattedErrors: ValidationErrors<T> = {};
        (err as Joi.ValidationError).details.forEach((detail) => {
          if (detail.path) {
            (formattedErrors as Record<string, any>)[detail.path.join(".")] = {
              message: detail.message,
            };
          }
        });
        return formattedErrors;
      }
    }
  }

  // Joi (sync)
  if ("validate" in schema && typeof schema.validate === "function") {
    const result = schema.validate(values, { abortEarly: false });
    const validationResult = isPromiseLike(result)
      ? await (result as Promise<any>).catch((e) => e)
      : result;

    if (
      validationResult &&
      typeof validationResult === "object" &&
      "details" in validationResult
    ) {
      const formattedErrors: ValidationErrors<T> = {};
      (validationResult as Joi.ValidationError).details.forEach((detail) => {
        if (detail.path) {
          (formattedErrors as Record<string, any>)[detail.path.join(".")] = {
            message: detail.message,
          };
        }
      });
      return formattedErrors;
    }

    return null;
  }

  throw new Error("Unsupported schema type");
}
