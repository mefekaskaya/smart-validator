import { Locale } from "./types";

export const baseMessages = {
  required: "This field is required.",
  minLength: "Must be at least {min} characters.",
  maxLength: "Must be at most {max} characters.",
  email: "Invalid email format.",
  isNumeric: "Must be a number.",
  step: "Must be a multiple of {step}.",
  min: "Must be at least {min}.",
  max: "Must be at most {max}.",
  pattern: "Invalid format.",
  url: "Invalid URL.",
  date: "Invalid date.",
  time: "Invalid time.",
  datetime: "Invalid date/time.",
  file: "Invalid file type.",
} as const;

const messages: Partial<Record<Locale, Record<string, string>>> = {
  en: baseMessages,
  es: {
    required: "Este campo es obligatorio.",
    minLength: "Debe tener al menos {min} caracteres.",
    maxLength: "Debe tener como máximo {max} caracteres.",
    email: "Formato de correo electrónico no válido.",
    isNumeric: "Debe ser un número.",
    step: "Debe ser un múltiplo de {step}.",
    min: "Debe ser al menos {min}.",
    max: "Debe ser como máximo {max}.",
    pattern: "Formato no válido.",
    url: "URL no válida.",
    date: "Fecha no válida.",
    time: "Hora no válida.",
    datetime: "Fecha/hora no válida.",
    file: "Tipo de archivo no válido.",
  },
  tr: {
    required: "Bu alan zorunludur.",
    minLength: "En az {min} karakter olmalıdır.",
    maxLength: "En fazla {max} karakter olmalıdır.",
    email: "Geçersiz e-posta formatı.",
    isNumeric: "Bir sayı olmalıdır.",
    step: "{step} katı olmalıdır.",
    min: "En az {min} olmalıdır.",
    max: "En fazla {max} olmalıdır.",
    pattern: "Geçersiz format.",
    url: "Geçersiz URL.",
    date: "Geçersiz tarih.",
    time: "Geçersiz saat.",
    datetime: "Geçersiz tarih/saat.",
    file: "Geçersiz dosya türü.",
  },
};

export const customMessages: Partial<Record<Locale, Record<string, string>>> =
  {};

export let currentLocale: Locale = "en";

export function setLocale(locale: Locale) {
  if (messages[locale]) {
    currentLocale = locale;
  } else {
    console.warn(
      `[Validation] Locale '${locale}' not found. Falling back to 'en'.`
    );
  }
}

export function setCustomTranslations(
  locale: Locale,
  customMsgs: Record<string, string>
) {
  if (!customMessages[locale]) {
    customMessages[locale] = {};
  }
  Object.assign(customMessages[locale], customMsgs);
}

export function getMessage(
  key: string,
  replacements: Record<string, any> = {},
  language: string = currentLocale,
  fallbackMessage: string = "Validation error."
): string {
  const locale: Locale =
    language in messages || language in customMessages
      ? (language as Locale)
      : "en";

  let message =
    customMessages[locale]?.[key] || // 🔹 Custom messages should be checked first!
    messages[locale]?.[key] ||
    messages["en"]?.[key] ||
    fallbackMessage;

  // Replace placeholders
  for (const [placeholder, value] of Object.entries(replacements)) {
    message = message.replaceAll(`{${placeholder}}`, String(value));
  }

  return message;
}
