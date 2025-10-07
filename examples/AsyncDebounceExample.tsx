import { useState } from "react";
import {
  validateFormAsync,
  required,
  email,
  RenderErrors,
  ValidationErrors,
} from "smart-validator";
import { isEmailAvailable } from "../utils";

export default function AsyncDebounceExample() {
  const [values, setValues] = useState({ email: "" });
  const [errors, setErrors] = useState<ValidationErrors<typeof values>>({});

  const rules = {
    email: {
      rules: [required(), email(), isEmailAvailable],
      validateOn: "change",
    },
  };

  async function handleChange(value: string) {
    setValues({ email: value });
    const result = await validateFormAsync({ email: value }, rules);
    setErrors(result ?? {});
  }

  return (
    <div>
      <h3>debouncedValidateAsync Example</h3>
      <input
        placeholder="Email"
        value={values.email}
        onChange={(e) => handleChange(e.target.value)}
      />
      <RenderErrors errors={errors.email?.message} />
    </div>
  );
}
