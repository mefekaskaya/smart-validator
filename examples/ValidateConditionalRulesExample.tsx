import { useState } from "react";
import {
  cleanErrorsDeep,
  RenderErrors,
  validateForm,
  ValidationErrors,
} from "smart-validator";
import { getRules } from "../utils";

type FormValues = {
  subscribe: boolean;
  email: string;
};

export default function ValidateConditionalRulesExample() {
  const [values, setValues] = useState({ subscribe: false, email: "" });
  const [errors, setErrors] = useState<ValidationErrors<FormValues> | null>(
    null
  );

  function handleSubmit() {
    const result = validateForm(values, getRules(values));
    setErrors(result);
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <label>
        <input
          type="checkbox"
          checked={values.subscribe}
          onChange={(e) =>
            setValues({ ...values, subscribe: e.target.checked })
          }
        />
        Subscribe
      </label>

      <input
        value={values.email}
        placeholder="Email"
        onChange={(e) => setValues({ ...values, email: e.target.value })}
      />
      <RenderErrors errors={cleanErrorsDeep(errors)} />

      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
}
