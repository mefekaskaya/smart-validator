import { useState } from "react";
import {
  validateNestedFormBatchAsync,
  getNestedError,
  ValidationErrors,
} from "smart-validator";

export default function AsyncBatchNestedFormExample() {
  // 🧩 Deep nested structure
  const [values, setValues] = useState({
    user: {
      profile: {
        username: "",
      },
    },
    address: {
      city: "",
      zip: "",
    },
  });

  const [errors, setErrors] = useState<ValidationErrors<typeof values>>({});

  // 🧩 Validation rules
  const rules = {
    user: {
      profile: {
        username: {
          rules: [
            async (v: string) => {
              await new Promise((r) => setTimeout(r, 300));
              if (!v) return "Username is required";
              if (v.length < 4) return "Too short";
              // 💥 Simulate network/server failure
              throw new Error(
                "Server failed while checking username availability"
              );
            },
            async (v: string) => {
              await new Promise((r) => setTimeout(r, 300));
              return v === "admin" ? "Username 'admin' is reserved" : null;
            },
          ],
        },
      },
    },
    address: {
      city: {
        rules: [
          async (v: string) => {
            await new Promise((r) => setTimeout(r, 600));
            if (!v) return "City is required";
            return v.length < 3 ? "City name too short" : null;
          },
        ],
      },
      zip: {
        rules: [
          async (v: string) => {
            await new Promise((r) => setTimeout(r, 1000));
            if (!v) return "ZIP code is required";
            if (!/^\d{5}$/.test(v)) return "ZIP code must be 5 digits";
            return null;
          },
        ],
      },
    },
  };

  // 🧩 Deep path update helper
  const handleChange =
    (path: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValues((prev) => {
        const updated = structuredClone(prev);
        const keys = path.split(".");
        let ref = updated as Record<string, unknown>;
        for (let i = 0; i < keys.length - 1; i++) {
          ref = ref[keys[i]];
        }
        ref[keys[keys.length - 1]] = value;
        return updated;
      });
    };

  // 🧩 Submit handler
  const handleSubmit = async () => {
    console.log("⏳ Starting parallel deep validation...");
    const result = await validateNestedFormBatchAsync(values, rules);
    console.log("✅ Validation result:", result);
    setErrors(result || {});
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: 500,
      }}
    >
      <h3>Async Batch Nested Form Example</h3>

      {/* 🧍 User Section */}
      <h4>👤 User Profile</h4>
      <input
        placeholder="Username"
        value={values.user.profile.username}
        onChange={handleChange("user.profile.username")}
      />
      <div style={{ color: "red" }}>
        {getNestedError(errors, "user.profile.username")?.message}
      </div>

      {/* 🏠 Address Section */}
      <h4>🏠 Address</h4>
      <input
        placeholder="City"
        value={values.address.city}
        onChange={handleChange("address.city")}
      />
      <div style={{ color: "red" }}>
        {getNestedError(errors, "address.city")?.message}
      </div>

      <input
        placeholder="ZIP Code"
        value={values.address.zip}
        onChange={handleChange("address.zip")}
      />
      <div style={{ color: "red" }}>
        {getNestedError(errors, "address.zip")?.message}
      </div>

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
