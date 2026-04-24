import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export function LuxuryButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx("btn btn-gold", className)} {...props}>
      {children}
    </button>
  );
}
