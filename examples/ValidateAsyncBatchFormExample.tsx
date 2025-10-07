// AsyncBatchFormExample.tsx
import { useState } from "react";
import { validateFormAsyncBatch, ValidationErrors } from "smart-validator";

export default function AsyncBatchFormExample() {
  const [values, setValues] = useState({
    username: "",
    email: "",
    age: "",
  });
  const [errors, setErrors] = useState<ValidationErrors<typeof values>>({});

  const rules = {
    username: {
      rules: [
        async (v: string) => {
          await new Promise((r) => setTimeout(r, 300));
          if (!v) return "Username is required";
          return v.length < 4 ? "Must be at least 4 characters" : null;
        },
        async (v: string) => {
          await new Promise((r) => setTimeout(r, 300));
          return v === "admin" ? "Username 'admin' is reserved" : null;
        },
      ],
    },
    email: {
      rules: [
        async (v: string) => {
          await new Promise((r) => setTimeout(r, 500));
          if (!v) return "Email is required";
          return /\S+@\S+\.\S+/.test(v) ? null : "Invalid email format";
        },
      ],
    },
    age: {
      rules: [
        async (v: string) => {
          await new Promise((r) => setTimeout(r, 800));
          if (!v) return "Age is required";
          const n = Number(v);
          if (isNaN(n)) return "Age must be a number";
          if (n < 18) return "You must be at least 18";
          return null;
        },
      ],
    },
  };

  const handleSubmit = async () => {
    console.log("⏳ Validating...");
    const result = await validateFormAsyncBatch(values, rules);
    console.log("✅ Result:", result);
    setErrors(result ?? {});
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: 400,
      }}
    >
      <h3>Async Batch Form Example</h3>

      <input
        placeholder="Username"
        value={values.username}
        onChange={(e) => setValues((v) => ({ ...v, username: e.target.value }))}
      />
      <div style={{ color: "red" }}>{errors.username?.message}</div>

      <input
        placeholder="Email"
        value={values.email}
        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
      />
      <div style={{ color: "red" }}>{errors.email?.message}</div>

      <input
        placeholder="Age"
        value={values.age}
        onChange={(e) => setValues((v) => ({ ...v, age: e.target.value }))}
      />
      <div style={{ color: "red" }}>{errors.age?.message}</div>

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

/*
/**
 * AsyncBatchFormExample
 *
 * Demonstrates how to use `validateFormAsyncBatch` to run multiple asynchronous
 * validation rules in parallel for faster overall feedback.
 *
 * Unlike `validateFormAsync`, which validates each rule sequentially
 * (awaiting each rule before moving to the next),
 * this batch version launches all async rules at once using `Promise.all`
 * and aggregates their results when all finish.
 *
 * 💡 Use this pattern when:
 * - You have multiple independent async checks (e.g. username availability,
 *   profanity filters, or external API calls).
 * - You want to reduce total validation latency by resolving all checks concurrently.
 *
 * 🔧 Internal Concept:
 * ```ts
 * // Conceptual pattern used by validateFormAsyncBatch
 * const results = await Promise.all(rules.map(rule => rule(value)));
 * const firstError = results.find(msg => msg !== null);
 * if (firstError) {
 *   errors[field] = { message: firstError };
 * }
 * ```
 *
 * 🧠 Example Behavior:
 * - "abc" → "Username must be at least 4 characters"
 * - "admin" → "Username 'admin' is reserved"
 * - Both rules execute concurrently (~300ms total instead of 600ms sequentially)
 */
