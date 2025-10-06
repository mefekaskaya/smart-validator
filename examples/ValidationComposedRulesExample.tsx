import { useState } from "react";
import {
  combineRules,
  email,
  minLength,
  RenderErrors,
  required,
  validateForm,
  ValidationErrors,
} from "smart-validator";
const requiredEmail = combineRules([required(), email()]);
const requiredPassword = combineRules([required(), minLength(6)]);

const rules = {
  email: {
    rules: [requiredEmail],
  },
  password: {
    rules: [requiredPassword],
  },
};

export default function ValidateComposedRulesExample() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<ValidationErrors<typeof values> | null>(
    null
  );

  async function handleSubmit() {
    const result = await validateForm(values, rules);
    setErrors(result ?? null);
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input
        value={values.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
        placeholder="Email"
      />
      <RenderErrors errors={errors?.email?.message} />
      <input
        value={values.password}
        onChange={(e) => setValues({ ...values, password: e.target.value })}
        placeholder="Password"
      />
      <RenderErrors errors={errors?.password?.message} />
      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
}
