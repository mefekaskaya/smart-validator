import { useState } from "react";
import {
  required,
  minLength,
  validateForm,
  RenderErrors,
  cleanErrorsDeep,
} from "smart-validator";
import type { ValidationErrors, SyncValidationRules } from "smart-validator";

type FormValues = {
  email: string;
  password: string;
};

export default function ValidateCustomMessagesExample() {
  const [values, setValues] = useState<FormValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<
    ValidationErrors<FormValues> | undefined
  >();

  // 🧩 Each rule can take a custom message
  const rules: SyncValidationRules<FormValues> = {
    email: {
      rules: [required("Email cannot be empty!")],
    },
    password: {
      rules: [
        required("Password cannot be blank!"),
        minLength(6, "Password must be at least 6 characters long."),
      ],
    },
  };

  function handleSubmit() {
    const result = validateForm(values, rules);
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
      <h3>Custom Messages Example</h3>

      <input
        placeholder="Email"
        value={values.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
      />
      <RenderErrors errors={cleanErrorsDeep({ email: errors?.email })} />

      <input
        placeholder="Password"
        type="password"
        value={values.password}
        onChange={(e) => setValues({ ...values, password: e.target.value })}
      />
      <RenderErrors errors={cleanErrorsDeep({ password: errors?.password })} />

      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
}
