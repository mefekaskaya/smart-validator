import { useState } from "react";
import {
  required,
  minLength,
  validateFormFunctionWithSchema,
  RenderErrors,
  cleanErrorsDeep,
  validateForm,
} from "smart-validator";
import type { ValidationErrors, SyncValidationRules } from "smart-validator";
import { z } from "zod";

type FormValues = {
  email: string;
  password: string;
  age?: number;
};

// 1️⃣ Base schema (no age yet)
let schema = z.object({
  email: z.string().email("Invalid email from Zod"),
  password: z.string(),
});

// 2️⃣ Base rules (no age yet)
const rules: SyncValidationRules<FormValues> = {
  email: {
    rules: [],
  },
  password: {
    rules: [required(), minLength(6)],
  },
};

// 3️⃣ Dynamically extend both
schema = schema.extend({
  age: z.preprocess(
    (val) => Number(val),
    z.number().min(18, "Must be 18 or older")
  ),
});
(rules as unknown).age = { rules: [] }; // let schema handle it
// 👆 `as any` needed because TS doesn’t know we are dynamically adding a field

export default function ValidateCombinedSchemaRulesExample() {
  const [values, setValues] = useState<FormValues>({
    email: "",
    password: "",
    age: undefined,
  });
  const [errors, setErrors] = useState<
    ValidationErrors<FormValues> | undefined
  >();

  async function handleSubmit() {
    const result = await validateFormFunctionWithSchema(
      values,
      rules,
      schema, // merged schema + rules
      validateForm
    );
    setErrors(result ?? undefined);
  }

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: 400,
      }}
    >
      <h3>Hybrid Schema + Rules Example (Dynamic Extend)</h3>

      <input
        value={values.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
        placeholder="Email"
      />
      <RenderErrors errors={cleanErrorsDeep({ email: errors?.email })} />

      <input
        value={values.password}
        onChange={(e) => setValues({ ...values, password: e.target.value })}
        placeholder="Password"
        type="password"
      />
      <RenderErrors errors={cleanErrorsDeep({ password: errors?.password })} />

      <input
        value={values.age ?? ""}
        onChange={(e) => setValues({ ...values, age: Number(e.target.value) })}
        placeholder="Age"
        type="number"
      />
      <RenderErrors errors={cleanErrorsDeep({ age: errors?.age })} />

      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
}
