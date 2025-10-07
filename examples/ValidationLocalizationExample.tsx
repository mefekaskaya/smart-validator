import { useState } from "react";
import {
  minLength,
  RenderErrors,
  required,
  validateForm,
  ValidationErrors,
  setCustomTranslations,
} from "smart-validator";

const trMessages = {
  required: "Bu alan zorunludur",
  minLength: "En az {min} karakter olmalıdır",
};

setCustomTranslations("tr", trMessages);

const rules = {
  name: {
    rules: [required()],
  },
  bio: {
    rules: [minLength(5)],
  },
};

export default function ValidateLocalizationExample() {
  const [values, setValues] = useState({ name: "", bio: "" });
  const [errors, setErrors] = useState<ValidationErrors<typeof values> | null>(
    {}
  );

  function handleSubmit() {
    const result = validateForm(values, rules, "tr");
    setErrors(result);
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input
        value={values.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
      />
      <RenderErrors errors={{ name: errors?.name?.message || "" }} />

      <input
        value={values.bio}
        onChange={(e) => setValues({ ...values, bio: e.target.value })}
      />
      <RenderErrors errors={{ bio: errors?.bio?.message || "" }} />

      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
}
