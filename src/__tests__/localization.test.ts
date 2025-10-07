import {
  getMessage,
  setCustomTranslations,
  setLocale,
  customMessages,
} from "../localization.js";

describe("Localization Tests", () => {
  test("returns default English message", () => {
    expect(getMessage("required", {}, "en")).toBe("This field is required.");
  });

  test("returns Spanish translation", () => {
    expect(getMessage("email", {}, "es")).toBe(
      "Formato de correo electrónico no válido."
    );
  });

  test("returns fallback to English when translation is missing", () => {
    expect(getMessage("nonExistentKey", {}, "fr")).toBe("Validation error.");
  });

  test("uses a custom fallback message", () => {
    expect(getMessage("nonExistentKey", {}, "fr", "Custom fallback")).toBe(
      "Custom fallback"
    );
  });

  test("allows setting custom translations", () => {
    setCustomTranslations("fr", { required: "Champ requis personnalisé." });

    expect(getMessage("required", {}, "fr")).toBe("Champ requis personnalisé.");
  });

  test("replaces placeholders", () => {
    expect(getMessage("minLength", { min: 5 }, "en")).toBe(
      "Must be at least 5 characters."
    );
  });

  test("allows setting custom translations", () => {
    setCustomTranslations("fr", { required: "Champ requis personnalisé." });
    expect(getMessage("required", {}, "fr")).toBe("Champ requis personnalisé.");
  });

  test("updates locale globally", () => {
    setLocale("es");
    expect(getMessage("required")).toBe("Este campo es obligatorio.");
    setLocale("en"); // Reset to default
  });
});
