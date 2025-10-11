import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, className, ...rest }: Props) {
  return (
    <label className="block text-left w-full">
      <span className="block mb-1 text-sm font-semibold">{label}</span>
      <input
        className={`block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 ${
          className || ""
        }`}
        {...rest}
      />
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : null}
    </label>
  );
}
