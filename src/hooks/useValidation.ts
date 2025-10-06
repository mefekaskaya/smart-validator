import { useState } from "react";
import { isAsyncFunction } from "../helpers.js";
import {
  ValidationRule,
  SyncValidationRules,
  ValidationError,
  ValidationErrors,
} from "../types.js";
import { validateForm } from "../validators/validateForm.js";
import { validateAsync } from "../validators/validateAsync.js";
import { validate } from "../validators/validate.js";

export function setFieldError<T>(
  prevErrors: ValidationErrors<T> | null,
  fieldName: keyof T | string,
  error: ValidationError | null
): ValidationErrors<T> {
  const updatedErrors: ValidationErrors<T> = { ...(prevErrors || {}) };
  const typedFieldName = fieldName as keyof T;

  if (error === null) {
    delete updatedErrors[typedFieldName];
  } else {
    updatedErrors[typedFieldName] = error;
  }

  return updatedErrors;
}

export function useValidation<T extends Record<string, any>>({
  initialValues,
  rules,
  onSubmit,
  validateFn = validateForm,
}: {
  initialValues: T;
  rules: SyncValidationRules<T>;
  onSubmit: (values: T) => void;
  validateFn?: (
    values: T,
    rules: SyncValidationRules<T>
  ) => ValidationErrors<T> | null | Promise<ValidationErrors<T> | null>;
}) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [isValidating, setIsValidating] = useState<boolean>(false); // Track async validation

  // Compute default validateOn behavior
  const defaultValidateOn = Object.keys(rules).reduce((acc, key) => {
    const rule = rules[key as keyof T];

    let validateOn: "change" | "blur" | "submit" = "submit"; // Default to submit

    if (typeof rule === "object" && rule !== null && !Array.isArray(rule)) {
      if ("validateOn" in rule && typeof rule.validateOn === "string") {
        validateOn = rule.validateOn;
      }
    }

    return {
      ...acc,
      [key]: validateOn,
    };
  }, {} as Record<string, "change" | "blur" | "submit">);

  const validateField = async (fieldName: keyof T, value: any) => {
    // Get validation rules for this field
    const fieldRules = rules[fieldName];
    let syncRules: ValidationRule[] = [];
    let asyncRules: ValidationRule[] = [];

    if (Array.isArray(fieldRules)) {
      syncRules = fieldRules;
    } else if (
      typeof fieldRules === "object" &&
      fieldRules !== null &&
      "rules" in fieldRules &&
      Array.isArray(fieldRules.rules)
    ) {
      syncRules = fieldRules.rules.filter((rule) => !isAsyncFunction(rule));
      asyncRules = fieldRules.rules.filter((rule) => isAsyncFunction(rule));
    }

    // Perform sync validation first
    const syncError = validate(value, syncRules);
    let fieldError = syncError;

    // If no sync error and async rules exist, run async validation
    if (!syncError && asyncRules.length > 0) {
      fieldError = await validateAsync(value, asyncRules);
    }

    setErrors((prevErrors) =>
      setFieldError(prevErrors, fieldName, fieldError as ValidationError | null)
    );
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name as keyof T;
    const value = e.target.value;

    setValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (defaultValidateOn[fieldName as string] === "change") {
      await validateField(fieldName, value); // Ensure async validation works
    }
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = e.target.name as keyof T;
    const value = e.target.value;

    if (defaultValidateOn[fieldName as string] === "blur") {
      await validateField(fieldName, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsValidating(true);
    const formErrors = await validateFn(values, rules);

    setErrors(formErrors || {});
    setIsValidating(false);

    if (!formErrors) onSubmit(values);
  };

  return {
    values,
    errors,
    isValidating,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
