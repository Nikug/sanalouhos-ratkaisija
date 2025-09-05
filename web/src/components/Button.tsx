import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer",
  secondary: "bg-gray-600 hover:bg-gray-700 text-white cursor-pointer",
  disabled: "bg-gray-600 text-white opacity-50 cursor-not-allowed",
} as const;

interface AdditionalProps {
  variant?: keyof typeof variants;
}

export const Button = ({
  children,
  className,
  variant = "primary",
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & AdditionalProps) => {
  return (
    <button
      type="button"
      className={clsx(
        "rounded px-4 py-2 font-semibold shadow",
        variants[disabled ? "disabled" : variant],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
