import type { ReactNode } from "react";
import "./sign-in.css";

export default function SignInLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <div className="sign-in-page">{children}</div>;
}
