import { useState } from "react";
import { validateForm, required, email, isNumeric } from "smart-validator";
import type { ValidationErrors } from "smart-validator";

export default function ValidateFormExample() {
  const [values, setValues] = useState({ email: "", age: "" });
  const [errors, setErrors] = useState<ValidationErrors<typeof values>>({});

  const rules = {
    email: {
      rules: [required(), email()],
    },
    age: {
      rules: [required(), isNumeric()],
    },
  };
  const handleSubmit = async () => {
    const result = await validateForm(values, rules);
    setErrors(result || {});
  };

  return (
    <div>
      <input
        placeholder="Email"
        value={values.email}
        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
      />
      <div>{errors?.email?.message}</div>

      <input
        placeholder="Age"
        value={values.age}
        onChange={(e) => setValues((v) => ({ ...v, age: e.target.value }))}
      />
      <div>{errors?.age?.message}</div>

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
