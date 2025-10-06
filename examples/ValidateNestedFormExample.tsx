import { useState } from "react";
import {
  validateNestedForm,
  required,
  email,
  isNumeric,
  ValidationErrors,
  getNestedError,
  RenderErrors,
} from "smart-validator";

type FormValues = {
  user: {
    email: string;
    age: string;
  };
};

export default function ValidateNestedFormExample() {
  const [values, setValues] = useState<FormValues>({
    user: { email: "" },
    address: {
      home: { city: "", district: "" },
      work: { city: "Istanbul", district: "" },
    },
  });

  const [errors, setErrors] = useState<ValidationErrors<FormValues>>({});

  const rules = {
    user: {
      email: {
        rules: [required(), email()],
      },
      age: {
        rules: [required(), isNumeric()],
      },
    },
  };

  const handleSubmit = async () => {
    const result = await validateNestedForm(values, rules);
    console.log(errors);

    setErrors(result || {});
  };

  const emailError = getNestedError(errors, "user.email");
  const ageError = getNestedError(errors, "user.age");
  return (
    <div>
      <input
        placeholder="Email"
        value={values.user.email}
        onChange={(e) =>
          setValues((v) => ({
            ...v,
            user: { ...v.user, email: e.target.value },
          }))
        }
      />
      {emailError && <RenderErrors errors={{ email: emailError.message }} />}
      <input
        placeholder="Age"
        value={values.user.age}
        onChange={(e) =>
          setValues((v) => ({
            ...v,
            user: { ...v.user, age: e.target.value },
          }))
        }
      />
      {ageError && <RenderErrors errors={{ age: ageError.message }} />}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
