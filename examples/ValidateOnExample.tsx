import { useState } from "react";
import {
  validateForm,
  required,
  email,
  minLength,
  RenderErrors,
  ValidationErrors,
} from "smart-validator";

export default function ValidateOnExample() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<ValidationErrors<typeof values>>({});

  const rules = {
    email: {
      rules: [required(), email()],
      validateOn: "change", // 🔹 Validate instantly while typing
    },
    phone: {
      rules: [required(), minLength(10)],
      validateOn: "blur", // 🔹 Validate only when leaving field
    },
    password: {
      rules: [required(), minLength(8)],
      validateOn: "submit", // 🔹 Validate only when submitting form
    },
  };

  function handleChange(field: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));

    if (rules[field].validateOn === "change") {
      const result = validateForm(
        { [field]: value } as unknown,
        {
          [field]: rules[field],
        } as unknown
      );

      setErrors((prev) => {
        const updated = { ...prev };
        if (result && Object.keys(result).length > 0) {
          // 🔹 keep the new error
          return { ...updated, ...(result ?? {}) };
        } else {
          // 🔹 clear the field’s old error
          delete updated[field as string];
          return updated;
        }
      });
    }
  }

  function handleBlur(field: keyof typeof values) {
    if (rules[field].validateOn === "blur") {
      const result = validateForm(
        { [field]: values[field] } as unknown,
        {
          [field]: rules[field],
        } as unknown
      );

      setErrors((prev) => ({
        ...prev,
        ...(result ?? {}),
      }));
    }
  }

  // 🔹 Runs only on submit (validates all fields regardless of mode)
  function handleSubmit() {
    const result = validateForm(values, rules);
    setErrors(result ?? {});
  }

  function handleSubmit() {
    const result = validateForm(values, rules);
    setErrors(result ?? {});
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h3>validateOn Example</h3>

      <input
        placeholder="Email"
        value={values.email}
        onChange={(e) => handleChange("email", e.target.value)}
      />
      <RenderErrors errors={errors.email?.message} />

      <input
        placeholder="Phone (validateOn: blur)"
        value={values.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
        onBlur={() => handleBlur("phone")}
      />
      <RenderErrors errors={errors.phone?.message} />

      <input
        placeholder="Password"
        value={values.password}
        onChange={(e) => handleChange("password", e.target.value)}
      />
      <RenderErrors errors={errors.password?.message} />

      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
}
