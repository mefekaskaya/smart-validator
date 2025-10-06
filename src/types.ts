import { baseMessages } from "./localization";

export type Primitive =
  | string
  | number
  | boolean
  | null
  | undefined
  | symbol
  | bigint;

export type FieldPath<T, Prev extends string = ""> = {
  [K in keyof T]: T[K] extends Primitive
    ? `${Prev}${Extract<K, string>}`
    :
        | `${Prev}${Extract<K, string>}`
        | FieldPath<T[K], `${Prev}${Extract<K, string>}.`>;
}[keyof T];

export interface ValidationError {
  message: string;
  code?: string; // Optional error code
  // add more properties (e.g., ruleName, field, etc.) as needed.
}

export type ErrorType<T> = T extends object
  ? ValidationErrors<T>
  : ValidationError | null;

export type SyncValidationRule<T = any> = (
  value: T,
  language?: string,
  field?: string,
  values?: any
) => string | null;

export type AsyncValidationRule<T = any> = (
  value: T,
  language?: string,
  field?: string,
  values?: any
) => Promise<string | null>;

export type ValidationRule<T = any> =
  | SyncValidationRule<T>
  | AsyncValidationRule<T>;

export type ValidationRules<T> = {
  [K in keyof T]?: T[K] extends object
    ? ValidationRules<T[K]>
    : { rules: ValidationRule[]; validateOn?: "change" | "blur" | "submit" };
};

export type ValidationErrors<T> = {
  [K in keyof T]?: T[K] extends object
    ? ValidationErrors<T[K]> | ValidationError | null
    : ValidationError | null;
};

export type SyncValidationRules<T> = {
  [K in keyof T]?: T[K] extends object
    ? SyncValidationRules<T[K]>
    : {
        rules: SyncValidationRule[];
        validateOn?: "change" | "blur" | "submit";
      };
};

export type AsyncValidationRules<T> = {
  [K in keyof T]?: T[K] extends object
    ? AsyncValidationRules<T[K]>
    : {
        rules: AsyncValidationRule[];
        validateOn?: "change" | "blur" | "submit";
      };
};

export type MessageKey = keyof typeof baseMessages;

export type LocaleMessages = Partial<
  Record<Locale, Partial<Record<MessageKey, string>>>
>;

export type Locale = "en" | "es" | "fr" | "de" | "tr"; // Add more as needed

export type CustomMessages = Partial<Record<MessageKey, string>>;
