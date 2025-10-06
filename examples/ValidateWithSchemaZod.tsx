import { useState } from "react";
import { z } from "zod";
import { validateWithSchema, ValidationErrors } from "smart-validator";

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  age: z
    .string()
    .regex(/^\d+$/, "Age must be a number")
    .transform(Number)
    .refine((val) => val >= 18, { message: "Must be 18 or older" }),
});

export default function WithSchemaExampleZod() {
  const [values, setValues] = useState({ email: "", age: "" });
  const [errors, setErrors] = useState<ValidationErrors<typeof values>>({});

  const handleSubmit = async () => {
    const result = await validateWithSchema(formSchema, values);
    setErrors(result || {});
  };

  return (
    <div>
      <h3>Full Schema Validation</h3>
      <input
        placeholder="Email"
        value={values.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
      />
      <div>{errors.email?.message}</div>

      <input
        placeholder="Age"
        value={values.age}
        onChange={(e) => setValues({ ...values, age: e.target.value })}
      />
      <div>{errors.age?.message}</div>

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
