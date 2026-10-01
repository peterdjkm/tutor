import { ComponentPropsWithoutRef } from "react";

export function Logo(props: ComponentPropsWithoutRef<"div">) {
  const { className, ...rest } = props;
  return (
    <div
      {...rest}
      className={`flex items-center justify-center text-2xl font-bold text-blue-500 ${className ?? ""}`}
    >
      Tutor
    </div>
  );
}
