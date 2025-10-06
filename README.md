## 🧩 Overview

`smart-validator` is a minimalist yet powerful validation library for JavaScript and TypeScript.  
It combines functional rule-based validation with optional schema validation (Zod/Yup/Joi),  
making it ideal for both client-side forms and backend data validation.

---

## 📘 Table of Contents

- [Overview](#-smart-validator)
- [Features](#-features)
- [Installation](#-installation)
- [Examples](#-examples)
- [Utilities](#-built-in-utility-functions)
- [API Reference](#-supported-functions)
- [Custom Rules](#-writing-custom-rules)
- [React Integration](#-react-hook-integration-planned)
- [Versioning & Contributing](#-versioning-&-contributing)
- [License](#-license)

---

## 🚀 Features

✅ Simple rule-based syntax (`required()`, `minLength(6)`, etc.)  
✅ Nested & flat form validation (`validateForm`, `validateNestedForm`)  
✅ Supports **Zod**, **Yup**, and **Joi** schemas  
✅ Custom translations and localization  
✅ Async validation with debounce and error resilience  
✅ Conditional validation (`requiredIf`)  
✅ Rule composition (`combineRules`)  
✅ React-ready `<RenderErrors />` component  
✅ TypeScript-first – fully typed error objects

---

## 📦 Installation

````bash
npm install smart-validator
# or
yarn add smart-validator

---
## 🌍 Built-in Utility Functions

| Function                           | Description                                        |
| ---------------------------------- | -------------------------------------------------- |
| `cleanErrorsDeep(errors)`          | Removes `null` and empty error entries recursively |
| `mergeErrors(a, b)`                | Merges multiple validation result objects          |
| `getNestedError(errors, path)`     | Retrieves nested field errors safely               |
| `checkExtraFields(values, rules)`  | Detects undefined fields                           |
| `findMissingFields(values, rules)` | Validates schema completeness                      |
---
## 🧩 Supported Functions

| Function                           | Type  | Description                       |
| ---------------------------------- | ----- | --------------------------------- |
| `validateForm()`                   | Sync  | Flat object validation            |
| `validateNestedForm()`             | Sync  | Deep object validation            |
| `validateFormAsync()`              | Async | Async rules (e.g., API checks)    |
| `validateNestedFormAsync()`        | Async | Async + nested support            |
| `validateWithSchema()`             | Async | Works with Zod, Yup, Joi          |
| `validateFormFunctionWithSchema()` | Async | Combines rule + schema validation |
---
```md
## 🧠 Writing Custom Rules

```ts
import { getMessage, setCustomTranslations } from "smart-validator";

setCustomTranslations("en", {
  startsWith: "Must start with '{prefix}'",
});

// 2️⃣ Define your custom rule
export function startsWith(prefix: string): SyncValidationRule {
  return (value: string, language?: string) =>
    !value.startsWith(prefix)
      ? getMessage("startsWith", { prefix }, language)
      : null;
}

---
```md
## 📚 Examples

All examples are available inside the /examples folder.

Each file demonstrates a specific capability of smart-validator:
| Example File                              | Description                                              |
| ----------------------------------------- | -------------------------------------------------------- |
| `ValidateFormExample.tsx`                 | Basic synchronous form validation                        |
| `ValidateNestedFormExample.tsx`           | Deep / nested object validation                          |
| `ValidateAsyncFormExample.tsx`            | Async field validation (e.g., API checks)                |
| `ValidateAsyncBatchFormExample.tsx`       | Async batch field validation                             |
| `ValidateAsyncNestedFormExample.tsx`      | Async + nested validation                                |
| `ValidateAsyncBatchNestedFormExample.tsx` | Async + nested + batch validation                        |
| `ValidateCustomMessagesExample.tsx`       | Per-field custom error messages                          |
| `ValidateLocalizationExample.tsx`         | Localization & translated messages                       |
| `ValidateConditionalRulesExample.tsx`     | Conditional logic via `requiredIf`                       |
| `ValidationComposedRulesExample.tsx`      | Rule composition via `combineRules`                      |
| `ValidateCombinedSchemaRulesExample.tsx`  | Hybrid validation (rules + schema)                       |
| `ValidateWithSchemaZod.tsx`               | Full schema-only validation using Zod                    |
| `ValidateOnExample.tsx`                   | Field-level validation triggers (`onChange`, `onSubmit`) |
| `AsyncDebounceExample.tsx`                | Async debounce validation example                        |


---
## 🧩 React Hook Integration (planned)
const { values, errors, handleChange, handleSubmit } = useValidation(rules);

---
## 🧭 Versioning & Contributing

smart-validator follows Semantic Versioning (SemVer)
,
ensuring predictable and backward-compatible releases.

We welcome issues, feature requests, and pull requests on GitHub:
👉 github.com/mefekaskaya/smart-validator

Before contributing:

Run npm run build to ensure your code compiles cleanly

Follow the existing coding style (TypeScript, consistent naming)

Keep all new features covered with clear examples under /examples

Your contributions help keep the package small, readable, and truly smart. 💡

---

##🚀 Release Checklist

Before publishing a new version of smart-validator to npm:

Build the package

npm run build


✅ Ensures Rollup output is clean (dist/ folder generated).

Test all examples

Open /examples in your React test app.

Verify validation, localization, async, and schema cases.

Update version

npm version patch   # for bug fixes
npm version minor   # for new features (non-breaking)
npm version major   # for breaking changes


Publish to npm

npm publish --access public


Tag the release on GitHub

git push origin main --tags


Update README badges if version or bundle size changed.

---

## ⚖️ License

MIT © 2025 Mehmet Efe Kaşkaya
GitHub: [@mefekaskaya](https://github.com/mefekaskaya)

````
