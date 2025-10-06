import { useState } from "react";
import {
  validateNestedFormAsync,
  ValidationErrors,
  getNestedError,
  required,
  RenderErrors,
} from "smart-validator";

export default function AsyncNestedFormExample() {
  const [values, setValues] = useState({
    address: {
      home: { city: "", district: "" },
      work: { city: "", district: "" },
    },
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<ValidationErrors<typeof values>>({});

  const rules = {
    address: {
      home: {
        city: { rules: [required("Home city is required")] },
        district: { rules: [required("Home district is required")] },
      },
      work: {
        city: {
          rules: [
            async (v: string) => {
              await new Promise((r) => setTimeout(r, 200));
              if (!v) return "Work city is required";
              return null;
            },
          ],
        },
        district: {
          rules: [
            async (v: string) => {
              await new Promise((r) => setTimeout(r, 200));
              if (!v) return "Work district is required";
              return null;
            },
          ],
        },
      },
    },
    phoneNumber: {
      rules: [
        required("Phone number is required"),
        async (v: string) => {
          await new Promise((r) => setTimeout(r, 300));
          return /^\d{10}$/.test(v)
            ? null
            : "Phone number must be 10 digits long";
        },
      ],
    },
  };

  const handleChange =
    (path: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValues((prev) => {
        const updated = structuredClone(prev);
        const keys = path.split(".");
        let ref = updated as Record<string, unknown>;
        for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
        ref[keys[keys.length - 1]] = value;
        return updated;
      });
    };

  const handleSubmit = async () => {
    const result = await validateNestedFormAsync(values, rules);
    console.log("Errors returned:", JSON.stringify(result, null, 2));
    setErrors(result ?? {});
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
      <h3>Async Deep Nested Form Example</h3>

      <h4>🏠 Home Address</h4>
      <input
        placeholder="Home City"
        value={values.address.home.city}
        onChange={handleChange("address.home.city")}
      />
      {getNestedError(errors, "address.home.city") && (
        <RenderErrors
          errors={{
            homeCity: getNestedError(errors, "address.home.city")!.message,
          }}
        />
      )}

      <input
        placeholder="Home District"
        value={values.address.home.district}
        onChange={handleChange("address.home.district")}
      />
      {getNestedError(errors, "address.home.district") && (
        <RenderErrors
          errors={{
            homeDistrict: getNestedError(errors, "address.home.district")!
              .message,
          }}
        />
      )}

      <h4>💼 Work Address</h4>
      <input
        placeholder="Work City"
        value={values.address.work.city}
        onChange={handleChange("address.work.city")}
      />
      {getNestedError(errors, "address.work.city") && (
        <RenderErrors
          errors={{
            workCity: getNestedError(errors, "address.work.city")!.message,
          }}
        />
      )}

      <input
        placeholder="Work District"
        value={values.address.work.district}
        onChange={handleChange("address.work.district")}
      />
      {getNestedError(errors, "address.work.district") && (
        <RenderErrors
          errors={{
            workDistrict: getNestedError(errors, "address.work.district")!
              .message,
          }}
        />
      )}

      <h4>📞 Contact</h4>
      <input
        placeholder="Phone Number"
        value={values.phoneNumber}
        onChange={handleChange("phoneNumber")}
      />
      {getNestedError(errors, "phoneNumber") && (
        <RenderErrors
          errors={{
            phoneNumber: getNestedError(errors, "phoneNumber")!.message,
          }}
        />
      )}

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
