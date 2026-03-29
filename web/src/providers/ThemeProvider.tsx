// Kept as empty provider for compatibility - no dark mode
import { type ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useTheme() {
  return { theme: "light" as const, toggleTheme: () => {} };
}
