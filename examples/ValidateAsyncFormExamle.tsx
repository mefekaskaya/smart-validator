import { useState } from "react";
import { validateFormAsync, ValidationErrors } from "smart-validator";

// Define the form shape
type FormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};


export default function AsyncFormExampleExample() {
  const [values, setValues] = useState<FormValues>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ValidationErrors<FormValues>>({});

  const rules = {
    username: {
      rules: [
        async (value: string) => {
          if (!value) return "Username is required";
          await new Promise((res) => setTimeout(res, 300));
          return value === "taken" ? "Username is already taken" : null;
        },
      ],
    },
    email: {
      rules: [
        async (value: string) => {
          if (!value) return "Email is required";
          if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format";
          await new Promise((res) => setTimeout(res, 300));
          return value === "test@example.com" ? "Email is already registered" : null;
        },
      ],
    },
    password: {
      rules: [
        (value: string) => {
          if (!value) return "Password is required";
          return value.length < 6 ? "Password must be at least 6 characters" : null;
        },
      ],
    },
    confirmPassword: {
      rules: [
        (value: string, _field: keyof FormValues, allValues: FormValues) => {
          if (!value) return "Please confirm your password";
          return value !== allValues.password ? "Passwords do not match" : null;
        },
      ],
    },
  };

  const handleChange = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    const result = await validateFormAsync(values, rules);
    setErrors(result ?? {});
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 400 }}>
      <input
        placeholder="Username"
        value={values.username}
        onChange={handleChange("username")}
      />
      <div>{errors.username?.message}</div>

      <input
        placeholder="Email"
        value={values.email}
        onChange={handleChange("email")}
      />
      <div>{errors.email?.message}</div>

      <input
        type="password"
        placeholder="Password"
        value={values.password}
        onChange={handleChange("password")}
      />
      <div>{errors.password?.message}</div>

      <input
        type="password"
        placeholder="Confirm Password"
        value={values.confirmPassword}
        onChange={handleChange("confirmPassword")}
      />
      <div>{errors.confirmPassword?.message}</div>

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
