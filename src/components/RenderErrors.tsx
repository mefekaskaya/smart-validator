import React from "react";

// types.ts or errors.ts in package
export type RenderableErrorLeaf = string;

export interface RenderableErrorMap {
  [key: string]: RenderableErrorLeaf | RenderableErrorMap;
}

export type RenderableError = RenderableErrorLeaf | RenderableErrorMap;

export interface RenderErrorsProps {
  errors?: RenderableError | null;
}

export const RenderErrors: React.FC<RenderErrorsProps> = ({ errors }) => {
  if (!errors) return null;

  if (typeof errors === "string") {
    return (
      <ul style={{ color: "red" }}>
        <li>{errors}</li>
      </ul>
    );
  }

  // For future nested support
  return (
    <ul style={{ color: "red" }}>
      {Object.entries(errors).map(([key, val]) => (
        <li key={key}>
          {typeof val === "string" ? val : <RenderErrors errors={val} />}
        </li>
      ))}
    </ul>
  );
};
