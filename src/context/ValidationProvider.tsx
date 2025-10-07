import React, { createContext, useContext, useState, ReactNode } from "react";
import { ValidationErrors } from "../types.js";

interface ValidationContextType<T> {
  errors: ValidationErrors<T>;
  setErrors: (errors: ValidationErrors<T>) => void;
}

const ValidationContext = createContext<ValidationContextType<any> | undefined>(
  undefined
);

export function ValidationProvider<T>({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});

  return (
    <ValidationContext.Provider value={{ errors, setErrors }}>
      {children}
    </ValidationContext.Provider>
  );
}

export function useValidation<T>() {
  const context = useContext(ValidationContext);

  // Check if context is undefined (instead of null)
  if (!context) {
    throw new Error("useValidation must be used within a ValidationProvider");
  }
  return context;
}
