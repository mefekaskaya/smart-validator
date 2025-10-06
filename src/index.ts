export { useValidation } from "./hooks/useValidation.js";
export { ValidationProvider } from "./context/ValidationProvider.js";
export { RenderErrors } from "./components/RenderErrors";

export * from "./utils";
export * from "./rules.js";
export * from "./localization.js";
export * from "./helpers.js";
export * from "./hooks/useValidation.js";
export * from "./context/ValidationProvider.js";
export * from "./types.js";
export * from "./validators/index.js";

/*
Feature	Yup ✅	Zod ✅	Joi ✅	Our Package 🚀
Basic field validation	✅	✅	✅	✅
Nested object validation	✅	✅	✅	✅
Custom validation rules	✅	✅	✅	✅
Async validation (e.g. API calls)	✅ Limited	❌ No	✅ Yes	✅ Best
requiredIf (Conditional validation)	❌ No	❌ No	✅ Yes	✅ Best
validateOn (change, blur, submit)	❌ No	❌ No	❌ No	✅ Unique Feature
Debounce for async validation	❌ No	❌ No	❌ No	✅ Unique Feature
Schema-based validation	✅ Best	✅ Best	✅ Best	✅ Integrated

🔹 Key Takeaways
Zod & Yup are great for schema-based validation, but they lack features like async validation, requiredIf, and validateOn.

Joi supports conditional validation (requiredIf) but is mainly for backend validation.

Our package combines schema-based validation + field-based validation, so developers get the best of both worlds.
*/
